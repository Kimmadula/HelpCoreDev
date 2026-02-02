<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Subsection;

class PublicHelpController extends Controller
{
    // Sidebar data: Product -> Sections -> Subsections
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

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sections' => $product->sections->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'order_index' => $s->order_index,
                    'subsections' => $s->subsections->map(function ($ss) {
                        return [
                            'id' => $ss->id,
                            'title' => $ss->title,
                            'slug' => $ss->slug,
                            'order_index' => $ss->order_index,
                        ];
                    })->values(),
                ];
            })->values(),
        ]);
    }

    // Content data: Subsection -> Blocks
    public function subsection(Subsection $subsection)
    {
        // Optional: only allow published subsections publicly
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
                ];
            })->values(),
        ]);
    }
}
