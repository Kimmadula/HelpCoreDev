<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subsection_id')->constrained('subsections')->cascadeOnDelete();

            $table->string('type');

            $table->unsignedTinyInteger('heading_level')->nullable();

            $table->longText('text')->nullable();

            $table->string('image_path')->nullable();

            $table->unsignedInteger('order_index')->default(0);

            $table->string('align')->nullable();
            $table->string('image_width')->nullable();
            $table->string('list_style')->nullable();
            $table->json('list_items')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
    }
};
