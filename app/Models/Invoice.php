<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'order_id', 'invoice_number', 'amount', 'type', 'status',
        'payment_url', 'payment_method', 'paid_at',
        'payment_method_id', 'payment_notes',
    ];

    protected $casts = [
        'amount'   => 'decimal:2',
        'paid_at'  => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
