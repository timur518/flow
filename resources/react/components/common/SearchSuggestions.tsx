/**
 * SearchSuggestions Component
 * Компонент для отображения поисковых подсказок товаров
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface SearchSuggestion {
    id: number;
    name: string;
    price: string;
    sale_price: string | null;
    image: string | null;
}

interface SearchSuggestionsProps {
    suggestions: SearchSuggestion[];
    onSuggestionClick: (suggestion: SearchSuggestion) => void;
    selectedIndex: number;
    isSearching: boolean;
    searchQuery: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
    suggestions,
    onSuggestionClick,
    selectedIndex,
    isSearching,
    searchQuery,
}) => {
    // Не показываем ничего, если поиск не выполнялся или запрос пустой
    if (!isSearching || !searchQuery.trim()) {
        return null;
    }

    // Показываем сообщение "Ничего не найдено", если нет результатов
    if (suggestions.length === 0) {
        return (
            <div className="search-suggestions">
                <div className="search-suggestion-empty">
                    Ничего не найдено. Попробуйте другие слова
                </div>
            </div>
        );
    }

    return (
        <div className="search-suggestions">
            {suggestions.map((suggestion, index) => {
                // Определяем актуальную цену (со скидкой или обычную)
                const displayPrice = suggestion.sale_price || suggestion.price;

                return (
                    <Link
                        key={suggestion.id}
                        to={`/product/${suggestion.id}`}
                        className={`search-suggestion-item ${
                            index === selectedIndex ? 'selected' : ''
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onSuggestionClick(suggestion);
                        }}
                    >
                        {/* Круглое фото товара */}
                        <div className="search-suggestion-image">
                            {suggestion.image ? (
                                <img src={suggestion.image} alt={suggestion.name} />
                            ) : (
                                <div className="search-suggestion-image-placeholder" />
                            )}
                        </div>

                        {/* Название товара */}
                        <div className="search-suggestion-name">
                            {suggestion.name}
                        </div>

                        {/* Цена товара */}
                        <div className="search-suggestion-price">
                            {displayPrice} ₽
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SearchSuggestions;

