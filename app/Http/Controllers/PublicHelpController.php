<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Subsection;
use App\Services\SearchService;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SectionResource;

class PublicHelpController extends Controller
{
    public function navigation(string $productSlug)
    {
        $product = Product::query()
            ->where('slug', $productSlug)
            ->where('is_published', true)
            ->with(['sections' => function ($q) {
                $q->where('is_published', true)
                  ->orderBy('order_index')
                  ->with(['subsections' => function ($qq) {
                      $qq->where('is_published', true)
                         ->orderBy('order_index');
                  }]);
            }])
            ->firstOrFail();

        $allProducts = Product::where('is_published', true)
            ->select('id', 'name', 'slug')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'product' => new ProductResource($product),
            'all_products' => $allProducts,           
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sections' => SectionResource::collection($product->sections),
        ]);
    }

    public function subsection(Subsection $subsection)
    {
        if (!$subsection->is_published) {
            abort(404);
        }

        $subsection->load(['blocks' => function ($q) {
            $q->orderBy('order_index');
        }]);

        return response()->json([
            'id' => $subsection->id,
            'title' => $subsection->title,
            'slug' => $subsection->slug,
            'blocks' => $subsection->blocks->map(function ($b) {
                return [
                    'id' => $b->id,
                    'type' => $b->type,
                    'heading_level' => $b->heading_level,
                    'text' => $b->text,
                    'image_path' => $b->image_path,
                    'order_index' => $b->order_index,
                    
                    'align' => $b->align,
                    'image_width' => $b->image_width,
                    'list_style' => $b->list_style,
                    'list_items' => $b->list_items,
                ];
            })->values(),
        ]);
    }

    public function search(SearchService $searchService)
    {
        $query = request('query');
        
        $results = $searchService->search($query ?? '');

        return response()->json([
            'results' => $results
        ]);
    }
}
