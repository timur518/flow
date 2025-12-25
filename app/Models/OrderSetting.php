<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderSetting extends Model
{
    protected $fillable = [
        'bulk_price_change_enabled',
        'price_change_percentage',
        'selected_category_ids',
        'telegram_bot_token',
        'telegram_chat_ids',
        'telegram_notifications_enabled',
        'email_new_order_to_customer',
        'email_delivery_complete_to_customer',
        'email_new_order_to_admin',
        'admin_email',
    ];

    protected $casts = [
        'bulk_price_change_enabled' => 'boolean',
        'price_change_percentage' => 'decimal:2',
        'selected_category_ids' => 'array',
        'telegram_notifications_enabled' => 'boolean',
        'email_new_order_to_customer' => 'boolean',
        'email_delivery_complete_to_customer' => 'boolean',
        'email_new_order_to_admin' => 'boolean',
    ];
}
