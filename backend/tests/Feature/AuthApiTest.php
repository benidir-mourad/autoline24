<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in(): void
    {
        $user = User::factory()->create([
            'email'    => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'email'],
            ])
            ->assertJsonMissingPath('token');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email'    => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertStatus(401)
            ->assertJson(['message' => 'Identifiants invalides.']);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email'    => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', [
                'email'    => 'admin@example.com',
                'password' => 'wrong',
            ]);
        }

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(429);
    }

    public function test_admin_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/change-password', [
            'current_password'      => 'secret123',
            'password'              => 'new-secret123',
            'password_confirmation' => 'new-secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Mot de passe mis à jour avec succès.')
            ->assertJsonMissingPath('token');

        $this->assertTrue(Hash::check('new-secret123', $user->fresh()->password));
    }

    public function test_change_password_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/change-password', [
            'current_password'      => 'wrong-password',
            'password'              => 'new-secret123',
            'password_confirmation' => 'new-secret123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['current_password']);
    }

    public function test_admin_can_change_login_email(): void
    {
        $user = User::factory()->create([
            'email'    => 'ancien-admin@example.com',
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/change-email', [
            'email'            => 'nouvel-admin@example.com',
            'current_password' => 'secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Adresse e-mail de connexion mise à jour avec succès.')
            ->assertJsonPath('user.email', 'nouvel-admin@example.com');

        $this->assertSame('nouvel-admin@example.com', $user->fresh()->email);
    }

    public function test_forgot_password_returns_generic_message(): void
    {
        Notification::fake();

        User::factory()->create([
            'email' => 'admin@example.com',
            'role'  => 'admin',
        ]);

        $response = $this->postJson('/api/admin/recover', [
            'email' => 'admin@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.'
            );
    }

    public function test_forgot_password_returns_same_message_for_unknown_email(): void
    {
        $response = $this->postJson('/api/admin/recover', [
            'email' => 'unknown@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.'
            );
    }

    public function test_admin_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email'    => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role'     => 'admin',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/admin/renew', [
            'email'                 => $user->email,
            'token'                 => $token,
            'password'              => 'reset-secret123',
            'password_confirmation' => 'reset-secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Mot de passe réinitialisé avec succès.');

        $this->assertTrue(Hash::check('reset-secret123', $user->fresh()->password));
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/admin/me');

        $response->assertUnauthorized();
    }

    public function test_non_admin_role_is_rejected_from_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'editor']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/cars');

        $response->assertForbidden()->assertJsonPath('message', 'Accès refusé.');
    }
}
