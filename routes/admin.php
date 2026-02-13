<?php

use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\PageBlockController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SubsectionController;
use App\Http\Controllers\Admin\ImageUploadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:api'])->prefix('admin')->group(function () {
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

    // Subsections
    Route::get('/sections/{section}/subsections', [SubsectionController::class, 'index']);
    Route::post('/sections/{section}/subsections', [SubsectionController::class, 'store']);
    Route::put('/subsections/{subsection}', [SubsectionController::class, 'update']);
    Route::delete('/subsections/{subsection}', [SubsectionController::class, 'destroy']);
    Route::put('/sections/{section}/subsections/reorder', [SubsectionController::class, 'reorder']);

    // Blocks (under subsections)
    Route::get('/subsections/{subsection}/blocks', [PageBlockController::class, 'index']);
    Route::post('/subsections/{subsection}/blocks', [PageBlockController::class, 'store']);
    Route::put('/blocks/{block}', [PageBlockController::class, 'update']);
    Route::delete('/blocks/{block}', [PageBlockController::class, 'destroy']);
    Route::put('/subsections/{subsection}/blocks/reorder', [PageBlockController::class, 'reorder']);

    Route::post('/uploads/images', [ImageUploadController::class, 'store']);
});
