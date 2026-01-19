/**
 * useDaData Hook
 * Хук для работы с DaData API (подсказки адресов и получение координат)
 */

import { useState, useCallback, useMemo } from 'react';

// Типы для DaData
export interface DaDataSuggestion {
    value: string;
    unrestricted_value: string;
    data: {
        postal_code: string | null;
        country: string;
        country_iso_code: string;
        federal_district: string | null;
        region_fias_id: string;
        region_kladr_id: string;
        region_iso_code: string;
        region_with_type: string;
        region_type: string;
        region_type_full: string;
        region: string;
        area_fias_id: string | null;
        area_kladr_id: string | null;
        area_with_type: string | null;
        area_type: string | null;
        area_type_full: string | null;
        area: string | null;
        city_fias_id: string | null;
        city_kladr_id: string | null;
        city_with_type: string | null;
        city_type: string | null;
        city_type_full: string | null;
        city: string | null;
        city_area: string | null;
        city_district_fias_id: string | null;
        city_district_kladr_id: string | null;
        city_district_with_type: string | null;
        city_district_type: string | null;
        city_district_type_full: string | null;
        city_district: string | null;
        settlement_fias_id: string | null;
        settlement_kladr_id: string | null;
        settlement_with_type: string | null;
        settlement_type: string | null;
        settlement_type_full: string | null;
        settlement: string | null;
        street_fias_id: string | null;
        street_kladr_id: string | null;
        street_with_type: string | null;
        street_type: string | null;
        street_type_full: string | null;
        street: string | null;
        house_fias_id: string | null;
        house_kladr_id: string | null;
        house_type: string | null;
        house_type_full: string | null;
        house: string | null;
        block_type: string | null;
        block_type_full: string | null;
        block: string | null;
        flat_type: string | null;
        flat_type_full: string | null;
        flat: string | null;
        flat_area: string | null;
        square_meter_price: string | null;
        flat_price: string | null;
        postal_box: string | null;
        fias_id: string;
        fias_code: string | null;
        fias_level: string;
        fias_actuality_state: string;
        kladr_id: string;
        geoname_id: string | null;
        capital_marker: string;
        okato: string | null;
        oktmo: string | null;
        tax_office: string | null;
        tax_office_legal: string | null;
        timezone: string | null;
        geo_lat: string | null;
        geo_lon: string | null;
        beltway_hit: string | null;
        beltway_distance: string | null;
        metro: any | null;
        qc_geo: string;
        qc_complete: string | null;
        qc_house: string | null;
        history_values: string[] | null;
        unparsed_parts: string | null;
        source: string | null;
        qc: string | null;
    };
}

export interface DaDataResponse {
    suggestions: DaDataSuggestion[];
}

export const useDaData = (allowedRegions?: string[]) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiKey = import.meta.env.VITE_DADATA_API_KEY;
    const apiUrl = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

    // Мемоизируем строковое представление регионов для стабильности зависимостей
    const regionsKey = useMemo(() =>
        allowedRegions ? JSON.stringify(allowedRegions) : '',
        [allowedRegions]
    );

    /**
     * Получить подсказки адресов
     */
    const getSuggestions = useCallback(async (query: string): Promise<DaDataSuggestion[]> => {
        if (!apiKey) {
            console.error('DaData API key is not configured');
            return [];
        }

        if (!query || query.length < 3) {
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            // Формируем тело запроса
            const requestBody: any = {
                query,
                count: 10,
            };

            // Если указаны разрешенные регионы, добавляем фильтр
            if (allowedRegions && allowedRegions.length > 0) {
                requestBody.locations = allowedRegions.map(region => ({
                    region: region
                }));
                console.log('DaData request with regions:', allowedRegions);
            } else {
                console.log('DaData request without region filter');
            }

            console.log('DaData request body:', requestBody);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch address suggestions');
            }

            const data: DaDataResponse = await response.json();
            console.log('DaData response:', data);
            console.log('DaData suggestions count:', data.suggestions.length);
            return data.suggestions;
        } catch (err: any) {
            setError(err.message || 'Error fetching suggestions');
            console.error('DaData error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [apiKey, regionsKey, allowedRegions]);

    return {
        getSuggestions,
        loading,
        error,
    };
};

