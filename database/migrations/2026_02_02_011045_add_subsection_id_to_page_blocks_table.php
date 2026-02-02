<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->foreignId('subsection_id')
                ->nullable()
                ->after('page_id')
                ->constrained('subsections')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subsection_id');
        });
    }
};
