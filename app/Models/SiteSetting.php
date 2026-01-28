<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'site_brand',
        'site_domain',
        'logo_path',
        'favicon_path',
        'primary_color',
        'secondary_color',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_from_email',
        'smtp_from_name',
        'home_title',
        'home_description',
        'yandex_metrika_code',
        'custom_head_scripts',
    ];

    protected $casts = [
        'smtp_port' => 'integer',
    ];
}
