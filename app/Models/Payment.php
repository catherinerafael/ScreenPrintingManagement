<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id', 'payment_method_id', 'amount', 'status',
        'payment_proof', 'gateway_ref', 'verified_by', 'verified_at', 'notes',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
