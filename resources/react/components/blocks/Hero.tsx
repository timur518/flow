/**
 * Hero - Главный баннер на главной странице
 */

import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white">
            <div className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Свежие цветы с доставкой
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-white/90">
                        Создайте незабываемые моменты с нашими букетами
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                            Смотреть каталог
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
                            Собрать букет
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Декоративные элементы */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </section>
    );
};

export default Hero;

