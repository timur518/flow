<?php

namespace App\Enums;

enum VatCode: int
{
    case NO_VAT = 1;
    case VAT_0 = 2;
    case VAT_10 = 3;
    case VAT_20 = 4;
    case VAT_10_110 = 5;
    case VAT_20_120 = 6;
    case VAT_5 = 7;
    case VAT_7 = 8;
    case VAT_5_105 = 9;
    case VAT_7_107 = 10;
    case VAT_22 = 11;
    case VAT_22_122 = 12;

    public function label(): string
    {
        return match ($this) {
            self::NO_VAT => 'Без НДС',
            self::VAT_0 => 'НДС по ставке 0%',
            self::VAT_10 => 'НДС по ставке 10%',
            self::VAT_20 => 'НДС по ставке 20%',
            self::VAT_10_110 => 'НДС по расчетной ставке 10/110',
            self::VAT_20_120 => 'НДС по расчетной ставке 20/120',
            self::VAT_5 => 'НДС по ставке 5%',
            self::VAT_7 => 'НДС по ставке 7%',
            self::VAT_5_105 => 'НДС по расчетной ставке 5/105',
            self::VAT_7_107 => 'НДС по расчетной ставке 7/107',
            self::VAT_22 => 'НДС по ставке 22%',
            self::VAT_22_122 => 'НДС по расчетной ставке 22/122',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn ($case) => [$case->value => $case->label()])->toArray();
    }
}

