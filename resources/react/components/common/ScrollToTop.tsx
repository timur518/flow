/**
 * ScrollToTop - Компонент для прокрутки страницы наверх при смене маршрута
 *
 * Автоматически прокручивает страницу в начало при переходе на новую страницу/категорию.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;

