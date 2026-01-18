/**
 * Settings Types
 * Типы для настроек сайта
 */

export interface SiteSettings {
    site_brand: string | null;
    site_domain: string | null;
    appearance: AppearanceSettings;
    seo: SeoSettings;
}

export interface AppearanceSettings {
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
}

export interface SeoSettings {
    home_title: string | null;
    home_description: string | null;
    yandex_metrika_code: string | null;
    custom_head_scripts: string | null;
}

