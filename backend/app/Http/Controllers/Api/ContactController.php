<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\AppSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function __construct(private readonly AppSettingService $settings) {}

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:255'],
            'message'   => ['required', 'string', 'max:3000'],
            'car_label' => ['nullable', 'string', 'max:255'],
        ]);

        $this->settings->applyMailSettings();

        $to = AppSetting::where('key', 'mail_from_address')->value('value')
            ?? config('mail.from.address');

        $carLabel = $validated['car_label'] ?? null;

        $subject = $carLabel
            ? 'Demande d\'infos — ' . $carLabel
            : 'Nouveau message de contact';

        $body = implode("\n", array_filter([
            $carLabel ? 'Véhicule : ' . $carLabel : null,
            'De : ' . $validated['name'] . ' <' . $validated['email'] . '>',
            '',
            $validated['message'],
        ]));

        try {
            Mail::raw($body, function ($mail) use ($to, $subject, $validated) {
                $mail->to($to)
                     ->replyTo($validated['email'], $validated['name'])
                     ->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error('Contact mail failed', ['error' => $e->getMessage()]);

            return response()->json(
                ['message' => 'Une erreur est survenue lors de l\'envoi du message.'],
                500
            );
        }

        return response()->json(['message' => 'Message envoyé avec succès.']);
    }
}
