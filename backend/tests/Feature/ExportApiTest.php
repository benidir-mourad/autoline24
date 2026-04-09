<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_export_cars_csv(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        Car::create([
            'brand' => 'Audi',
            'model' => 'A3',
            'year' => 2022,
            'mileage' => 28000,
            'price' => 25990,
            'purchase_price' => 21900,
            'fuel_type' => 'Essence',
            'transmission' => 'Automatique',
            'status' => 'available',
            'publication_status' => 'published',
        ]);

        $response = $this->get('/api/admin/exports/cars');

        $response
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
