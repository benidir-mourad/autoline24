<?php

namespace Tests\Feature;

use App\Models\Option;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OptionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_options_are_listed_in_alphabetical_order(): void
    {
        Option::factory()->create(['name' => 'GPS', 'slug' => 'gps']);
        Option::factory()->create(['name' => 'Caméra', 'slug' => 'camera']);

        $response = $this->getJson('/api/options');

        $response
            ->assertOk()
            ->assertJsonPath('0.name', 'Caméra')
            ->assertJsonPath('1.name', 'GPS');
    }

    public function test_admin_can_create_an_option(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->postJson('/api/admin/options', [
            'name' => 'Toit panoramique',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('option.name', 'Toit panoramique');

        $this->assertDatabaseHas('options', [
            'name' => 'Toit panoramique',
            'slug' => 'toit-panoramique',
        ]);
    }

    public function test_admin_can_delete_an_option(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $option = Option::factory()->create();

        $response = $this->deleteJson("/api/admin/options/{$option->id}");

        $response
            ->assertOk()
            ->assertJson([
                'message' => 'Option supprimée avec succès.',
            ]);

        $this->assertDatabaseMissing('options', [
            'id' => $option->id,
        ]);
    }
}
