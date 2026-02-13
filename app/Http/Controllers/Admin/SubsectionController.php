<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Subsection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Admin\StoreSubsectionRequest;
use App\Http\Requests\Admin\UpdateSubsectionRequest;

class SubsectionController extends Controller
{
    public function index(Section $section)
    {
        return response()->json(
            $section->subsections()->orderBy('order_index')->get()
        );
    }

    public function store(StoreSubsectionRequest $request, Section $section)
    {
        $validated = $request->validated();

        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        $originalSlug = $slug;
        $i = 2;

        while (true) {
            try {
                $maxOrder = $section->subsections()->max('order_index') ?? 0;

                $subsection = Subsection::create([
                    'section_id' => $section->id,
                    'title' => $validated['title'],
                    'slug' => $slug,
                    'order_index' => $maxOrder + 1,
                    'is_published' => $validated['is_published'] ?? true,
                ]);

                return response()->json($subsection, 201);
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

    public function update(UpdateSubsectionRequest $request, Subsection $subsection)
    {
        $validated = $request->validated();

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

        DB::transaction(function () use ($validated) {
            foreach ($validated['ordered_ids'] as $index => $id) {
                Subsection::where('id', $id)->update(['order_index' => $index + 1]);
            }
        });

        return response()->json(['message' => 'Reordered']);
    }
}
