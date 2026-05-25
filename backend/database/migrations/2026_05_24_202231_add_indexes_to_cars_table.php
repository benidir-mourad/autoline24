<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->index(['publication_status', 'status']);
            $table->index('brand');
            $table->index('fuel_type');
            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropIndex(['publication_status', 'status']);
            $table->dropIndex(['brand']);
            $table->dropIndex(['fuel_type']);
            $table->dropIndex(['year']);
        });
    }
};
