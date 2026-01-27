/**
 * BouquetBuilder - Блок "Собрать свой букет"
 * Блок с предложением связаться для создания индивидуального букета
 */

import React from 'react';
import { useCity, useStores } from '@/hooks';
import { Telegram } from '@/components/icons';
import waIcon from '/public/images/icons/wa.svg';
import maxIcon from '/public/images/icons/max.svg';

const BouquetBuilder: React.FC = () => {
    const { selectedCityId } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });

    const currentStore = stores.length > 0 ? stores[0] : null;
    const telegramUrl = currentStore?.social_links?.telegram_chat;
    const whatsappUrl = currentStore?.social_links?.whatsapp;
    const maxUrl = currentStore?.social_links?.max_chat;

    return (
        <section className="block-container bouquet-builder">
            <div className="bouquet-builder-content">
                <h2 className="bouquet-builder-title">
                    Собрать свой букет
                </h2>

                <p className="bouquet-builder-subtitle">
                    Свяжитесь с нами удобным способом,<br />
                    чтобы обсудить детали и ваши пожелания:
                </p>

                <div className="bouquet-builder-buttons">
                    {telegramUrl && (
                        <a
                            href={telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bouquet-builder-button"
                            title="Telegram"
                        >
                            <Telegram className="bouquet-builder-icon" />
                        </a>
                    )}

                    {whatsappUrl && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bouquet-builder-button"
                            title="WhatsApp"
                        >
                            <img src={waIcon} alt="WhatsApp" className="bouquet-builder-icon" />
                        </a>
                    )}

                    {maxUrl && (
                        <a
                            href={maxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bouquet-builder-button"
                            title="Max"
                        >
                            <img src={maxIcon} alt="Max" className="bouquet-builder-icon" />
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BouquetBuilder;

