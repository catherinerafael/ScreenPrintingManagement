<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintMethod extends Model
{
    protected $fillable = ['product_id', 'name', 'additional_price'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
