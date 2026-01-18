/**
 * AddressAutocomplete - Компонент автозаполнения адреса с DaData
 *
 * Переиспользуемый компонент для ввода адреса с подсказками от DaData.
 * Автоматически подтягивает координаты при выборе адреса.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDaData, DaDataSuggestion } from '@/hooks';
import { useCities } from '@/contexts';

interface AddressData {
    address: string;
    latitude: number | null;
    longitude: number | null;
}

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onCoordinatesChange?: (latitude: number | null, longitude: number | null) => void;
    onSelect?: (data: AddressData) => void; // Новый колбэк для выбора адреса с координатами
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onCoordinatesChange,
    placeholder = 'Город, улица, дом',
    className = '',
    required = false,
    disabled = false,
    id = 'address',
    name = 'address',
}) => {
    // Получаем список городов из базы данных
    const { cities } = useCities();

    // Формируем список названий городов для фильтрации (мемоизируем)
    const allowedCities = useMemo(() => cities.map(city => city.name), [cities]);

    const { getSuggestions, loading } = useDaData(allowedCities);
    const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [hasFocused, setHasFocused] = useState(false);
    const [isValueFromSuggestion, setIsValueFromSuggestion] = useState(false);
    const [isWaitingForInput, setIsWaitingForInput] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Закрытие списка при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Получение подсказок при изменении значения (только если поле было в фокусе)
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Если значение было выбрано из подсказки, не загружаем новые подсказки
            if (isValueFromSuggestion) {
                setIsWaitingForInput(false);
                return;
            }

            // Загружаем подсказки только если пользователь хотя бы раз кликнул на поле
            if (hasFocused && value.length >= 3) {
                setIsWaitingForInput(false);
                const results = await getSuggestions(value);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } else {
                setIsWaitingForInput(false);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        // Устанавливаем флаг ожидания, если пользователь вводит текст
        if (hasFocused && value.length >= 3 && !isValueFromSuggestion) {
            setIsWaitingForInput(true);
        }

        // Debounce: ждем 2 секунды после окончания ввода
        const timeoutId = setTimeout(fetchSuggestions, 2000);
        return () => clearTimeout(timeoutId);
    }, [value, getSuggestions, hasFocused, isValueFromSuggestion]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setSelectedIndex(-1);
        setIsValueFromSuggestion(false); // Пользователь вводит вручную
    };

    const handleSuggestionClick = (suggestion: DaDataSuggestion) => {
        // Устанавливаем флаг, что значение выбрано из подсказки
        setIsValueFromSuggestion(true);

        // Передаем координаты ПЕРЕД обновлением адреса
        if (onCoordinatesChange) {
            const lat = suggestion.data.geo_lat ? parseFloat(suggestion.data.geo_lat) : null;
            const lon = suggestion.data.geo_lon ? parseFloat(suggestion.data.geo_lon) : null;
            onCoordinatesChange(lat, lon);
        }

        // Обновляем значение адреса
        onChange(suggestion.value);

        // Скрываем подсказки и сбрасываем выбранный индекс
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setSuggestions([]); // Очищаем список подсказок

        // Убираем фокус с поля, чтобы не открывались подсказки снова
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="address-autocomplete-wrapper">
            <input
                ref={inputRef}
                type="text"
                id={id}
                name={name}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    setHasFocused(true);
                    // Показываем подсказки только если они есть и значение не было выбрано из подсказки
                    if (suggestions.length > 0 && !isValueFromSuggestion) {
                        setShowSuggestions(true);
                    }
                }}
                required={required}
                disabled={disabled}
                className={className}
                placeholder={placeholder}
                autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className="address-autocomplete-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`address-autocomplete-suggestion ${
                                index === selectedIndex ? 'selected' : ''
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSuggestionClick(suggestion);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="address-autocomplete-suggestion-value">
                                {suggestion.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(loading || isWaitingForInput) && hasFocused && value.length >= 3 && !showSuggestions && (
                <div className="address-autocomplete-loading">
                    {isWaitingForInput ? 'Ожидание ввода...' : 'Загрузка...'}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;

