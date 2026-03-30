<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'material_id', 'print_method_id', 
        'qty', 'color_count', 'design_file_url', 
        'notes', 'price_per_item', 'subtotal'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function printMethod()
    {
        return $this->belongsTo(PrintMethod::class);
    }

    public function sizes()
    {
        return $this->hasMany(OrderItemSize::class);
    }
}
