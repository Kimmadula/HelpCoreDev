<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subsections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->unsignedInteger('order_index')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['section_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subsections');
    }
};
