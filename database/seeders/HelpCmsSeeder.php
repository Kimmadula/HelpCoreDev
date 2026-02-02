<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Section;
use App\Models\Page;
use App\Models\PageBlock;

class HelpCmsSeeder extends Seeder
{
    public function run(): void
    {
        $product = Product::create([
            'name' => 'Help Desk',
            'slug' => 'help-desk',
            'is_published' => true,
        ]);

        $section = Section::create([
            'product_id' => $product->id,
            'title' => 'Concerns',
            'order_index' => 1,
            'is_published' => true,
        ]);

        $page = Page::create([
            'section_id' => $section->id,
            'title' => 'New Concern',
            'slug' => 'new-concern',
            'order_index' => 1,
            'is_published' => true,
        ]);

        PageBlock::create([
            'page_id' => $page->id,
            'type' => 'heading',
            'heading_level' => 2,
            'text' => 'Concerns',
            'order_index' => 1,
        ]);

        PageBlock::create([
            'page_id' => $page->id,
            'type' => 'heading',
            'heading_level' => 3,
            'text' => 'New Concern',
            'order_index' => 2,
        ]);

        PageBlock::create([
            'page_id' => $page->id,
            'type' => 'paragraph',
            'text' => 'To create a new concern or ticket, a member must fill all the required fields needed.',
            'order_index' => 3,
        ]);

        PageBlock::create([
            'page_id' => $page->id,
            'type' => 'paragraph',
            'text' => 'NOTE: Only registered members can create a concern or ticket.',
            'order_index' => 4,
        ]);
    }
}
