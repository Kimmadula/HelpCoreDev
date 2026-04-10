<?php

use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\PageBlockController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SubsectionController;
use App\Http\Controllers\Admin\ImageUploadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:api'])->prefix('admin')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:manage content');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:manage products');
    Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('permission:manage products');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:manage products');

    // Sections
    Route::get('/products/{product}/sections', [SectionController::class, 'index'])->middleware('permission:manage content');
    Route::post('/products/{product}/sections', [SectionController::class, 'store'])->middleware('permission:manage products');
    Route::put('/sections/{section}', [SectionController::class, 'update'])->middleware('permission:manage products');
    Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->middleware('permission:manage products');
    Route::put('/products/{product}/sections/reorder', [SectionController::class, 'reorder'])->middleware('permission:manage products');

    // Subsections
    Route::get('/sections/{section}/subsections', [SubsectionController::class, 'index'])->middleware('permission:manage content');
    Route::post('/sections/{section}/subsections', [SubsectionController::class, 'store'])->middleware('permission:manage content');
    Route::put('/subsections/{subsection}', [SubsectionController::class, 'update'])->middleware('permission:manage content');
    Route::delete('/subsections/{subsection}', [SubsectionController::class, 'destroy'])->middleware('permission:delete content');
    Route::put('/sections/{section}/subsections/reorder', [SubsectionController::class, 'reorder'])->middleware('permission:manage content');

    // Blocks (under subsections)
    Route::get('/subsections/{subsection}/blocks', [PageBlockController::class, 'index'])->middleware('permission:manage content');
    Route::post('/subsections/{subsection}/blocks', [PageBlockController::class, 'store'])->middleware('permission:manage content');
    Route::put('/blocks/{block}', [PageBlockController::class, 'update'])->middleware('permission:manage content');
    Route::delete('/blocks/{block}', [PageBlockController::class, 'destroy'])->middleware('permission:delete content');
    Route::put('/subsections/{subsection}/blocks/reorder', [PageBlockController::class, 'reorder'])->middleware('permission:manage content');

    Route::post('/uploads/images', [ImageUploadController::class, 'store'])->middleware('permission:manage content');

    // Users
    Route::get('/roles', [\App\Http\Controllers\Admin\UserController::class, 'getRoles'])->middleware('permission:manage users');
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->middleware('permission:manage users');
    Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->middleware('permission:manage users');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->middleware('permission:manage users');
    Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->middleware('permission:manage users');
});
