<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subsection;
use App\Models\PageBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PageBlockController extends Controller
{
    public function index(Subsection $subsection)
    {
        return response()->json(
            $subsection->blocks()->orderBy('order_index')->get()
        );
    }

    public function store(Request $request, Subsection $subsection)
    {
        try {
            $validated = $request->validate([
                'type' => ['required', 'in:heading,paragraph,image,list,richtext'],
                'heading_level' => ['nullable', 'in:2,3'],
                'text' => ['nullable', 'string'],
                'image_path' => ['nullable', 'string'],
                'align' => ['nullable', 'in:left,center,right,justify'],
                'image_width' => ['nullable', 'in:sm,md,lg,full'],
                'list_style' => ['nullable', 'in:bullet,number'],
                'list_items' => ['nullable', 'array'],
                'list_items.*' => ['nullable', 'string'],
            ]);

            if ($validated['type'] === 'heading' && empty($validated['heading_level'])) {
                return response()->json(['message' => 'Heading level is required'], 422);
            }

            $maxOrder = $subsection->blocks()->max('order_index') ?? 0;

            $block = PageBlock::create([
                'subsection_id' => $subsection->id,
                'type' => $validated['type'],
                'heading_level' => $validated['heading_level'] ?? null,
                'text' => $validated['text'] ?? null,
                'image_path' => $validated['image_path'] ?? null,
                'align' => $validated['align'] ?? null,
                'image_width' => $validated['image_width'] ?? null,
                'list_style' => $validated['list_style'] ?? null,
                'list_items' => $validated['list_items'] ?? null,
                'order_index' => $maxOrder + 1,
            ]);

            Cache::forget("help_subsection_{$subsection->id}");

            return response()->json($block, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create block', 'errors' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, PageBlock $block)
    {
        try {
            $validated = $request->validate([
                'heading_level' => ['nullable', 'in:2,3'],
                'text' => ['nullable', 'string'],
                'image_path' => ['nullable', 'string'],
                'align' => ['nullable', 'in:left,center,right'],
                'image_width' => ['nullable', 'in:sm,md,lg,full'],
                'list_style' => ['nullable', 'in:bullet,number'],
                'list_items' => ['nullable', 'array'],
                'list_items.*' => ['nullable', 'string'],
            ]);

            $block->update($validated);
            Cache::forget("help_subsection_{$block->subsection_id}");
            return response()->json($block);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update block', 'errors' => $e->getMessage()], 500);
        }
    }

    public function destroy(PageBlock $block)
    {
        try {
            $subsectionId = $block->subsection_id;
            $block->delete();
            Cache::forget("help_subsection_{$subsectionId}");
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete block', 'errors' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request, Subsection $subsection)
    {
        try {
            $validated = $request->validate([
                'ordered_ids' => ['required', 'array'],
                'ordered_ids.*' => ['integer', 'exists:page_blocks,id'],
            ]);

            $validIds = $subsection->blocks()->pluck('id')->toArray();

            foreach ($validated['ordered_ids'] as $id) {
                if (!in_array($id, $validIds)) {
                    return response()->json(['message' => 'Invalid block in reorder list'], 422);
                }
            }

            DB::transaction(function () use ($validated) {
                foreach ($validated['ordered_ids'] as $index => $id) {
                    PageBlock::where('id', $id)->update(['order_index' => $index + 1]);
                }
            });

            Cache::forget("help_subsection_{$subsection->id}");

            return response()->json(['message' => 'Reordered']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reorder blocks', 'errors' => $e->getMessage()], 500);
        }
    }
}
