<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\OrderController;

// === LANDING ===
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// === PUBLIC ORDER ===
Route::get('/order', [OrderController::class, 'create'])->name('order.create');
Route::post('/order', [OrderController::class, 'store'])->name('order.store');
Route::get('/order/{orderNumber}/confirm', [OrderController::class, 'confirm'])->name('order.confirm');
Route::get('/track', [OrderController::class, 'track'])->name('order.track');
Route::get('/track/{identifier}', [OrderController::class, 'find'])->name('order.find');

// === AUTHENTICATED ===
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
