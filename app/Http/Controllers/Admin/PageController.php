<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Section $section)
    {
        $pages = $section->pages()->orderBy('order_index')->get();
        return response()->json($pages);
    }

    public function store(Request $request, Section $section)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['title']);

        $baseSlug = $slug;
        $i = 2;
        while (Page::where('section_id', $section->id)->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        $maxOrder = $section->pages()->max('order_index') ?? 0;

        $page = Page::create([
            'section_id' => $section->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'order_index' => $maxOrder + 1,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return response()->json($page, 201);
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $exists = Page::where('section_id', $page->section_id)
            ->where('slug', $validated['slug'])
            ->where('id', '!=', $page->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Slug already exists in this section.'], 422);
        }

        $page->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'is_published' => $validated['is_published'] ?? $page->is_published,
        ]);

        return response()->json($page);
    }

    public function destroy(Page $page)
    {
        $page->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request, Section $section)
    {
        $validated = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:pages,id'],
        ]);

        $validIds = $section->pages()->pluck('id')->toArray();
        foreach ($validated['ordered_ids'] as $id) {
            if (!in_array($id, $validIds)) {
                return response()->json(['message' => 'Invalid page in reorder list'], 422);
            }
        }

        foreach ($validated['ordered_ids'] as $index => $id) {
            Page::where('id', $id)->update(['order_index' => $index + 1]);
        }

        return response()->json(['message' => 'Reordered']);
    }
}
