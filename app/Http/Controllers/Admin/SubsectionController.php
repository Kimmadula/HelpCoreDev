<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Subsection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubsectionController extends Controller
{
    public function index(Section $section)
    {
        return response()->json(
            $section->subsections()->orderBy('order_index')->get()
        );
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

        while (Subsection::where('section_id', $section->id)->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        $maxOrder = $section->subsections()->max('order_index') ?? 0;

        $subsection = Subsection::create([
            'section_id' => $section->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'order_index' => $maxOrder + 1,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return response()->json($subsection, 201);
    }

    public function update(Request $request, Subsection $subsection)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $exists = Subsection::where('section_id', $subsection->section_id)
            ->where('slug', $validated['slug'])
            ->where('id', '!=', $subsection->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Slug already exists in this section.'], 422);
        }

        $subsection->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'is_published' => $validated['is_published'] ?? $subsection->is_published,
        ]);

        return response()->json($subsection);
    }

    public function destroy(Subsection $subsection)
    {
        $subsection->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request, Section $section)
    {
        $validated = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:subsections,id'],
        ]);

        $validIds = $section->subsections()->pluck('id')->toArray();

        foreach ($validated['ordered_ids'] as $id) {
            if (!in_array($id, $validIds)) {
                return response()->json(['message' => 'Invalid subsection in reorder list'], 422);
            }
        }

        foreach ($validated['ordered_ids'] as $index => $id) {
            Subsection::where('id', $id)->update(['order_index' => $index + 1]);
        }

        return response()->json(['message' => 'Reordered']);
    }
}
