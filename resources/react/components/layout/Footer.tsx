/**
 * Footer - Подвал сайта
 *
 * Содержит:
 * - Информация о приложениях (iOS/Android)
 * - Владелец сайта (юридическая информация)
 * - Юридическая информация (политики)
 * - Связь с поддержкой
 */

import React from 'react';
import { useCity, useStores, useStore } from '@/hooks';
import { Apple, Android, Telegram, WhatsApp } from '@/components/icons';

const Footer: React.FC = () => {
    const { selectedCityId } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });

    // Получаем ID магазина выбранного города (в каждом городе по одному магазину)
    const storeId = stores.length > 0 ? stores[0].id : null;

    // Получаем детальную информацию о магазине
    const { store: storeDetail } = useStore(storeId);

    const currentStore = stores.length > 0 ? stores[0] : null;

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-grid">
                    {/* Колонка 1: В приложении - удобней */}
                    <div className="footer-column">
                        <h3 className="footer-heading">В приложении - удобней</h3>
                        <p className="footer-text mb-4">
                            Скачайте приложение
                        </p>
                        <p className="footer-text mb-4">
                            для iOS или Android
                        </p>
                        <div className="footer-app-buttons">
                            {/* Кнопка Apple */}
                            <a
                                href="#"
                                className="footer-app-button"
                                title="App Store"
                            >
                                <Apple className="footer-app-icon" />
                            </a>

                            {/* Кнопка Android */}
                            <a
                                href="#"
                                className="footer-app-button"
                                title="Google Play"
                            >
                                <Android className="footer-app-icon" />
                            </a>
                        </div>

                        {storeDetail && (
                            <div className="footer-owner">
                                <h4 className="footer-heading">Владелец сайта</h4>
                                <div className="footer-owner-info">
                                    {storeDetail.legal_info?.legal_name && (
                                        <div className="footer-text mb-2">
                                            {storeDetail.legal_info.legal_name}
                                        </div>
                                    )}
                                    {storeDetail.legal_info?.inn && (
                                        <div className="footer-text">
                                            ИНН: {storeDetail.legal_info.inn}
                                        </div>
                                    )}
                                    {storeDetail.legal_info?.ogrn && (
                                        <div className="footer-text">
                                            ОГРН: {storeDetail.legal_info.ogrn}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Колонка 2: Юридическая информация */}
                    <div className="footer-column">
                        <h3 className="footer-heading">Юридическая информация</h3>
                        <ul className="footer-links">
                            <li>
                                <a href="#privacy" className="footer-link">
                                    Политика конфиденциальности
                                </a>
                            </li>
                            <li>
                                <a href="#personal-data" className="footer-link">
                                    Политика обработки персональных данных
                                </a>
                            </li>
                            <li>
                                <a href="#cookies" className="footer-link">
                                    Политика обработки Cookies
                                </a>
                            </li>
                            <li>
                                <a href="#offer" className="footer-link">
                                    Публичная оферта
                                </a>
                            </li>
                        </ul>

                        <div className="footer-info">
                            {storeDetail?.legal_info?.legal_address && (
                                <div className="footer-text">
                                    Юридический адрес: {storeDetail.legal_info.legal_address}
                                </div>
                            )}
                            {currentStore && currentStore.email && (
                                <div className="footer-text">
                                    Эл. почта:{' '}
                                    <a href={`mailto:${currentStore.email}`} className="footer-link">
                                        {currentStore.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Колонка 3: Связаться с поддержкой */}
                    <div className="footer-column">
                        <h3 className="footer-heading">Связаться с поддержкой</h3>

                        {currentStore && currentStore.phone && (
                            <div className="footer-phone-wrapper">
                                <a
                                    href={`tel:${currentStore.phone.replace(/\D/g, '')}`}
                                    className="footer-phone"
                                >
                                    {currentStore.phone}
                                </a>
                            </div>
                        )}

                        <div className="footer-social-buttons">
                            {currentStore?.social_links?.telegram_chat && (
                                <a
                                    href={currentStore.social_links.telegram_chat}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-button"
                                    title="Telegram"
                                >
                                    <Telegram className="footer-social-icon" />
                                </a>
                            )}

                            {currentStore?.social_links?.whatsapp && (
                                <a
                                    href={currentStore.social_links.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-button"
                                    title="WhatsApp"
                                >
                                    <WhatsApp className="footer-social-icon" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

