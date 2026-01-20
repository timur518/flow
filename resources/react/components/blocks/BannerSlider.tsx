/**
 * BannerSlider - Карусель баннеров
 *
 * Отображает 3 баннера горизонтально с возможностью прокрутки
 * Формат баннеров: 3:4 (вертикальные)
 * Фильтруется по выбранному городу
 */

import React, { useState, useRef, useEffect } from 'react';
import { useBanners, useCity } from '@/hooks';

const BannerSlider: React.FC = () => {
    const { selectedCityId } = useCity();
    const { banners, loading, error } = useBanners({ city_id: selectedCityId || undefined });
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Состояние для drag-to-scroll
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Количество видимых баннеров
    const visibleCount = 3;
    const maxIndex = Math.max(0, banners.length - visibleCount);

    const scrollToIndex = (index: number) => {
        setCurrentIndex(index);
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = container.scrollWidth / banners.length;
            container.scrollTo({
                left: itemWidth * index,
                behavior: 'smooth'
            });
        }
    };

    const handlePrev = () => {
        const newIndex = Math.max(0, currentIndex - 1);
        scrollToIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = Math.min(maxIndex, currentIndex + 1);
        scrollToIndex(newIndex);
    };

    // Проверка мобильного устройства
    const isMobile = () => window.innerWidth <= 768;

    // Обработчики для drag-to-scroll (только для десктопа)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMobile() || !scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMobile() || !isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Множитель для скорости прокрутки
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleDragEnd = () => {
        if (isMobile()) return;
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
        }
    };

    // Отслеживаем изменение позиции скролла для обновления currentIndex
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = container.clientWidth;
            const newIndex = Math.round(container.scrollLeft / itemWidth);
            setCurrentIndex(Math.min(Math.max(0, newIndex), banners.length - 1));
        }
    };

    // Предотвращаем клик при драге
    const handleClick = (e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
        }
    };

    // Добавляем глобальные обработчики для завершения драга
    useEffect(() => {
        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    if (loading) {
        return (
            <div className="block-container banner-carousel">
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-200 aspect-[3/4] rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || banners.length === 0) {
        return null;
    }

    return (
        <div className="block-container banner-carousel">
            {/* Контейнер с баннерами */}
            <div className="banner-carousel-inner">
                <div
                    ref={scrollContainerRef}
                    className="banner-carousel-scroll"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                    onClick={handleClick}
                    onScroll={handleScroll}
                >
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="banner-item"
                        >
                            <div className="banner-image-wrapper">
                                <img
                                    src={banner.image}
                                    alt={banner.name}
                                    className="banner-image"
                                />
                                {/* Название баннера */}
                                <div className="banner-title">
                                    {banner.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Кнопки навигации */}
                {banners.length > visibleCount && (
                    <>
                        {/* Кнопка "Назад" */}
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={`banner-nav-button banner-nav-prev ${
                                currentIndex === 0 ? 'disabled' : ''
                            }`}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Кнопка "Вперед" */}
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= maxIndex}
                            className={`banner-nav-button banner-nav-next ${
                                currentIndex >= maxIndex ? 'disabled' : ''
                            }`}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Индикаторы пагинации (кружочки) - для мобильных */}
                {banners.length > 1 && (
                    <div className="banner-pagination">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToIndex(index)}
                                className={`banner-pagination-dot ${
                                    index === currentIndex ? 'active' : ''
                                }`}
                                aria-label={`Перейти к баннеру ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerSlider;

