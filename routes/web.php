<?php

use App\Http\Controllers\Admin\SectionController;
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

use App\Models\Section;
use App\Models\Subsection;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/products', fn () => Inertia::render('Admin/ProductsIndex'))->name('admin.products');

    Route::get('/products/{product}/sections', function ($product) {
        $productModel = \App\Models\Product::findOrFail($product);
        return Inertia::render('Admin/ProductSections', [
            'productId' => (int)$product,
            'productTitle' => $productModel->name
        ]);
    })->name('admin.sections');

    Route::get('/sections/{section}/subsections', function ($sectionId) {
        $section = Section::findOrFail($sectionId);
        $product = $section->product;
        return Inertia::render('Admin/SectionSubsections', [
            'sectionId' => (int)$sectionId,
            'productId' => $section->product_id,
            'sectionTitle' => $section->title,
            'productTitle' => $product->name
        ]);
    })->name('admin.subsections');

    Route::get('/subsections/{subsection}/edit', function ($subsectionId) {
        $subsection = Subsection::findOrFail($subsectionId);
        $section = $subsection->section;
        $product = $section->product;

        return Inertia::render('Admin/SubsectionEditor', [
            'subsectionId' => (int)$subsectionId,
            'sectionId' => $subsection->section_id,
            'subsectionTitle' => $subsection->title,
            'sectionTitle' => $section->title,
            'productTitle' => $product->name,
        ]);
    })->name('admin.subsection.edit');
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
});

require __DIR__.'/auth.php';
