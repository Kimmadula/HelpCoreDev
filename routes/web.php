<?php

// Admin Controllers are used in Admin Routes (routes/admin.php)

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/help-desk', function () {
    return Inertia::render('Article');
})->name('help');

Route::get('/help/{productSlug}', function (string $productSlug) {
    return Inertia::render('Article', [
        'productSlug' => $productSlug,
    ]);
})->name('help.product');

Route::get('/dashboard', function () {
    return redirect()->route('admin.products');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SubsectionController;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/products', fn () => Inertia::render('Admin/ProductsIndex'))->name('admin.products')->middleware('permission:manage content');

    Route::get('/products/{product}/sections', [ProductController::class, 'showSections'])->name('admin.sections')->middleware('permission:manage content');

    Route::get('/sections/{section}/subsections', [SectionController::class, 'showSubsections'])->name('admin.subsections')->middleware('permission:manage content');

    Route::get('/subsections/{subsection}/edit', [SubsectionController::class, 'edit'])->name('admin.subsection.edit')->middleware('permission:manage content');

    Route::get('/users', function () {
        return Inertia::render('Admin/UsersIndex');
    })->name('admin.users')->middleware('permission:manage users');
});


// Admin API routes are now in routes/admin.php

require __DIR__.'/auth.php';
