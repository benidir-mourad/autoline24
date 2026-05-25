<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
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
                'company_vat',
                'contact_map_embed_url',
            ]);
    }

    public function test_admin_can_update_contact_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->putJson('/api/admin/settings/contact', [
            'contact_phone'   => '+32 471 11 22 33',
            'contact_email'   => 'vente@autoline24.test',
            'contact_address' => 'Rue du Commerce 10, 1000 Bruxelles',
            'company_vat'     => 'BE 0999.888.777',
            'contact_map_embed_url' => 'https://www.google.com/maps?q=Bruxelles&output=embed',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Coordonnées mises à jour avec succès.')
            ->assertJsonPath('settings.contact_phone', '+32 471 11 22 33')
            ->assertJsonPath('settings.company_vat', 'BE 0999.888.777');
    }

    public function test_mail_password_is_stored_encrypted(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->putJson('/api/admin/settings/mail', [
            'mail_host'         => 'smtp.example.com',
            'mail_port'         => 587,
            'mail_encryption'   => 'tls',
            'mail_username'     => 'user@example.com',
            'mail_password'     => 'super-secret-password',
            'mail_from_address' => 'user@example.com',
        ]);

        $stored = AppSetting::where('key', 'mail_password')->value('value');

        $this->assertNotSame('super-secret-password', $stored);
        $this->assertSame('super-secret-password', Crypt::decryptString($stored));
    }

    public function test_mail_password_is_not_returned_in_admin_mail_response(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        AppSetting::create(['key' => 'mail_password', 'value' => Crypt::encryptString('secret')]);

        $response = $this->getJson('/api/admin/settings/mail');

        $response
            ->assertOk()
            ->assertJsonMissingPath('mail_password')
            ->assertJsonPath('mail_password_configured', true);
    }

    public function test_mail_password_is_preserved_when_not_sent(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $encrypted = Crypt::encryptString('original-password');
        AppSetting::create(['key' => 'mail_password', 'value' => $encrypted]);

        $this->putJson('/api/admin/settings/mail', [
            'mail_host'         => 'smtp.example.com',
            'mail_port'         => 587,
            'mail_encryption'   => 'tls',
            'mail_username'     => 'user@example.com',
            'mail_from_address' => 'user@example.com',
        ]);

        $stored = AppSetting::where('key', 'mail_password')->value('value');
        $this->assertSame($encrypted, $stored);
    }
}
