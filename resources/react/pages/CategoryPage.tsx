/**
 * CategoryPage - Страница категории товаров
 * 
 * Содержит:
 * - Хлебные крошки
 * - Название категории
 * - Фильтры товаров
 * - Список товаров
 * - Блок "Собрать свой букет"
 */

import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryPage: React.FC = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();

    return (
        <div className="category-page">
            {/* Хлебные крошки */}
            <section className="breadcrumbs py-4">
                <div className="container mx-auto px-4">
                    <nav className="text-sm text-gray-600">
                        <a href="/" className="hover:text-gray-900">Главная</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{categorySlug || 'Категория'}</span>
                    </nav>
                </div>
            </section>

            {/* Заголовок категории */}
            <section className="category-header py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold">{categorySlug || 'Категория'}</h1>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Фильтры (боковая панель) */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-bold mb-4">Фильтры</h3>
                            {/* TODO: Добавить компонент фильтров */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Цена</h4>
                                    <div className="bg-gray-100 h-20 rounded flex items-center justify-center">
                                        <p className="text-gray-500 text-sm">Фильтр цены</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Теги</h4>
                                    <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                                        <p className="text-gray-500 text-sm">Фильтр тегов</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Основной контент */}
                    <main className="flex-1">
                        {/* Сортировка и количество товаров */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Найдено товаров: 0</p>
                            <select className="border rounded-lg px-4 py-2">
                                <option>По популярности</option>
                                <option>По цене (возрастанию)</option>
                                <option>По цене (убыванию)</option>
                                <option>Новинки</option>
                            </select>
                        </div>

                        {/* Список товаров */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                                    <p className="text-gray-500">Карточка товара {item}</p>
                                </div>
                            ))}
                        </div>

                        {/* Пагинация */}
                        <div className="flex justify-center mb-12">
                            <div className="bg-gray-100 h-12 w-64 rounded flex items-center justify-center">
                                <p className="text-gray-500">Пагинация</p>
                            </div>
                        </div>

                        {/* Блок "Собрать свой букет" */}
                        <section className="custom-bouquet-section py-12 bg-gray-50 rounded-lg">
                            <div className="px-6">
                                <h2 className="text-3xl font-bold mb-6">Собрать свой букет</h2>
                                {/* TODO: Добавить компонент CustomBouquetBlock */}
                                <div className="bg-white h-64 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Блок "Собрать свой букет"</p>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;

