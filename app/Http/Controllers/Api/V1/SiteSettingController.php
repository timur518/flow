<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    /**
     * Получить настройки сайта для фронтенда
     *
     * Возвращает:
     * - Внешний вид (логотип, favicon, цвета)
     * - SEO настройки (title, description, метрика, скрипты)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::first();

        if (!$settings) {
            return response()->json([
                'success' => true,
                'data' => $this->getDefaultSettings(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                // Общие настройки
                'site_brand' => $settings->site_brand,
                'site_domain' => $settings->site_domain,

                // Внешний вид
                'appearance' => [
                    'logo_url' => $settings->logo_path 
                        ? url(Storage::disk('public')->url($settings->logo_path))
                        : null,
                    'favicon_url' => $settings->favicon_path 
                        ? url(Storage::disk('public')->url($settings->favicon_path))
                        : null,
                    'primary_color' => $settings->primary_color,
                    'secondary_color' => $settings->secondary_color,
                ],

                // SEO настройки
                'seo' => [
                    'home_title' => $settings->home_title,
                    'home_description' => $settings->home_description,
                    'yandex_metrika_code' => $settings->yandex_metrika_code,
                    'custom_head_scripts' => $settings->custom_head_scripts,
                ],
            ],
        ]);
    }

    /**
     * Получить настройки по умолчанию
     *
     * @return array
     */
    private function getDefaultSettings(): array
    {
        return [
            'site_brand' => null,
            'site_domain' => null,
            'appearance' => [
                'logo_url' => null,
                'favicon_url' => null,
                'primary_color' => null,
                'secondary_color' => null,
            ],
            'seo' => [
                'home_title' => null,
                'home_description' => null,
                'yandex_metrika_code' => null,
                'custom_head_scripts' => null,
            ],
        ];
    }
}

