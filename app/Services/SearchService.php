<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Section;
use App\Models\Subsection;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

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
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhereHas('blocks', function ($qq) use ($query) {
                      $qq->where('text', 'like', "%{$query}%")
                         ->orWhere('list_items', 'like', "%{$query}%");
                  });
            })
            ->with(['section.product', 'blocks' => function ($q) use ($query) {
                $q->where('text', 'like', "%{$query}%")
                  ->orWhere('list_items', 'like', "%{$query}%");
            }])
            ->limit(10)
            ->get()
            ->map(function ($s) use ($query) {
                if (!$s->section || !$s->section->product) return null;

                $snippet = null;
                $matchingBlock = $s->blocks->first();

                if ($matchingBlock) {
                    $text = $matchingBlock->text ?? '';
                    
                    if (empty($text) && !empty($matchingBlock->list_items)) {
                        $items = is_string($matchingBlock->list_items) ? json_decode($matchingBlock->list_items, true) : $matchingBlock->list_items;
                        if (is_array($items)) {
                            foreach ($items as $item) {
                                if (stripos($item, $query) !== false) {
                                    $text = $item;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!empty($text)) {
                        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                        $text = preg_replace('/\s+/', ' ', $text);
                        $pos = stripos($text, $query);
                        if ($pos !== false) {
                            // Extract the exact sentence containing the keyword
                            if (preg_match('/[^.!?]*' . preg_quote($query, '/') . '[^.!?]*[.!?]?/i', $text, $matches)) {
                                $snippet = trim($matches[0]);
                                // If the standalone sentence is exceptionally long, safely fallback to character slicing
                                if (strlen($snippet) > 150) {
                                    $start = max(0, $pos - 40);
                                    $length = strlen($query) + 80;
                                    $snippet = substr($text, $start, $length);
                                    if ($start > 0) $snippet = '...' . ltrim($snippet);
                                    if ($start + $length < strlen($text)) $snippet .= '...';
                                }
                            } else {
                                // Safe fallback if sentence parsing fails
                                $start = max(0, $pos - 40);
                                $length = strlen($query) + 80;
                                $snippet = substr($text, $start, $length);
                                if ($start > 0) $snippet = '...' . ltrim($snippet);
                                if ($start + $length < strlen($text)) $snippet .= '...';
                            }
                        } else {
                            $snippet = Str::limit($text, 100);
                        }
                    }
                }

                return [
                    'type' => 'subsection',
                    'id' => $s->id,
                    'title' => $s->title,
                    'product_name' => $s->section->product->name,
                    'url' => "/help/{$s->section->product->slug}?subsection={$s->id}",
                    'snippet' => $snippet,
                ];
            })
            ->filter()
            ->values();
    }
}
