/**
 * NetworkErrorPage - Страница ошибки сети
 * 
 * Отображается когда нет подключения к интернету
 * или произошла ошибка сети
 */

import React from 'react';

const NetworkErrorPage: React.FC = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="network-error-page min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center px-4 max-w-md">
                {/* Иконка ошибки сети */}
                <div className="mb-8">
                    <svg
                        className="mx-auto w-32 h-32 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Нет подключения к интернету
                    </h2>
                    <p className="text-gray-600 text-lg mb-2">
                        Проверьте подключение к сети и попробуйте снова
                    </p>
                    <p className="text-gray-500 text-sm">
                        Возможно, проблема на стороне сервера. Мы уже работаем над её устранением.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleRetry}
                        className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        Попробовать снова
                    </button>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                        Назад
                    </button>
                </div>

                {/* Советы по устранению проблемы */}
                <div className="mt-12 text-left bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Что можно попробовать:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Проверьте подключение Wi-Fi или мобильных данных</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Перезагрузите роутер</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Попробуйте открыть другие сайты</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Обратитесь к вашему интернет-провайдеру</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NetworkErrorPage;

