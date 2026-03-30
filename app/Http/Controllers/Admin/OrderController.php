<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index()
    {
        $orders = Order::with('customer')
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/orders/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * Display the specified order details
     */
    public function show($id)
    {
        $order = Order::with(['customer', 'items.product', 'invoices'])->findOrFail($id);

        return Inertia::render('admin/orders/Show', [
            'order' => $order
        ]);
    }

    /**
     * Update the global status of the order.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending_payment,paid,in_production,ready_to_ship,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    /**
     * Update nominal invoice / Konfirmasi Pembayaran
     */
    public function updateInvoice(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|string|in:unpaid,paid',
            'due_date' => 'nullable|date',
            'mark_as_paid' => 'boolean' // Checkbox manual proof of payment
        ]);

        $invoice = Invoice::where('order_id', $order->id)->where('id', $validated['invoice_id'])->firstOrFail();
        
        // Update basic nominal info
        $invoice->amount = $validated['amount'];
        $invoice->status = $validated['status'];
        
        if (isset($validated['due_date'])) {
            $invoice->due_date = $validated['due_date'];
        }

        // Handle manual manual payment logic
        if (!empty($validated['mark_as_paid'])) {
            $invoice->status = 'paid';
            $invoice->paid_at = now();
            $invoice->payment_method = 'manual';
        }

        $invoice->save();

        // Update overall order status if necessary
        if ($invoice->status === 'paid' && $order->status === 'pending_payment') {
            $order->update(['status' => 'paid']);
        }

        return back()->with('success', 'Invoice berhasil diperbarui.');
    }
}
