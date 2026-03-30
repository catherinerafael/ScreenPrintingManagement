<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Guest order support
            $table->string('guest_token')->nullable()->unique()->after('user_id');
            $table->string('guest_name')->nullable()->after('guest_token');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');

            // Make user_id nullable for guest orders
            $table->foreignId('user_id')->nullable()->change();

            // Make shipping_address nullable (for ambil_sendiri)
            $table->text('shipping_address')->nullable()->change();

            // Status timestamps for customer timeline tracking
            $table->timestamp('dp_paid_at')->nullable()->after('awb_number');
            $table->timestamp('processing_at')->nullable()->after('dp_paid_at');
            $table->timestamp('ready_at')->nullable()->after('processing_at');
            $table->timestamp('shipped_at')->nullable()->after('ready_at');
            $table->timestamp('completed_at')->nullable()->after('shipped_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'guest_token', 'guest_name', 'guest_email', 'guest_phone',
                'dp_paid_at', 'processing_at', 'ready_at', 'shipped_at', 'completed_at',
            ]);
            $table->text('shipping_address')->nullable(false)->change();
        });
    }
};
