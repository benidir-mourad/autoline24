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
            'category' => 'Technique',
            'expense_type' => 'Entretien',
            'amount' => 349.99,
            'expense_date' => '2026-04-09',
            'description' => 'Révision complète',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('message', 'Frais ajouté avec succès.')
            ->assertJsonPath('expense.category', 'Technique')
            ->assertJsonPath('expense.expense_type', 'Entretien');

        $listResponse = $this->getJson("/api/admin/cars/{$car->id}/expenses");

        $listResponse
            ->assertOk()
            ->assertJsonPath('total_expenses', 349.99)
            ->assertJsonPath('expenses.0.category', 'Technique')
            ->assertJsonPath('expenses.0.expense_type', 'Entretien');
    }

    public function test_admin_can_update_an_expense(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $car = Car::create([
            'brand' => 'Renault',
            'model' => 'Clio',
            'year' => 2021,
            'mileage' => 43000,
            'price' => 13990,
            'purchase_price' => 11200,
            'fuel_type' => 'Essence',
            'transmission' => 'Manuelle',
            'status' => 'available',
            'publication_status' => 'published',
        ]);

        $expense = $car->expenses()->create([
            'category' => 'Technique',
            'expense_type' => 'Freins',
            'amount' => 280,
            'expense_date' => '2026-04-01',
            'description' => 'Plaquettes avant',
        ]);

        $response = $this->putJson("/api/admin/expenses/{$expense->id}", [
            'category' => 'Administratif',
            'expense_type' => 'Contrôle technique',
            'amount' => 62,
            'expense_date' => '2026-04-08',
            'description' => 'Visite périodique',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Frais mis à jour avec succès.')
            ->assertJsonPath('expense.category', 'Administratif')
            ->assertJsonPath('expense.expense_type', 'Contrôle technique');
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
            'category' => 'Technique',
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
