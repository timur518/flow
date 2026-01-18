/**
 * NotFoundPage - Страница 404
 * 
 * Отображается когда страница не найдена
 */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center px-4">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Страница не найдена
                    </h2>
                    <p className="text-gray-600 text-lg">
                        К сожалению, запрашиваемая страница не существует или была удалена
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        На главную
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                        Назад
                    </button>
                </div>

                {/* Декоративные элементы */}
                <div className="mt-12">
                    <svg
                        className="mx-auto w-64 h-64 text-gray-200"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

