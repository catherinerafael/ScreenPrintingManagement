<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'is_active'];

    public function priceTiers()
    {
        return $this->hasMany(ProductPriceTier::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function printMethods()
    {
        return $this->hasMany(PrintMethod::class);
    }
}
