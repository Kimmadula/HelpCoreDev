<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->string('align', 10)->nullable()->after('type');

            $table->string('image_width', 10)->nullable()->after('image_path'); 

            $table->string('list_style', 10)->nullable()->after('text'); 
            $table->json('list_items')->nullable()->after('list_style'); 
        });
    }

    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->dropColumn(['align', 'image_width', 'list_style', 'list_items']);
        });
    }
};
