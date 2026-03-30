<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'guest_token', 'guest_name', 'guest_email', 'guest_phone',
        'order_number', 'status', 'delivery_method',
        'subtotal', 'discount', 'shipping_cost', 'total_amount',
        'shipping_address', 'awb_number',
        'dp_paid_at', 'processing_at', 'ready_at', 'shipped_at', 'completed_at',
    ];

    protected $casts = [
        'dp_paid_at'    => 'datetime',
        'processing_at' => 'datetime',
        'ready_at'      => 'datetime',
        'shipped_at'    => 'datetime',
        'completed_at'  => 'datetime',
        'subtotal'      => 'decimal:2',
        'discount'      => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_amount'  => 'decimal:2',
    ];

    /** Nama pemesan (dari akun atau guest) */
    public function getCustomerNameAttribute(): string
    {
        return $this->user?->name ?? $this->guest_name ?? '-';
    }

    /** Email pemesan */
    public function getCustomerEmailAttribute(): string
    {
        return $this->user?->email ?? $this->guest_email ?? '-';
    }

    /** Nomor WA pemesan */
    public function getCustomerPhoneAttribute(): string
    {
        return $this->user?->phone ?? $this->guest_phone ?? '-';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
