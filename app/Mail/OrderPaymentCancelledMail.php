<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPaymentCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Создаём новое письмо.
     */
    public function __construct(
        public Order $order
    ) {}

    /**
     * Заголовок письма.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Платёж по заказу №' . $this->order->order_number . ' отменён',
        );
    }

    /**
     * Содержимое письма.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order-payment-cancelled',
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

