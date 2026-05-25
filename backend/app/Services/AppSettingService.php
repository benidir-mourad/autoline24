<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;

class AppSettingService
{
    private const CONTACT_DEFAULTS = [
        'contact_phone'          => '+32 470 00 00 00',
        'contact_email'          => 'contact@autoline24.test',
        'contact_address'        => 'Rue de l Exemple 1, 1000 Bruxelles',
        'company_vat'            => 'BE 0123.456.789',
        'contact_map_embed_url'  => 'https://www.google.com/maps?q=Bruxelles&output=embed',
    ];

    private const MAIL_KEYS = [
        'mail_host',
        'mail_port',
        'mail_encryption',
        'mail_username',
        'mail_password',
        'mail_from_address',
    ];

    public function getContactSettings(): array
    {
        $stored = AppSetting::whereIn('key', array_keys(self::CONTACT_DEFAULTS))
            ->pluck('value', 'key')
            ->all();

        return array_merge(self::CONTACT_DEFAULTS, $stored);
    }

    public function applyMailSettings(): void
    {
        $settings = AppSetting::whereIn('key', self::MAIL_KEYS)
            ->pluck('value', 'key')
            ->all();

        if (empty($settings['mail_host'])) {
            return;
        }

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $settings['mail_host']);
        Config::set('mail.mailers.smtp.port', (int) ($settings['mail_port'] ?? 587));
        Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] === 'none' ? null : ($settings['mail_encryption'] ?? 'tls'));
        Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? '');
        Config::set('mail.mailers.smtp.password', $this->decryptMailPassword($settings['mail_password'] ?? ''));
        Config::set('mail.from.address', $settings['mail_from_address'] ?? '');
        Config::set('mail.from.name', config('app.name'));

        app('mail.manager')->purge('smtp');
    }

    public function encryptMailPassword(string $password): string
    {
        return Crypt::encryptString($password);
    }

    private function decryptMailPassword(string $stored): string
    {
        if (empty($stored)) {
            return '';
        }

        try {
            return Crypt::decryptString($stored);
        } catch (\Exception) {
            // Legacy: password was stored as plain text before encryption was introduced
            return $stored;
        }
    }
}
