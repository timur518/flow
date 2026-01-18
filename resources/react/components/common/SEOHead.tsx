/**
 * SEOHead - Компонент для управления SEO метатегами
 * 
 * Динамически обновляет title и description при навигации по SPA
 */

import { useEffect } from 'react';
import { useSettings } from '@/contexts';

interface SEOHeadProps {
    title?: string;
    description?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, description }) => {
    const { settings } = useSettings();

    useEffect(() => {
        // Обновляем title
        if (title) {
            document.title = title;
        } else if (settings?.seo?.home_title) {
            document.title = settings.seo.home_title;
        }

        // Обновляем description
        const metaDescription = document.querySelector('meta[name="description"]');
        const descriptionContent = description || settings?.seo?.home_description;
        
        if (descriptionContent) {
            if (metaDescription) {
                metaDescription.setAttribute('content', descriptionContent);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = descriptionContent;
                document.head.appendChild(meta);
            }
        }
    }, [title, description, settings]);

    return null;
};

export default SEOHead;

