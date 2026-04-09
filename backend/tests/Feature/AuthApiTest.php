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

    public function test_admin_can_log_in_and_receive_a_token(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'email'],
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertStatus(401)
            ->assertJson([
                'message' => 'Identifiants invalides.',
            ]);
    }

    public function test_admin_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/change-password', [
            'current_password' => 'secret123',
            'password' => 'new-secret123',
            'password_confirmation' => 'new-secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Mot de passe mis à jour avec succès.')
            ->assertJsonStructure(['token']);

        $this->assertTrue(Hash::check('new-secret123', $user->fresh()->password));
    }

    public function test_admin_can_change_login_email(): void
    {
        $user = User::factory()->create([
            'email' => 'ancien-admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/change-email', [
            'email' => 'nouvel-admin@example.com',
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
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/admin/forgot-password', [
            'email' => 'admin@example.com',
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
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/admin/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'reset-secret123',
            'password_confirmation' => 'reset-secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Mot de passe réinitialisé avec succès.');

        $this->assertTrue(Hash::check('reset-secret123', $user->fresh()->password));
    }
}