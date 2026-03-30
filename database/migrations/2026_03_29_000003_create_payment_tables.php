<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create payment_methods table first (invoices will FK to it)
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['bank_transfer', 'ewallet', 'cash', 'payment_gateway']);
            $table->string('name'); // e.g. "BCA", "Mandiri", "QRIS", "Midtrans"
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add payment columns to invoices
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete()->after('paid_at');
            $table->text('payment_notes')->nullable()->after('payment_method_id');
        });

        // Create payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'verified', 'failed'])->default('pending');
            $table->string('payment_proof')->nullable(); // file path bukti transfer
            $table->string('gateway_ref')->nullable();  // transaction ID dari payment gateway
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_method_id');
            $table->dropColumn('payment_notes');
        });
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_methods');
    }
};
