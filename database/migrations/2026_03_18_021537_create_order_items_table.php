<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('print_method_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('qty');
            $table->integer('color_count')->default(1);
            $table->string('design_file_url')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('price_per_item', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
