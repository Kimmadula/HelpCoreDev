<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Product $product)
    {
        $sections = $product->sections()->orderBy('order_index')->get();
        return response()->json($sections);
    }

    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $maxOrder = $product->sections()->max('order_index') ?? 0;

        $section = Section::create([
            'product_id' => $product->id,
            'title' => $validated['title'],
            'order_index' => $maxOrder + 1,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return response()->json($section, 201);
    }

    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $section->update([
            'title' => $validated['title'],
            'is_published' => $validated['is_published'] ?? $section->is_published,
        ]);

        return response()->json($section);
    }

    public function destroy(Section $section)
    {
        $section->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request, Product $product)
    {
        $validated = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:sections,id'],
        ]);

        $validIds = $product->sections()->pluck('id')->toArray();
        foreach ($validated['ordered_ids'] as $id) {
            if (!in_array($id, $validIds)) {
                return response()->json(['message' => 'Invalid section in reorder list'], 422);
            }
        }

        foreach ($validated['ordered_ids'] as $index => $id) {
            Section::where('id', $id)->update(['order_index' => $index + 1]);
        }

        return response()->json(['message' => 'Reordered']);
    }
}
