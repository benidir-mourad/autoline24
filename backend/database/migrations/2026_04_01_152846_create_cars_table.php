<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();

            $table->string('brand');
            $table->string('model');
            $table->string('version')->nullable();

            $table->year('year');
            $table->unsignedInteger('mileage')->default(0);

            $table->decimal('price', 10, 2);
            $table->decimal('purchase_price', 10, 2)->nullable();

            $table->string('fuel_type');
            $table->string('transmission');

            $table->unsignedSmallInteger('power_hp')->nullable();
            $table->unsignedSmallInteger('fiscal_power')->nullable();
            $table->unsignedSmallInteger('engine_size')->nullable();

            $table->unsignedTinyInteger('doors')->nullable();
            $table->unsignedTinyInteger('seats')->nullable();

            $table->string('color')->nullable();
            $table->string('body_type')->nullable();

            $table->date('first_registration_date')->nullable();

            $table->text('description')->nullable();

            $table->enum('status', ['available', 'reserved', 'sold'])->default('available');
            $table->enum('publication_status', ['draft', 'published'])->default('draft');

            $table->boolean('featured')->default(false);
            $table->string('reference')->nullable()->unique();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
