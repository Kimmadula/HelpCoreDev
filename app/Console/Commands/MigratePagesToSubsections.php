<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Models\Page;
use App\Models\Subsection;
use App\Models\PageBlock;

class MigratePagesToSubsections extends Command
{
    protected $signature = 'help:migrate-pages-to-subsections {--dry-run}';
    protected $description = 'Migrate old Pages + Blocks into Subsections + Blocks(subsection_id)';

    public function handle()
    {
        $dryRun = (bool)$this->option('dry-run');

        $pages = Page::orderBy('section_id')->orderBy('order_index')->get();

        if ($pages->isEmpty()) {
            $this->info("No pages found. Nothing to migrate.");
            return Command::SUCCESS;
        }

        $this->info("Found {$pages->count()} pages.");
        if ($dryRun) {
            $this->warn("DRY RUN enabled — no DB changes will be made.");
        }

        DB::beginTransaction();

        try {
            $migratedCount = 0;

            foreach ($pages as $page) {
                // Skip if already migrated (blocks already have subsection_id)
                $hasBlocks = PageBlock::where('page_id', $page->id)->exists();
                if (!$hasBlocks) {
                    continue;
                }

                $title = $page->title ?? 'Untitled';
                $slug = $page->slug ? $page->slug : Str::slug($title);

                // Make slug unique within the same section
                $baseSlug = $slug ?: Str::slug($title);
                $slug = $baseSlug;
                $i = 2;

                while (Subsection::where('section_id', $page->section_id)->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $i;
                    $i++;
                }

                // Create subsection mirroring the old page
                if (!$dryRun) {
                    $subsection = Subsection::create([
                        'section_id' => $page->section_id,
                        'title' => $title,
                        'slug' => $slug,
                        'order_index' => $page->order_index ?? 0,
                        'is_published' => $page->is_published ?? true,
                    ]);

                    // Move blocks from page_id -> subsection_id
                    PageBlock::where('page_id', $page->id)->update([
                        'subsection_id' => $subsection->id,
                    ]);
                }

                $migratedCount++;
            }

            if ($dryRun) {
                DB::rollBack();
                $this->info("Dry run complete. Would migrate {$migratedCount} pages.");
                return Command::SUCCESS;
            }

            DB::commit();
            $this->info("Migration complete. Migrated {$migratedCount} pages into subsections.");
            return Command::SUCCESS;

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Migration failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
