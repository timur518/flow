<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,

            // Статусы
            'status' => $this->status,
            'status_label' => \App\Enums\OrderStatus::from($this->status)->label(),
            'payment_type' => $this->payment_type,
            'payment_type_label' => \App\Enums\PaymentType::from($this->payment_type)->label(),
            'payment_status' => $this->payment_status,
            'payment_status_label' => \App\Enums\PaymentStatus::from($this->payment_status)->label(),
            'payment_id' => $this->payment_id,
            'payment_url' => $this->payment_url,

            // Промокод и курьер
            'promo_code' => $this->promo_code,
            'courier' => $this->courier,

            // Информация о заказчике
            'user_id' => $this->user_id,
            'customer_phone' => $this->customer_phone,
            'is_anonymous' => (bool) $this->is_anonymous,
            'user' => $this->when($this->user, function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }),

            // Получатель заказа
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'recipient_social' => $this->recipient_social,

            // Информация о доставке
            'city_id' => $this->city_id,
            'store_id' => $this->store_id,
            'city' => $this->when($this->city, function () {
                return [
                    'id' => $this->city->id,
                    'name' => $this->city->name,
                ];
            }),
            'store' => $this->when($this->store, function () {
                return [
                    'id' => $this->store->id,
                    'phone' => $this->store->phone,
                    'social_links' => [
                        'whatsapp' => $this->store->whatsapp_url,
                        'telegram_chat' => $this->store->telegram_chat_url,
                    ],
                ];
            }),
            'delivery_type' => $this->delivery_type,
            'delivery_type_label' => \App\Enums\DeliveryType::from($this->delivery_type)->label(),
            'delivery_address' => $this->delivery_address,
            'delivery_date' => $this->delivery_date?->format('Y-m-d'),
            'delivery_time' => $this->delivery_time,

            // Суммы
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'delivery_cost' => (float) $this->delivery_cost,
            'total' => (float) $this->total,

            // Товары
            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            // Даты
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
