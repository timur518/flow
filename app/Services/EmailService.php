<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    protected ?SiteSetting $settings = null;

    /**
     * Получить настройки сайта
     */
    protected function getSettings(): ?SiteSetting
    {
        if ($this->settings === null) {
            $this->settings = SiteSetting::first();
        }

        return $this->settings;
    }

    /**
     * Проверить, настроен ли SMTP
     */
    public function isConfigured(): bool
    {
        $settings = $this->getSettings();

        if (!$settings) {
            return false;
        }

        return !empty($settings->smtp_host)
            && !empty($settings->smtp_port)
            && !empty($settings->smtp_username)
            && !empty($settings->smtp_password);
    }

    /**
     * Настроить SMTP из настроек сайта
     */
    protected function configureSMTP(): void
    {
        $settings = $this->getSettings();

        if (!$settings || !$this->isConfigured()) {
            return;
        }

        // Динамически устанавливаем конфигурацию SMTP
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $settings->smtp_host);
        Config::set('mail.mailers.smtp.port', $settings->smtp_port);
        Config::set('mail.mailers.smtp.username', $settings->smtp_username);
        Config::set('mail.mailers.smtp.password', $settings->smtp_password);
        Config::set('mail.mailers.smtp.encryption', $settings->smtp_port == 465 ? 'ssl' : 'tls');

        // Устанавливаем отправителя
        $fromEmail = $settings->smtp_from_email ?: $settings->smtp_username;
        $fromName = $settings->smtp_from_name ?: $settings->site_brand ?: config('app.name');

        Config::set('mail.from.address', $fromEmail);
        Config::set('mail.from.name', $fromName);
    }

    /**
     * Отправить email
     *
     * @param string|array $to Email получателя или массив получателей
     * @param Mailable $mailable Объект письма
     * @return bool Успешность отправки
     */
    public function send(string|array $to, Mailable $mailable): bool
    {
        if (!$this->isConfigured()) {
            \Log::warning('EmailService: SMTP не настроен, письмо не отправлено', [
                'to' => $to,
                'mailable' => get_class($mailable),
            ]);
            return false;
        }

        try {
            $this->configureSMTP();

            Mail::to($to)->send($mailable);

            \Log::info('EmailService: Письмо успешно отправлено', [
                'to' => $to,
                'mailable' => get_class($mailable),
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('EmailService: Ошибка отправки письма', [
                'to' => $to,
                'mailable' => get_class($mailable),
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Получить email отправителя
     */
    public function getFromEmail(): ?string
    {
        $settings = $this->getSettings();

        if (!$settings) {
            return null;
        }

        return $settings->smtp_from_email ?: $settings->smtp_username;
    }

    /**
     * Получить имя отправителя
     */
    public function getFromName(): ?string
    {
        $settings = $this->getSettings();

        if (!$settings) {
            return config('app.name');
        }

        return $settings->smtp_from_name ?: $settings->site_brand ?: config('app.name');
    }
}

