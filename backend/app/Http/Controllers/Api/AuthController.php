<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $this->applyMailSettings();

        Password::sendResetLink($validated);

        $response = [
            'message' => 'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.',
        ];

        if (app()->isLocal() && Config::get('mail.default') === 'log') {
            $user = User::where('email', $validated['email'])->first();

            if ($user) {
                $token = Password::broker()->createToken($user);
                $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

                $response['debug_reset_url'] = sprintf(
                    '%s/admin/reset-password?token=%s&email=%s',
                    $frontendUrl,
                    urlencode($token),
                    urlencode($user->email)
                );
            }
        }

        return response()->json($response);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset(
            $validated,
            function ($user) use ($validated) {
                $user->forceFill([
                    'password' => Hash::make($validated['password']),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        $user->tokens()->delete();
        $newToken = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès.',
            'token' => $newToken,
        ]);
    }

    public function changeEmail(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => ['required'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->forceFill([
            'email' => $validated['email'],
        ])->save();

        return response()->json([
            'message' => 'Adresse e-mail de connexion mise à jour avec succès.',
            'user' => $user->fresh(),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
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
