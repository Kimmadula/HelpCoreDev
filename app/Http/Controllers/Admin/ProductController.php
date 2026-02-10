<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(
            Product::orderBy('created_at', 'asc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'is_published' => ['nullable', 'boolean'],
        ]);

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

                return response()->json($product, 201);
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
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $product->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'is_published' => $validated['is_published'] ?? $product->is_published,
        ]);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
