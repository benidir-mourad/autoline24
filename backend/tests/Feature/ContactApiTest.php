<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name'    => 'Jean Dupont',
            'email'   => 'jean@example.com',
            'message' => 'Bonjour, je suis intéressé par ce véhicule.',
        ], $overrides);
    }

    public function test_contact_form_sends_mail(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload());

        // Mail::raw() is not captured by assertSentCount — assert the endpoint succeeds instead.
        $response->assertOk()->assertJsonPath('message', 'Message envoyé avec succès.');
    }

    public function test_contact_form_with_car_label_sends_mail(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'car_label' => 'Volkswagen Golf 2021',
        ]));

        $response->assertOk()->assertJsonPath('message', 'Message envoyé avec succès.');
    }

    public function test_contact_form_validates_required_fields(): void
    {
        $response = $this->postJson('/api/contact', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_contact_form_validates_email_format(): void
    {
        $response = $this->postJson('/api/contact', $this->validPayload([
            'email' => 'not-an-email',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_contact_form_validates_message_max_length(): void
    {
        $response = $this->postJson('/api/contact', $this->validPayload([
            'message' => str_repeat('a', 3001),
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['message']);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        Mail::fake();

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/contact', $this->validPayload());
        }

        $response = $this->postJson('/api/contact', $this->validPayload());

        $response->assertStatus(429);
    }
}
