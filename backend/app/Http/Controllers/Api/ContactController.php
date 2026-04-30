<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:255'],
            'message'   => ['required', 'string', 'max:3000'],
            'car_label' => ['nullable', 'string', 'max:255'],
        ]);

        $this->applyMailSettings();

        $to = AppSetting::where('key', 'mail_from_address')->value('value')
            ?? config('mail.from.address');

        $subject = $validated['car_label']
            ? 'Demande d\'infos — ' . $validated['car_label']
            : 'Nouveau message de contact';

        $body = implode("\n", array_filter([
            $validated['car_label'] ? 'Véhicule : ' . $validated['car_label'] : null,
            'De : ' . $validated['name'] . ' <' . $validated['email'] . '>',
            '',
            $validated['message'],
        ]));

        Mail::raw($body, function ($mail) use ($to, $subject, $validated) {
            $mail->to($to)
                 ->replyTo($validated['email'], $validated['name'])
                 ->subject($subject);
        });

        return response()->json(['message' => 'Message envoyé avec succès.']);
    }

    private function applyMailSettings(): void
    {
        $settings = AppSetting::whereIn('key', [
            'mail_host', 'mail_port', 'mail_encryption',
            'mail_username', 'mail_password', 'mail_from_address',
        ])->pluck('value', 'key')->all();

        if (empty($settings['mail_host'])) {
            return;
        }

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $settings['mail_host']);
        Config::set('mail.mailers.smtp.port', (int) ($settings['mail_port'] ?? 587));
        Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] === 'none' ? null : ($settings['mail_encryption'] ?? 'tls'));
        Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? '');
        Config::set('mail.mailers.smtp.password', $settings['mail_password'] ?? '');
        Config::set('mail.from.address', $settings['mail_from_address'] ?? '');
        Config::set('mail.from.name', config('app.name'));

        app('mail.manager')->purge('smtp');
    }
}
