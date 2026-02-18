<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return ProductResource::collection(
            Product::orderBy('created_at', 'asc')->get()
        );
    }

    public function store(StoreProductRequest $request)
    {
        try {
            $validated = $request->validated();

            $slug = $validated['slug'] ?? Str::slug($validated['name']);
            $originalSlug = $slug;
            $i = 2;

            while (true) {
                try {
                    $product = Product::create([
                        'name' => $validated['name'],
                        'slug' => $slug,
                        'is_published' => $validated['is_published'] ?? true,
                    ]);

                    return new ProductResource($product);
                } catch (\Illuminate\Database\QueryException $e) {
                    // MySQL error code for duplicate entry is 1062
                    if (($e->errorInfo[1] ?? 0) == 1062) {
                        $slug = $originalSlug . '-' . $i;
                        $i++;
                        continue;
                    }
                    throw $e;
                }
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create product', 'errors' => $e->getMessage()], 500);
        }
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        try {
            $validated = $request->validated();

            $product->update([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'is_published' => $validated['is_published'] ?? $product->is_published,
            ]);

            return new ProductResource($product);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update product', 'errors' => $e->getMessage()], 500);
        }
    }


    public function destroy(Product $product)
    {
        try {
            $product->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete product', 'errors' => $e->getMessage()], 500);
        }
    }

    public function showSections(Product $product)
    {
        return Inertia::render('Admin/ProductSections', [
            'productId' => (int)$product->id,
            'productTitle' => $product->name
        ]);
    }
}
