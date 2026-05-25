<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CarApiTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function carPayload(array $overrides = []): array
    {
        return array_merge([
            'brand'              => 'Volkswagen',
            'model'              => 'Golf',
            'year'               => 2021,
            'mileage'            => 45000,
            'price'              => 18990,
            'purchase_price'     => 15000,
            'fuel_type'          => 'Essence',
            'transmission'       => 'Manuelle',
            'status'             => 'available',
            'publication_status' => 'published',
        ], $overrides);
    }

    // ── Public routes ──────────────────────────────────────────────────────────

    public function test_public_index_returns_only_published_cars(): void
    {
        Car::create($this->carPayload(['publication_status' => 'published']));
        Car::create($this->carPayload(['model' => 'Polo', 'publication_status' => 'draft']));

        $response = $this->getJson('/api/cars');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Golf', $response->json('data.0.model'));
    }

    public function test_public_index_filters_by_brand(): void
    {
        Car::create($this->carPayload(['brand' => 'Audi', 'model' => 'A3']));
        Car::create($this->carPayload(['brand' => 'BMW', 'model' => 'Série 1']));

        $response = $this->getJson('/api/cars?brand=Audi');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Audi', $response->json('data.0.brand'));
    }

    public function test_public_index_filters_by_fuel_type(): void
    {
        Car::create($this->carPayload(['fuel_type' => 'Diesel']));
        Car::create($this->carPayload(['fuel_type' => 'Essence']));

        $response = $this->getJson('/api/cars?fuel_type=Diesel');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Diesel', $response->json('data.0.fuel_type'));
    }

    public function test_public_index_filters_by_price_range(): void
    {
        Car::create($this->carPayload(['price' => 10000]));
        Car::create($this->carPayload(['price' => 20000]));
        Car::create($this->carPayload(['price' => 30000]));

        $response = $this->getJson('/api/cars?min_price=15000&max_price=25000');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_public_index_paginates(): void
    {
        for ($i = 0; $i < 5; $i++) {
            Car::create($this->carPayload(['model' => "Model $i"]));
        }

        $response = $this->getJson('/api/cars?per_page=2');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertSame(5, $response->json('total'));
        $this->assertSame(3, $response->json('last_page'));
    }

    public function test_public_show_returns_car_details(): void
    {
        $car = Car::create($this->carPayload());

        $response = $this->getJson("/api/cars/{$car->id}");

        $response
            ->assertOk()
            ->assertJsonPath('id', $car->id)
            ->assertJsonPath('brand', 'Volkswagen');
    }

    public function test_public_show_returns_404_for_draft(): void
    {
        $car = Car::create($this->carPayload(['publication_status' => 'draft']));

        $response = $this->getJson("/api/cars/{$car->id}");

        $response->assertNotFound();
    }

    // ── Admin routes ───────────────────────────────────────────────────────────

    public function test_admin_index_returns_paginated_cars(): void
    {
        Sanctum::actingAs($this->adminUser());

        Car::create($this->carPayload(['publication_status' => 'draft']));
        Car::create($this->carPayload(['publication_status' => 'published']));

        $response = $this->getJson('/api/admin/cars');

        $response->assertOk()->assertJsonStructure([
            'data',
            'current_page',
            'last_page',
            'total',
        ]);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_create_a_car(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/cars', $this->carPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Voiture créée avec succès.')
            ->assertJsonPath('car.brand', 'Volkswagen');

        $this->assertDatabaseHas('cars', ['brand' => 'Volkswagen', 'model' => 'Golf']);
    }

    public function test_admin_can_update_a_car(): void
    {
        Sanctum::actingAs($this->adminUser());

        $car = Car::create($this->carPayload());

        $response = $this->putJson("/api/admin/cars/{$car->id}", $this->carPayload([
            'brand' => 'Audi',
            'model' => 'A4',
            'price' => 22000,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('car.brand', 'Audi')
            ->assertJsonPath('car.model', 'A4');

        $this->assertDatabaseHas('cars', ['id' => $car->id, 'brand' => 'Audi']);
    }

    public function test_admin_can_delete_a_car(): void
    {
        Sanctum::actingAs($this->adminUser());

        $car = Car::create($this->carPayload());

        $response = $this->deleteJson("/api/admin/cars/{$car->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Voiture supprimée avec succès.');

        $this->assertDatabaseMissing('cars', ['id' => $car->id]);
    }

    public function test_admin_car_creation_validates_required_fields(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/cars', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['brand', 'model', 'year', 'mileage', 'price', 'fuel_type', 'transmission', 'status', 'publication_status']);
    }

    public function test_financial_totals_are_computed_correctly(): void
    {
        Sanctum::actingAs($this->adminUser());

        $car = Car::create($this->carPayload(['price' => 20000, 'purchase_price' => 14000]));
        $car->expenses()->create([
            'category'     => 'Technique',
            'expense_type' => 'Entretien',
            'amount'       => 500,
            'expense_date' => '2026-01-15',
        ]);

        $response = $this->getJson("/api/admin/cars/{$car->id}");

        $response->assertOk();
        $this->assertEquals(500,   $response->json('total_expenses'));
        $this->assertEquals(14500, $response->json('total_investment'));
        $this->assertEquals(5500,  $response->json('estimated_margin'));
    }
}
