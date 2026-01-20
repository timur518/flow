/**
 * MobileHeader - Мобильная шапка сайта
 *
 * Содержит:
 * - Кнопка выбора города (слева)
 * - Кнопка поиска (справа)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCities } from '@/contexts';
import { useCity } from '@/hooks';
import markerIcon from '/public/images/icons/marker.svg';

interface MobileHeaderProps {
    onSearchClick?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onSearchClick }) => {
    const { cities, loading: citiesLoading } = useCities();
    const { selectedCityId, setSelectedCityId, isInitialized: cityInitialized } = useCity();
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentCity = cities.find(city => city.id === selectedCityId);

    // Определяем текст для отображения
    const getCityDisplayText = () => {
        if (citiesLoading || !cityInitialized) {
            return 'Загрузка...';
        }
        return currentCity?.name || 'Выберите город';
    };

    return (
        <header className="mobile-header">
            <div className="mobile-header-content">
                {/* Кнопка выбора города */}
                <div className="relative" ref={cityDropdownRef}>
                    <button
                        onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                        className={`mobile-city-button ${isCityDropdownOpen ? 'open' : ''}`}
                    >
                        <img src={markerIcon} alt="Город" className="mobile-city-icon" />
                        <span className="mobile-city-text">
                            {getCityDisplayText()}
                        </span>
                    </button>

                    {/* Dropdown городов */}
                    <div className={`mobile-city-dropdown ${isCityDropdownOpen ? 'open' : ''}`}>
                        {cities.map((city) => (
                            <button
                                key={city.id}
                                onClick={() => {
                                    setSelectedCityId(city.id);
                                    setIsCityDropdownOpen(false);
                                }}
                                className={`mobile-city-dropdown-item ${
                                    city.id === selectedCityId ? 'active' : ''
                                }`}
                            >
                                <img src={markerIcon} alt="Город" className="mobile-city-dropdown-icon" />
                                <span className="mobile-city-dropdown-text">{city.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Кнопка поиска */}
                <button
                    onClick={onSearchClick}
                    className="mobile-search-button"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mobile-search-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;

