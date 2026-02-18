<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Subsection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Http\Requests\Admin\StoreSubsectionRequest;
use App\Http\Requests\Admin\UpdateSubsectionRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Resources\SubsectionResource;
use App\Services\SortingService;

class SubsectionController extends Controller
{
    public function index(Section $section)
    {
        return SubsectionResource::collection(
            $section->subsections()->orderBy('order_index')->get()
        );
    }

    public function store(StoreSubsectionRequest $request, Section $section)
    {
        try {
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

                    return new SubsectionResource($subsection);
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
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create subsection', 'errors' => $e->getMessage()], 500);
        }
    }

    public function update(UpdateSubsectionRequest $request, Subsection $subsection)
    {
        try {
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

            return new SubsectionResource($subsection);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update subsection', 'errors' => $e->getMessage()], 500);
        }
    }

    public function destroy(Subsection $subsection)
    {
        try {
            $subsection->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete subsection', 'errors' => $e->getMessage()], 500);
        }
    }

    public function reorder(ReorderRequest $request, Section $section, SortingService $sortingService)
    {
        try {
            $validated = $request->validated();

            $sortingService->reorder(
                Subsection::class,
                $validated['ordered_ids'],
                'section_id',
                $section->id
            );
            return response()->json(['message' => 'Reordered']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reorder subsections', 'errors' => $e->getMessage()], 500);
        }
    }

    public function edit(Subsection $subsection)
    {
        $section = $subsection->section;
        $product = $section->product;

        return Inertia::render('Admin/SubsectionEditor', [
            'subsectionId' => (int)$subsection->id,
            'sectionId' => $subsection->section_id,
            'subsectionTitle' => $subsection->title,
            'sectionTitle' => $section->title,
            'productTitle' => $product->name,
        ]);
    }
}
