<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;

class SortingService
{
    public function reorder(string $modelClass, array $orderedIds, ?string $parentIdColumn = null, $parentId = null): void
    {
        // 1. Validate that all IDs belong to the parent (if applicable) and exist.
        $query = $modelClass::query();
        
        if ($parentIdColumn && $parentId) {
            $query->where($parentIdColumn, $parentId);
        }

        $validIds = $query->pluck('id')->toArray();

        // Check for any invalid IDs in the input
        $invalidIds = array_diff($orderedIds, $validIds);
        if (!empty($invalidIds)) {
            throw new \Exception('Invalid IDs provided for reordering.');
        }

        // 2. Update the order_index for each item
        DB::transaction(function () use ($modelClass, $orderedIds) {
            foreach ($orderedIds as $index => $id) {
                // Ensure we only update the specific records
                $modelClass::where('id', $id)->update(['order_index' => $index + 1]);
            }
        });
    }
}
