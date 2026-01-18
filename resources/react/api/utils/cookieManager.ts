/**
 * Cookie Manager
 * Утилита для работы с cookies
 */

const CITY_COOKIE_NAME = 'selected_city_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 год в секундах

export const CookieManager = {
    /**
     * Сохранить ID города в cookies
     */
    setCityId(cityId: number): void {
        document.cookie = `${CITY_COOKIE_NAME}=${cityId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    },

    /**
     * Получить ID города из cookies
     */
    getCityId(): number | null {
        const cookies = document.cookie.split(';');
        
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            
            if (name === CITY_COOKIE_NAME) {
                const cityId = parseInt(value, 10);
                return isNaN(cityId) ? null : cityId;
            }
        }
        
        return null;
    },

    /**
     * Удалить ID города из cookies
     */
    removeCityId(): void {
        document.cookie = `${CITY_COOKIE_NAME}=; path=/; max-age=0`;
    },
};

