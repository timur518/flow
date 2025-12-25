<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    public function getTitle(): string
    {
        return 'Редактировать заказ #' . $this->record->order_number;
    }

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    protected function afterSave(): void
    {
        $this->recalculateOrderTotals();
    }

    protected function recalculateOrderTotals(): void
    {
        $order = $this->record;

        // Обновляем items из БД
        $order->load('items');

        // Пересчитываем total для каждого item
        foreach ($order->items as $item) {
            $item->total = $item->price * $item->quantity;
            $item->save();
        }

        // Пересчитываем subtotal и total заказа
        $subtotal = $order->items->sum('total');
        $order->subtotal = $subtotal;
        $order->total = $subtotal - ($order->discount ?? 0);
        $order->save();
    }
}

