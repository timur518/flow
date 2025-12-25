<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Resources\Pages\CreateRecord;

class CreateOrder extends CreateRecord
{
    protected static string $resource = OrderResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['order_number'] = Order::generateOrderNumber();

        return $data;
    }

    protected function afterCreate(): void
    {
        $this->recalculateOrderTotals();
    }

    protected function recalculateOrderTotals(): void
    {
        $order = $this->record;

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

