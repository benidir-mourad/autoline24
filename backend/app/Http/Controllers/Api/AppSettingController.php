<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class AppSettingController extends Controller
{
    private array $contactDefaults = [
        'contact_phone' => '+32 470 00 00 00',
        'contact_email' => 'contact@autoline24.test',
        'contact_address' => 'Rue de l Exemple 1, 1000 Bruxelles',
        'company_vat' => 'BE 0123.456.789',
        'contact_map_embed_url' => 'https://www.google.com/maps?q=Bruxelles&output=embed',
    ];

    public function publicContact()
    {
        return response()->json($this->getContactSettings());
    }

    public function adminContact()
    {
        return response()->json($this->getContactSettings());
    }

    public function updateContact(Request $request)
    {
        $validated = $request->validate([
            'contact_phone' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_address' => ['required', 'string', 'max:500'],
            'company_vat' => ['nullable', 'string', 'max:255'],
            'contact_map_embed_url' => ['nullable', 'url', 'max:2000'],
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'message' => 'Coordonnées mises à jour avec succès.',
            'settings' => $this->getContactSettings(),
        ]);
    }

    private function getContactSettings(): array
    {
        $storedSettings = AppSetting::query()
            ->whereIn('key', array_keys($this->contactDefaults))
            ->pluck('value', 'key')
            ->all();

        return array_merge($this->contactDefaults, $storedSettings);
    }
}
