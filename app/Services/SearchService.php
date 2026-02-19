<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Section;
use App\Models\Subsection;
use Illuminate\Support\Collection;

class SearchService
{
    public function search(string $query): Collection
    {
        if (empty($query)) {
            return collect([]);
        }

        $products = $this->searchProducts($query);
        $sections = $this->searchSections($query);
        $subsections = $this->searchSubsections($query);

        return $products->concat($sections)->concat($subsections);
    }

    private function searchProducts(string $query): Collection
    {
        return Product::where('is_published', true)
            ->where('name', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'name', 'slug'])
            ->map(function ($p) {
                return [
                    'type' => 'product',
                    'id' => $p->id,
                    'title' => $p->name,
                    'url' => "/help/{$p->slug}",
                ];
            });
    }

    private function searchSections(string $query): Collection
    {
        return Section::where('is_published', true)
            ->where('title', 'like', "%{$query}%")
            ->with(['product', 'subsections' => function ($q) {
                $q->where('is_published', true)->orderBy('order_index')->limit(1);
            }])
            ->limit(5)
            ->get()
            ->map(function ($s) {
                if (!$s->product) return null;
                
                $firstSub = $s->subsections->first();
                $url = "/help/{$s->product->slug}";
                if ($firstSub) {
                    $url .= "?subsection={$firstSub->id}";
                }

                return [
                    'type' => 'section',
                    'id' => $s->id,
                    'title' => $s->title,
                    'product_name' => $s->product->name,
                    'url' => $url,
                ];
            })
            ->filter()
            ->values();
    }

    private function searchSubsections(string $query): Collection
    {
        return Subsection::where('is_published', true)
            ->where('title', 'like', "%{$query}%")
            ->with(['section.product'])
            ->limit(10)
            ->get()
            ->map(function ($s) {
                if (!$s->section || !$s->section->product) return null;

                return [
                    'type' => 'subsection',
                    'id' => $s->id,
                    'title' => $s->title,
                    'product_name' => $s->section->product->name,
                    'url' => "/help/{$s->section->product->slug}?subsection={$s->id}",
                ];
            })
            ->filter()
            ->values();
    }
}
