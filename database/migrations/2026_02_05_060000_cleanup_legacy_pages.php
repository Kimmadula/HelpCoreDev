<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop foreign key and column from page_blocks
        Schema::table('page_blocks', function (Blueprint $table) {
            if (Schema::hasColumn('page_blocks', 'page_id')) {
                // Check for foreign key existence before dropping (convention: table_column_foreign)
                // We use a try-catch or explicit check if we were sure of the name, 
                // but standard Laravel naming is page_blocks_page_id_foreign
                try {
                    $table->dropForeign(['page_id']);
                } catch (\Exception $e) {
                    // Ignore if foreign key doesn't exist
                }
                $table->dropColumn('page_id');
            }
        });

        // 2. Drop the pages table
        Schema::dropIfExists('pages');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-create pages table
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->integer('order_index')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // Add page_id back to page_blocks
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->foreignId('page_id')->nullable()->after('subsection_id')->constrained()->cascadeOnDelete();
        });
    }
};
