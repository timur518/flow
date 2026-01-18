/**
 * useCity Hook
 * Хук для работы с выбранным городом через CityContext
 */

import { useContext } from 'react';
import { CityContext } from '@/contexts/CityContext';

export const useCity = () => {
    const context = useContext(CityContext);

    if (!context) {
        throw new Error('useCity must be used within CityProvider');
    }

    return context;
};

