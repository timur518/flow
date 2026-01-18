/**
 * Header - Шапка сайта
 *
 * Содержит:
 * - Логотип из настроек
 * - Выбор города (выпадающий список)
 * - Поиск
 * - Кнопка Telegram
 * - Профиль/Вход
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSettings, useCities, useAuth, useCity } from '@/hooks';

interface HeaderProps {
    onLoginClick?: () => void;
    onCartClick?: () => void;
    cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({
    onLoginClick,
    onCartClick,
    cartItemsCount = 0
}) => {
    const { settings } = useSettings();
    const { cities } = useCities();
    const { user } = useAuth();
    const { selectedCityId, setSelectedCityId } = useCity();

    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
    const telegramUrl = 'https://t.me/your_channel'; // TODO: Получать из настроек магазина

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Search:', searchQuery);
        // TODO: Реализовать поиск
    };

    return (
        <header className="header">
            {/* Контейнер с максимальной шириной 1440px, центрирован */}
            <div className="header-container">
                <div className="header-content">
                    {/* Логотип */}
                    <a href="/" className="header-logo">
                        {settings?.appearance?.logo_url ? (
                            <img
                                src={settings.appearance.logo_url}
                                alt={settings.site_brand || 'Logo'}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🌸</span>
                                </div>
                                <div>
                                    <div className="font-bold text-xl text-gray-900">
                                        {settings?.site_brand || 'FlowerShop'}
                                    </div>
                                    <div className="text-xs text-gray-500">Доставка цветов</div>
                                </div>
                            </div>
                        )}
                    </a>

                    {/* Выбор города */}
                    <div className="relative flex-shrink-0" ref={cityDropdownRef}>
                        <button
                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                            className={`city-selector-button ${isCityDropdownOpen ? 'open' : ''}`}
                        >
                            {/* Иконка в белом кружке 35px */}
                            <div className="city-selector-icon">
                                <svg fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="city-selector-text">
                                {currentCity?.name || 'Выберите город'}
                            </span>
                        </button>

                        {/* Dropdown городов */}
                        <div className={`city-dropdown ${isCityDropdownOpen ? 'open' : ''}`}>
                                {cities.map((city) => (
                                    <button
                                        key={city.id}
                                        onClick={() => {
                                            setSelectedCityId(city.id);
                                            setIsCityDropdownOpen(false);
                                        }}
                                        className={`city-dropdown-item ${
                                            city.id === selectedCityId ? 'active' : ''
                                        }`}
                                    >
                                        <div className="city-dropdown-icon">
                                            <svg fill="none" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <span className="city-dropdown-text">{city.name}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Поиск */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по цветам"
                                className="search-input"
                            />
                            <button
                                type="submit"
                                className="search-button"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Кнопки действий */}
                    <div className="header-actions">
                        {/* Telegram - круглая кнопка, фон #F9F9F9, иконка #FDAFC0 */}
                        <a
                            href={telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="header-button-round"
                            title="Telegram"
                        >
                            <div className="header-button-icon">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                                </svg>
                            </div>
                        </a>

                        {/* Профиль - фон #F9F9F9, радиус 32px, иконка в белом кружке #FDAFC0 */}
                        <button
                            onClick={onLoginClick}
                            className="header-button"
                        >
                            <div className="header-button-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="header-button-text">
                                {user ? user.name : 'Войти'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

