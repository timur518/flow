/**
 * MobileHeader - Мобильная шапка сайта
 *
 * Содержит:
 * - Кнопка выбора города (слева)
 * - Расширяемая поисковая строка (справа)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCities } from '@/contexts';
import { useCity } from '@/hooks';
import { productService } from '@/api/services';
import { SearchSuggestions } from '@/components/common';
import type { SearchSuggestion } from '@/components/common/SearchSuggestions';
import markerIcon from '/public/images/icons/marker.svg';

const MobileHeader: React.FC = () => {
    const navigate = useNavigate();
    const { cities, loading: citiesLoading } = useCities();
    const { selectedCityId, setSelectedCityId, isInitialized: cityInitialized } = useCity();

    // City dropdown state
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [isWaitingForSearch, setIsWaitingForSearch] = useState(false);

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Закрытие dropdown и поиска при клике вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                // Закрываем поиск если кликнули вне и поле пустое
                if (!searchQuery.trim()) {
                    setIsSearchOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchQuery]);

    // Фокус на инпуте при открытии поиска
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

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

        // Запускаем поиск с задержкой 2 секунды после остановки ввода
        searchTimeoutRef.current = setTimeout(async () => {
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
                setShowSuggestions(true);
            } catch (error) {
                console.error('Search error:', error);
                setSearchSuggestions([]);
                setShowSuggestions(true);
            } finally {
                setIsSearching(false);
            }
        }, 2000);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, selectedCityId]);

    const currentCity = cities.find(city => city.id === selectedCityId);

    const getCityDisplayText = () => {
        if (citiesLoading || !cityInitialized) {
            return 'Загрузка...';
        }
        return currentCity?.name || 'Выберите город';
    };

    const handleSearchButtonClick = () => {
        if (isSearchOpen) {
            // Если поиск уже открыт и есть запрос - выполняем поиск
            if (searchQuery.trim()) {
                navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
                closeSearch();
            }
        } else {
            // Открываем поиск
            setIsSearchOpen(true);
        }
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        navigate(`/product/${suggestion.id}`);
        closeSearch();
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedSuggestionIndex(-1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            closeSearch();
            return;
        }

        if (e.key === 'Enter' && searchQuery.trim()) {
            if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
                e.preventDefault();
                handleSuggestionClick(searchSuggestions[selectedSuggestionIndex]);
            } else {
                navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
                closeSearch();
            }
            return;
        }

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
        }
    };

    return (
        <header className="mobile-header">
            <div className="mobile-header-content">
                {/* Кнопка выбора города */}
                <div className={`relative mobile-city-wrapper ${isSearchOpen ? 'hidden' : ''}`} ref={cityDropdownRef}>
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

                {/* Обёртка для поиска и подсказок */}
                <div className="mobile-search-wrapper" ref={searchContainerRef}>
                    {/* Поисковая строка */}
                    <div className={`mobile-search-container ${isSearchOpen ? 'expanded' : ''}`}>
                        {/* Кнопка закрытия поиска */}
                        {isSearchOpen && (
                            <button
                                onClick={closeSearch}
                                className="mobile-search-close"
                                type="button"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Поле ввода */}
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Поиск по цветам"
                            className="mobile-search-input"
                            autoComplete="off"
                        />

                        {/* Кнопка поиска */}
                        <button
                            onClick={handleSearchButtonClick}
                            className="mobile-search-button"
                            type="button"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mobile-search-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Поисковые подсказки - ВЫНЕСЕНЫ из контейнера поиска */}
                    {isSearchOpen && showSuggestions && (
                        <SearchSuggestions
                            suggestions={searchSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                            selectedIndex={selectedSuggestionIndex}
                            searchQuery={searchQuery}
                            isLoading={isWaitingForSearch || isSearching}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;

