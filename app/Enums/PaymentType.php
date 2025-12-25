<?php

namespace App\Enums;

enum PaymentType: string
{
    case ON_DELIVERY = 'on_delivery';
    case ONLINE = 'online';

    public function label(): string
    {
        return match ($this) {
            self::ON_DELIVERY => 'При получении',
            self::ONLINE => 'Онлайн оплата',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn ($case) => [$case->value => $case->label()])->toArray();
    }
}

