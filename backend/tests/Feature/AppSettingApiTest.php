<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppSettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_contact_settings_are_available(): void
    {
        $response = $this->getJson('/api/settings/contact');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'contact_phone',
                'contact_email',
                'contact_address',
                'contact_map_embed_url',
            ]);
    }

    public function test_admin_can_update_contact_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->putJson('/api/admin/settings/contact', [
            'contact_phone' => '+32 471 11 22 33',
            'contact_email' => 'vente@autoline24.test',
            'contact_address' => 'Rue du Commerce 10, 1000 Bruxelles',
            'contact_map_embed_url' => 'https://www.google.com/maps?q=Bruxelles&output=embed',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Coordonnées mises à jour avec succès.')
            ->assertJsonPath('settings.contact_phone', '+32 471 11 22 33');
    }
}
