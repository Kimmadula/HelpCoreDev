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

    Route::get('/users', function () {
        return Inertia::render('Admin/UsersIndex');
    })->name('admin.users');
});


// Admin API routes are now in routes/admin.php

require __DIR__.'/auth.php';
