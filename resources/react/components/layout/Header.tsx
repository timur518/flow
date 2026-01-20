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
import { Link, useNavigate } from 'react-router-dom';
import { useSettings, useCities } from '@/contexts';
import { useAuth, useCity, useStores, useModals } from '@/hooks';
import { productService } from '@/api/services';
import { SearchSuggestions } from '@/components/common';
import type { SearchSuggestion } from '@/components/common/SearchSuggestions';
import markerIcon from '/public/images/icons/marker.svg';
import profileIcon from '/public/images/icons/profile.svg';

const Header: React.FC = () => {
    const { openAuthModal, openProfileModal } = useModals();
    const { settings } = useSettings();
    const { cities, loading: citiesLoading } = useCities();
    const { user } = useAuth();
    const { selectedCityId, setSelectedCityId, isInitialized: cityInitialized } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });
    const navigate = useNavigate();

    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [isWaitingForSearch, setIsWaitingForSearch] = useState(false);

    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentCity = cities.find(city => city.id === selectedCityId);
    const currentStore = stores.length > 0 ? stores[0] : null;
    const telegramUrl = currentStore?.social_links?.telegram_chat;

    // Определяем текст для отображения
    const getCityDisplayText = () => {
        if (citiesLoading || !cityInitialized) {
            return 'Загрузка...';
        }
        return currentCity?.name || 'Выберите город';
    };

    // Поиск товаров с debounce
    useEffect(() => {
        // Очищаем предыдущий таймер
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Если запрос пустой, очищаем подсказки
        if (!searchQuery.trim()) {
            setSearchSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
            setIsWaitingForSearch(false);
            return;
        }

        // Показываем индикатор ожидания сразу
        setIsWaitingForSearch(true);
        setShowSuggestions(true);

        // Запускаем поиск с задержкой 2 секунды после остановки ввода (защита от избыточных запросов)
        searchTimeoutRef.current = setTimeout(async () => {
            // Устанавливаем флаг поиска только перед самим запросом
            setIsSearching(true);
            setIsWaitingForSearch(false);

            try {
                const products = await productService.getProducts({
                    search: searchQuery,
                    city_id: selectedCityId || undefined,
                });

                // Ограничиваем количество подсказок до 5
                const suggestions: SearchSuggestion[] = products.slice(0, 5).map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    sale_price: product.sale_price,
                    image: product.image,
                }));

                setSearchSuggestions(suggestions);
                // Показываем подсказки всегда, даже если результатов нет (для сообщения "Ничего не найдено")
                setShowSuggestions(true);
            } catch (error) {
                console.error('Search error:', error);
                setSearchSuggestions([]);
                setShowSuggestions(true); // Показываем сообщение об ошибке/отсутствии результатов
            } finally {
                setIsSearching(false);
            }
        }, 2000); // 2 секунды задержки после остановки ввода

        // Cleanup
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, selectedCityId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Переходим на страницу поиска или каталога с фильтром
            navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setSearchQuery('');
        setShowSuggestions(false);
        setSearchSuggestions([]);
        navigate(`/product/${suggestion.id}`);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedSuggestionIndex(-1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || searchSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < searchSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
                    e.preventDefault();
                    handleSuggestionClick(searchSuggestions[selectedSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    return (
        <header className="header">
            {/* Контейнер с максимальной шириной 1440px, центрирован */}
            <div className="header-container">
                <div className="header-content">
                    {/* Логотип */}
                    <Link to="/" className="header-logo">
                        {settings?.appearance?.logo_url && (
                            <img
                                src={settings.appearance.logo_url}
                                alt={settings.site_brand || 'Logo'}
                            />
                        )}
                    </Link>

                    {/* Выбор города */}
                    <div className="relative flex-shrink-0" ref={cityDropdownRef}>
                        <button
                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                            className={`city-selector-button ${isCityDropdownOpen ? 'open' : ''}`}
                        >
                            {/* Иконка в белом кружке 35px */}
                            <div className="city-selector-icon">
                                <img src={markerIcon} alt="Город" />
                            </div>
                            <span className="city-selector-text">
                                {getCityDisplayText()}
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
                                            <img src={markerIcon} alt="Город" />
                                        </div>
                                        <span className="city-dropdown-text">{city.name}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Поиск */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-container" ref={searchContainerRef}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Поиск по цветам"
                                className="search-input"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="search-button"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/* Поисковые подсказки */}
                            {showSuggestions && (
                                <SearchSuggestions
                                    suggestions={searchSuggestions}
                                    onSuggestionClick={handleSuggestionClick}
                                    selectedIndex={selectedSuggestionIndex}
                                    searchQuery={searchQuery}
                                    isLoading={isWaitingForSearch || isSearching}
                                />
                            )}
                        </div>
                    </form>

                    {/* Кнопки действий */}
                    <div className="header-actions">
                        {/* Telegram - круглая кнопка, фон #F9F9F9, иконка #FDAFC0 */}
                        {telegramUrl && (
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
                        )}

                        {/* Профиль - фон #F9F9F9, радиус 32px, иконка в белом кружке #FDAFC0 */}
                        <button
                            onClick={() => user ? openProfileModal() : openAuthModal()}
                            className="header-button"
                        >
                            <div className="header-button-icon">
                                <img src={profileIcon} alt="Профиль" />
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

