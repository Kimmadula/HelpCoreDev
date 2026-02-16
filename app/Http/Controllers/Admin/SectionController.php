<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Section;
use App\Http\Resources\SectionResource;
use App\Http\Requests\Admin\StoreSectionRequest;
use App\Http\Requests\Admin\UpdateSectionRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Services\SortingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SectionController extends Controller
{
    public function index(Product $product)
    {
        $sections = $product->sections()->orderBy('order_index')->get();
        return SectionResource::collection($sections);
    }

    public function store(StoreSectionRequest $request, Product $product)
    {
        try {
            $validated = $request->validated();

            $slug = $validated['slug'] ?? Str::slug($validated['title']);
            $originalSlug = $slug;
            $i = 2;

            while (true) {
                try {
                    $maxOrder = $product->sections()->max('order_index') ?? 0;

                    $section = Section::create([
                        'product_id' => $product->id,
                        'title' => $validated['title'],
                        'slug' => $slug,
                        'order_index' => $maxOrder + 1,
                        'is_published' => $validated['is_published'] ?? true,
                    ]);

                    return new SectionResource($section);
                } catch (\Illuminate\Database\QueryException $e) {
                    if (($e->errorInfo[1] ?? 0) == 1062) { // MySQL duplicate entry error code
                        $slug = $originalSlug . '-' . $i;
                        $i++;
                        continue; // Try again with a new slug
                    }
                    throw $e; // Re-throw other QueryExceptions
                }
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create section', 'errors' => $e->getMessage()], 500);
        }
    }

    public function update(UpdateSectionRequest $request, Section $section)
    {
        $validated = $request->validated();

        $section->update([
            'title' => $validated['title'],
            'is_published' => $validated['is_published'] ?? $section->is_published,
        ]);

        return new SectionResource($section);
    }

    public function destroy(Section $section)
    {
        try {
            $section->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete section', 'errors' => $e->getMessage()], 500);
        }
    }

    public function reorder(ReorderRequest $request, Product $product, SortingService $sortingService)
    {
        try {
            $validated = $request->validated();

            $sortingService->reorder(
                Section::class,
                $validated['ordered_ids'],
                'product_id',
                $product->id
            );
            return response()->json(['message' => 'Reordered']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reorder sections', 'errors' => $e->getMessage()], 500);
        }
    }
}
