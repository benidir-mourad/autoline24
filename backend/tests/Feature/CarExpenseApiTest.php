<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CarExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_add_and_list_expenses_for_a_car(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $car = Car::create([
            'brand' => 'Volkswagen',
            'model' => 'Golf',
            'year' => 2020,
            'mileage' => 85000,
            'price' => 15990,
            'purchase_price' => 12000,
            'fuel_type' => 'Diesel',
            'transmission' => 'Manuelle',
            'status' => 'available',
            'publication_status' => 'published',
        ]);

        $createResponse = $this->postJson("/api/admin/cars/{$car->id}/expenses", [
            'expense_type' => 'Entretien',
            'amount' => 349.99,
            'expense_date' => '2026-04-09',
            'description' => 'Révision complète',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('message', 'Frais ajouté avec succès.')
            ->assertJsonPath('expense.expense_type', 'Entretien');

        $listResponse = $this->getJson("/api/admin/cars/{$car->id}/expenses");

        $listResponse
            ->assertOk()
            ->assertJsonPath('total_expenses', 349.99)
            ->assertJsonPath('expenses.0.expense_type', 'Entretien');
    }

    public function test_admin_can_delete_an_expense(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $car = Car::create([
            'brand' => 'Peugeot',
            'model' => '308',
            'year' => 2019,
            'mileage' => 92000,
            'price' => 12490,
            'purchase_price' => 9800,
            'fuel_type' => 'Diesel',
            'transmission' => 'Manuelle',
            'status' => 'available',
            'publication_status' => 'draft',
        ]);

        $expense = $car->expenses()->create([
            'expense_type' => 'Pneus',
            'amount' => 420,
            'expense_date' => '2026-04-01',
        ]);

        $response = $this->deleteJson("/api/admin/expenses/{$expense->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Frais supprimé avec succès.');

        $this->assertDatabaseMissing('car_expenses', [
            'id' => $expense->id,
        ]);
    }
}
