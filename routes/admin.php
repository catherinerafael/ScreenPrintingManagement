<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
// Note: More controllers will be added later based on the roadmap

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // === DASHBOARD STATIS ===
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // === MODUL PESANAN (Fase 1) ===
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    
    // Fitur Edit Status
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.update.status');
    
    // Fitur Edit & Pelunasan Invoice
    Route::patch('/orders/{id}/invoice', [OrderController::class, 'updateInvoice'])->name('orders.update.invoice');
});
