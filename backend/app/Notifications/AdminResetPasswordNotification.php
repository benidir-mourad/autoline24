<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $token
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $resetUrl = sprintf(
            '%s/admin/reset-password?token=%s&email=%s',
            $frontendUrl,
            urlencode($this->token),
            urlencode($notifiable->getEmailForPasswordReset())
        );

        return (new MailMessage())
            ->subject('Réinitialisation du mot de passe admin')
            ->greeting('Bonjour,')
            ->line('Vous recevez cet e-mail car une demande de réinitialisation du mot de passe admin a été faite.')
            ->action('Réinitialiser le mot de passe', $resetUrl)
            ->line('Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.');
    }
}
