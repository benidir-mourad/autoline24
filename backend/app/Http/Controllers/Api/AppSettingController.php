<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\AppSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppSettingController extends Controller
{
    private const MAIL_KEYS = [
        'mail_host',
        'mail_port',
        'mail_encryption',
        'mail_username',
        'mail_password',
        'mail_from_address',
    ];

    public function __construct(private readonly AppSettingService $settings) {}

    public function publicContact(): JsonResponse
    {
        return response()->json($this->settings->getContactSettings());
    }

    public function adminContact(): JsonResponse
    {
        return response()->json($this->settings->getContactSettings());
    }

    public function updateContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_phone'         => ['required', 'string', 'max:255'],
            'contact_email'         => ['required', 'email', 'max:255'],
            'contact_address'       => ['required', 'string', 'max:500'],
            'company_vat'           => ['nullable', 'string', 'max:255'],
            'contact_map_embed_url' => ['nullable', 'url', 'max:2000'],
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json([
            'message'  => 'Coordonnées mises à jour avec succès.',
            'settings' => $this->settings->getContactSettings(),
        ]);
    }

    public function adminMail(): JsonResponse
    {
        $stored = AppSetting::whereIn('key', self::MAIL_KEYS)
            ->pluck('value', 'key')
            ->all();

        return response()->json([
            'mail_host'               => $stored['mail_host'] ?? '',
            'mail_port'               => $stored['mail_port'] ?? '587',
            'mail_encryption'         => $stored['mail_encryption'] ?? 'tls',
            'mail_username'           => $stored['mail_username'] ?? '',
            'mail_from_address'       => $stored['mail_from_address'] ?? '',
            'mail_password_configured' => !empty($stored['mail_password']),
        ]);
    }

    public function updateMail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mail_host'         => ['required', 'string', 'max:255'],
            'mail_port'         => ['required', 'integer', 'min:1', 'max:65535'],
            'mail_encryption'   => ['required', 'in:tls,ssl,none'],
            'mail_username'     => ['required', 'email', 'max:255'],
            'mail_password'     => ['nullable', 'string', 'max:255'],
            'mail_from_address' => ['required', 'email', 'max:255'],
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'mail_password') {
                if ($value === null) {
                    continue;
                }
                $value = $this->settings->encryptMailPassword($value);
            }

            AppSetting::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return response()->json(['message' => 'Configuration mail mise à jour avec succès.']);
    }
}
