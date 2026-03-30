<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemSize extends Model
{
    protected $fillable = ['order_item_id', 'size', 'sleeve_type', 'qty'];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
