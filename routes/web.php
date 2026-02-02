<?php

use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PageBlockController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SubsectionController;
use App\Http\Controllers\Admin\ImageUploadController;

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
    return Inertia::render('HelpDocs');
})->name('help');

Route::get('/help/{productSlug}', function (string $productSlug) {
    return Inertia::render('HelpDocs', [
        'productSlug' => $productSlug,
    ]);
})->name('help.product');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/products', fn () => Inertia::render('Admin/ProductsIndex'))->name('admin.products');
    Route::get('/products/{product}/sections', fn ($product) => Inertia::render('Admin/ProductSections', ['productId' => (int)$product]))->name('admin.sections');

    Route::get('/sections/{section}/subsections', fn ($section) =>
        Inertia::render('Admin/SectionSubsections', ['sectionId' => (int)$section])
    )->name('admin.subsections');

    Route::get('/subsections/{subsection}/edit', fn ($subsection) =>
        Inertia::render('Admin/SubsectionEditor', ['subsectionId' => (int)$subsection])
    )->name('admin.subsection.edit');
});


Route::middleware(['auth'])->prefix('api/admin')->group(function () {
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


    // Blocks
    Route::get('/pages/{page}/blocks', [PageBlockController::class, 'index']);
    Route::post('/pages/{page}/blocks', [PageBlockController::class, 'store']);
    Route::put('/blocks/{block}', [PageBlockController::class, 'update']);
    Route::delete('/blocks/{block}', [PageBlockController::class, 'destroy']);
    Route::put('/pages/{page}/blocks/reorder', [PageBlockController::class, 'reorder']);
});

require __DIR__.'/auth.php';
