<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\Material;
use App\Models\PrintMethod;
use App\Models\ProductPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemSize;
use App\Models\Invoice;
use App\Models\PaymentMethod;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@sablon.com'],
            [
                'name' => 'Admin Boss',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
            ]
        );

        $reseller = User::firstOrCreate(
            ['email' => 'reseller@sablon.com'],
            [
                'name' => 'Reseller Setia',
                'password' => Hash::make('password'),
                'role' => 'reseller',
                'phone' => '081234567891',
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@sablon.com'],
            [
                'name' => 'Klien Biasa',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '081234567892',
                'address' => 'Jl. Mawar No. 123, Jakarta',
            ]
        );

        // 2. Payment Methods
        PaymentMethod::firstOrCreate(['name' => 'BCA'], [
            'type' => 'bank_transfer', 'account_number' => '1234567890',
            'account_name' => 'Sablon Custom Store', 'is_active' => true,
        ]);
        PaymentMethod::firstOrCreate(['name' => 'Mandiri'], [
            'type' => 'bank_transfer', 'account_number' => '0987654321',
            'account_name' => 'Sablon Custom Store', 'is_active' => true,
        ]);
        PaymentMethod::firstOrCreate(['name' => 'QRIS'], [
            'type' => 'ewallet', 'account_number' => null,
            'account_name' => 'Sablon Custom Store', 'is_active' => true,
        ]);
        PaymentMethod::firstOrCreate(['name' => 'Cash'], [
            'type' => 'cash', 'is_active' => true,
        ]);

        // 3. Product
        $product = Product::firstOrCreate(
            ['slug' => 'kaos-sablon-custom'],
            [
                'name' => 'Kaos Sablon Custom',
                'description' => 'Kaos custom sablon manual berkualitas tinggi',
                'is_active' => true,
            ]
        );

        // 3. Materials
        $mat30s = Material::firstOrCreate(['product_id' => $product->id, 'name' => 'Cotton 30s'], ['additional_price' => 0]);
        $mat24s = Material::firstOrCreate(['product_id' => $product->id, 'name' => 'Cotton 24s'], ['additional_price' => 5000]);
        $mat20s = Material::firstOrCreate(['product_id' => $product->id, 'name' => 'Cotton 20s'], ['additional_price' => 5000]);

        // 4. Print Methods
        $printPlastisol = PrintMethod::firstOrCreate(['product_id' => $product->id, 'name' => 'Plastisol'], ['additional_price' => 0]);
        $printDischarge = PrintMethod::firstOrCreate(['product_id' => $product->id, 'name' => 'Discharge'], ['additional_price' => 15000]);
        $printRubber = PrintMethod::firstOrCreate(['product_id' => $product->id, 'name' => 'Rubber'], ['additional_price' => -10000]);

        // 5. Price Tiers
        ProductPriceTier::firstOrCreate(['product_id' => $product->id, 'min_qty' => 1], ['max_qty' => 5, 'price' => 80000]);
        ProductPriceTier::firstOrCreate(['product_id' => $product->id, 'min_qty' => 6], ['max_qty' => 11, 'price' => 75000]);
        ProductPriceTier::firstOrCreate(['product_id' => $product->id, 'min_qty' => 12], ['max_qty' => 23, 'price' => 65000]);
        ProductPriceTier::firstOrCreate(['product_id' => $product->id, 'min_qty' => 24], ['max_qty' => 9999, 'price' => 60000]);

        // 6. Mock Order (1 Lusin Kaos Cotton 24s Plastisol Lengan Pendek + 1 Warna Desain + Size L)
        $orderNumber = 'SBLN-' . date('Ymd') . '-001';
        $order = Order::firstOrCreate(
            ['order_number' => $orderNumber],
            [
                'user_id' => $customer->id,
                'status' => 'pending_payment',
                'subtotal' => 840000,
                'discount' => 0,
                'shipping_cost' => 20000,
                'total_amount' => 860000,
                'shipping_address' => 'Jl. Mawar No. 123, Jakarta'
            ]
        );

        $orderItem = OrderItem::firstOrCreate(
            ['order_id' => $order->id],
            [
                'product_id' => $product->id,
                'material_id' => $mat24s->id,
                'print_method_id' => $printPlastisol->id,
                'qty' => 12,
                'color_count' => 1,
                'price_per_item' => 70000, // 65000 (tier 12 pcs) + 5000 (24s) + 0 (plastisol) + 0 (1 warna) (Sleeve fee handled dynamically depending on exact breakdown)
                'subtotal' => 840000,
                'notes' => 'Tolong disablon yang rapi ya boss'
            ]
        );

        // Add varying sizes AND sleeve_types for the 1 dozen (12 pcs) order
        OrderItemSize::firstOrCreate(['order_item_id' => $orderItem->id, 'size' => 'M', 'sleeve_type' => 'short'], ['qty' => 5]);
        OrderItemSize::firstOrCreate(['order_item_id' => $orderItem->id, 'size' => 'L', 'sleeve_type' => 'long'], ['qty' => 5]);
        // Let's assume XXL has an extra fee calculated in subtotal elsewhere. The logic handles saving the size/sleeve breakdown here.
        OrderItemSize::firstOrCreate(['order_item_id' => $orderItem->id, 'size' => 'XXL', 'sleeve_type' => 'short'], ['qty' => 2]);

        // 7. Mock Invoice (DP 50%) for Order 1
        Invoice::firstOrCreate(
            ['order_id' => $order->id, 'type' => 'dp'],
            [
                'invoice_number' => 'INV-DP-' . $orderNumber,
                'amount' => 430000, // 50% dari total 860k
                'status' => 'unpaid'
            ]
        );

        // 8. Mock Order (Offline / Pickup)
        $order2Number = 'SBLN-' . date('Ymd') . '-002';
        $order2 = Order::firstOrCreate(
            ['order_number' => $order2Number],
            [
                'user_id' => $customer->id,
                'status' => 'shipped', // Already picked up
                'delivery_method' => 'ambil_sendiri',
                'subtotal' => 160000,
                'discount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 160000,
                'shipping_address' => 'Diambil di Toko'
            ]
        );

        $order2Item = OrderItem::firstOrCreate(
            ['order_id' => $order2->id],
            [
                'product_id' => $product->id,
                'material_id' => $mat30s->id,
                'print_method_id' => $printPlastisol->id,
                'qty' => 2,
                'color_count' => 1,
                'price_per_item' => 80000,
                'subtotal' => 160000,
                'notes' => 'Diambil langsung besok'
            ]
        );

        OrderItemSize::firstOrCreate(['order_item_id' => $order2Item->id, 'size' => 'L', 'sleeve_type' => 'short'], ['qty' => 2]);

        Invoice::firstOrCreate(
            ['order_id' => $order2->id, 'type' => 'full_payment'],
            [
                'invoice_number' => 'INV-LNS-' . $order2Number,
                'amount' => 160000,
                'status' => 'paid',
                'payment_method' => 'Cash',
                'paid_at' => Carbon::now()
            ]
        );
    }
}
