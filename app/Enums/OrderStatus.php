<?php

namespace App\Enums;

enum OrderStatus: string
{
    case NEW = 'new';
    case PROCESSING = 'processing';
    case ASSEMBLING = 'assembling';
    case AWAITING_DELIVERY = 'awaiting_delivery';
    case DELIVERING = 'delivering';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::NEW => 'Новый',
            self::PROCESSING => 'В обработке',
            self::ASSEMBLING => 'Собирается',
            self::AWAITING_DELIVERY => 'Ожидает доставку',
            self::DELIVERING => 'Доставляется',
            self::COMPLETED => 'Завершен',
            self::CANCELLED => 'Отменен',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::NEW => 'info',
            self::PROCESSING => 'warning',
            self::ASSEMBLING => 'warning',
            self::AWAITING_DELIVERY => 'gray',
            self::DELIVERING => 'primary',
            self::COMPLETED => 'success',
            self::CANCELLED => 'danger',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn ($case) => [$case->value => $case->label()])->toArray();
    }
}

