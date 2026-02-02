<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicHelpController;
use App\Models\Product;

Route::get('/help/{productSlug}/nav', [PublicHelpController::class, 'navigation']);
Route::get('/help/subsections/{subsection}', [PublicHelpController::class, 'subsection']);

Route::get('/help/products', function () {
    return Product::query()
        ->where('is_published', true)
        ->orderBy('name')
        ->get(['id', 'name', 'slug']);
});

/*
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PageBlockController;

Route::middleware('auth')->prefix('admin')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Sections
    Route::get('/products/{product}/sections', [SectionController::class, 'index']);
    Route::post('/products/{product}/sections', [SectionController::class, 'store']);
    Route::put('/sections/{section}', [SectionController::class, 'update']);
    Route::delete('/sections/{section}', [SectionController::class, 'destroy']);
    Route::put('/products/{product}/sections/reorder', [SectionController::class, 'reorder']);

    // Pages
    Route::get('/sections/{section}/pages', [PageController::class, 'index']);
    Route::post('/sections/{section}/pages', [PageController::class, 'store']);
    Route::put('/pages/{page}', [PageController::class, 'update']);
    Route::delete('/pages/{page}', [PageController::class, 'destroy']);
    Route::put('/sections/{section}/pages/reorder', [PageController::class, 'reorder']);

    // Blocks
    Route::get('/pages/{page}/blocks', [PageBlockController::class, 'index']);
    Route::post('/pages/{page}/blocks', [PageBlockController::class, 'store']);
    Route::put('/blocks/{block}', [PageBlockController::class, 'update']);
    Route::delete('/blocks/{block}', [PageBlockController::class, 'destroy']);
    Route::put('/pages/{page}/blocks/reorder', [PageBlockController::class, 'reorder']);
});
*/
