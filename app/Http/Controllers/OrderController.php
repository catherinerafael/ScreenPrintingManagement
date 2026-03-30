<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemSize;
use App\Models\Invoice;
use App\Models\PaymentMethod;
use App\Models\User;

class OrderController extends Controller
{
    /**
     * Halaman form order publik.
     */
    public function create()
    {
        $products = Product::with(['materials', 'printMethods', 'priceTiers'])
            ->where('is_active', true)
            ->get();

        $paymentMethods = PaymentMethod::active()->get();

        $authUser = Auth::user();
        $prefill = $authUser ? [
            'name'  => $authUser->name,
            'email' => $authUser->email,
            'phone' => $authUser->phone,
            'address' => $authUser->address,
            'role'  => $authUser->role,
        ] : null;

        return Inertia::render('order/Create', [
            'products'       => $products,
            'paymentMethods' => $paymentMethods,
            'prefill'        => $prefill,
        ]);
    }

    /**
     * Simpan order baru. Hitung harga di server-side untuk keamanan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|max:255',
            'phone'            => 'required|string|max:20',
            'address'          => 'required_if:delivery_method,kirim_kurir|nullable|string',
            'product_id'       => 'required|exists:products,id',
            'material_id'      => 'required|exists:materials,id',
            'print_method_id'  => 'required|exists:print_methods,id',
            'delivery_method'  => 'required|in:kirim_kurir,ambil_sendiri',
            'sizes'            => 'required|array|min:1',
            'sizes.*.size'     => 'required|string',
            'sizes.*.sleeve'   => 'required|in:short,long',
            'sizes.*.qty'      => 'required|integer|min:1',
            'notes'            => 'nullable|string|max:500',
        ]);

        // Hitung harga server-side
        $product = Product::with(['priceTiers', 'materials', 'printMethods'])->findOrFail($validated['product_id']);
        $material = $product->materials->firstWhere('id', $validated['material_id']);
        $printMethod = $product->printMethods->firstWhere('id', $validated['print_method_id']);

        $totalQty = collect($validated['sizes'])->sum('qty');

        // Cari tier harga yang sesuai
        $tier = $product->priceTiers
            ->first(fn($t) => $totalQty >= $t->min_qty && $totalQty <= $t->max_qty)
            ?? $product->priceTiers->sortByDesc('min_qty')->first();

        $basePrice    = $tier ? (float) $tier->price : 0;
        $materialAdd  = $material ? (float) $material->additional_price : 0;
        $printAdd     = $printMethod ? (float) $printMethod->additional_price : 0;

        $subtotal = 0;
        foreach ($validated['sizes'] as $sz) {
            $sleeveFee = $sz['sleeve'] === 'long' ? 5000 : 0;
            $sizeFee   = in_array($sz['size'], ['XXL', 'XXXL']) ? 5000 : 0;
            $pricePerItem = $basePrice + $materialAdd + $printAdd + $sleeveFee + $sizeFee;
            $subtotal += $pricePerItem * $sz['qty'];
        }

        $shippingCost = $validated['delivery_method'] === 'kirim_kurir' ? 20000 : 0;
        $totalAmount  = $subtotal + $shippingCost;
        $dpAmount     = round($totalAmount * 0.5);

        // Cek apakah email sudah terdaftar
        $existingUser = User::where('email', $validated['email'])->first();

        // Generate order number
        $todayCount = Order::whereDate('created_at', today())->count() + 1;
        $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . str_pad($todayCount, 3, '0', STR_PAD_LEFT);

        DB::transaction(function () use (
            $validated, $existingUser, $orderNumber,
            $subtotal, $shippingCost, $totalAmount, $dpAmount,
            $product, $material, $printMethod, $totalQty
        ) {
            // Buat order
            $order = Order::create([
                'user_id'         => $existingUser?->id,
                'guest_token'     => $existingUser ? null : Str::random(40),
                'guest_name'      => $existingUser ? null : $validated['name'],
                'guest_email'     => $existingUser ? null : $validated['email'],
                'guest_phone'     => $existingUser ? null : $validated['phone'],
                'order_number'    => $orderNumber,
                'status'          => 'pending_payment',
                'delivery_method' => $validated['delivery_method'],
                'subtotal'        => $subtotal,
                'discount'        => 0,
                'shipping_cost'   => $shippingCost,
                'total_amount'    => $totalAmount,
                'shipping_address' => $validated['delivery_method'] === 'ambil_sendiri'
                    ? 'Diambil di Toko'
                    : $validated['address'],
            ]);

            // Buat order item
            $orderItem = OrderItem::create([
                'order_id'        => $order->id,
                'product_id'      => $product->id,
                'material_id'     => $material->id,
                'print_method_id' => $printMethod->id,
                'qty'             => $totalQty,
                'color_count'     => 1,
                'price_per_item'  => $subtotal / $totalQty,
                'subtotal'        => $subtotal,
                'notes'           => $validated['notes'] ?? null,
            ]);

            // Buat breakdown ukuran
            foreach ($validated['sizes'] as $sz) {
                OrderItemSize::create([
                    'order_item_id' => $orderItem->id,
                    'size'          => $sz['size'],
                    'sleeve_type'   => $sz['sleeve'],
                    'qty'           => $sz['qty'],
                ]);
            }

            // Buat invoice DP
            Invoice::create([
                'order_id'       => $order->id,
                'invoice_number' => 'INV-DP-' . $orderNumber,
                'amount'         => $dpAmount,
                'type'           => 'dp',
                'status'         => 'unpaid',
            ]);

            $this->orderNumber = $orderNumber;
            $this->guestToken  = $order->guest_token;
        });

        // Redirect ke halaman konfirmasi
        $redirectUrl = route('order.confirm', $orderNumber);

        // Jika guest, sertakan token di URL
        if (! $existingUser) {
            $order = Order::where('order_number', $orderNumber)->first();
            $redirectUrl = route('order.confirm', [
                'orderNumber' => $orderNumber,
                'token'       => $order->guest_token,
            ]);
        }

        return redirect($redirectUrl);
    }

    /**
     * Halaman konfirmasi setelah order berhasil dibuat.
     */
    public function confirm(Request $request, string $orderNumber)
    {
        $order = Order::with(['items.product', 'items.sizes', 'invoices'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Validasi akses: login sebagai pemilik, atau punya token yang valid
        $canAccess = Auth::check() && Auth::id() === $order->user_id
            || ($order->guest_token && $request->get('token') === $order->guest_token);

        if (! $canAccess) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $paymentMethods = PaymentMethod::active()->get();

        return Inertia::render('order/Confirm', [
            'order'          => $order,
            'invoice'        => $order->invoices->firstWhere('type', 'dp'),
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Halaman form input tracking order.
     */
    public function track()
    {
        return Inertia::render('order/Track');
    }

    /**
     * Cari order berdasarkan Order Number atau Invoice Number.
     */
    public function find(Request $request, string $identifier)
    {
        // Cari di orders
        $order = Order::with(['items.product', 'items.sizes', 'invoices'])
            ->where('order_number', $identifier)
            ->first();

        // Kalau tidak ketemu, cari via invoice number
        if (! $order) {
            $invoice = Invoice::where('invoice_number', $identifier)->with('order.items.product', 'order.items.sizes', 'order.invoices')->first();
            $order = $invoice?->order;
        }

        if (! $order) {
            return back()->withErrors(['identifier' => 'Order atau invoice tidak ditemukan.']);
        }

        return Inertia::render('order/Track', [
            'order'   => $order,
            'invoice' => $order->invoices->firstWhere('type', 'dp'),
        ]);
    }
}
