<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Создаём новое письмо.
     */
    public function __construct(
        public User $user
    ) {}

    /**
     * Заголовок письма.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Добро пожаловать! Регистрация прошла успешно',
        );
    }

    /**
     * Содержимое письма.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
        );
    }

    /**
     * Прикрепления к письму.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

