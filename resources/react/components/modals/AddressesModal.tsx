/**
 * AddressesModal - Модальное окно со списком адресов
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { addressService } from '@/api/services';
import { Address } from '@/api/types';

interface AddressesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAddress?: () => void;
    onEditAddress?: (address: Address) => void;
}

const AddressesModal: React.FC<AddressesModalProps> = ({
    isOpen,
    onClose,
    onAddAddress,
    onEditAddress,
}) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadAddresses();
        }
    }, [isOpen]);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getAddresses();
            setAddresses(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки адресов');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await addressService.setDefaultAddress(id);
            await loadAddresses();
        } catch (err: any) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить этот адрес?')) return;
        
        try {
            await addressService.deleteAddress(id);
            await loadAddresses();
        } catch (err: any) {
            alert('Ошибка: ' + err.message);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Мои адреса" size="lg">
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка адресов...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-600">
                    Ошибка: {error}
                </div>
            ) : (
                <>
                    {addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold mb-2">У вас нет сохраненных адресов</h3>
                            <p className="text-gray-600 mb-6">Добавьте адрес для быстрого оформления заказов</p>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{address.label || 'Адрес'}</h4>
                                                {address.is_default && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        По умолчанию
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700">{address.full_address}</p>
                                            {address.apartment && (
                                                <p className="text-sm text-gray-600">Кв./офис: {address.apartment}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Сделать основным
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onEditAddress?.(address)}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onAddAddress}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        + Добавить новый адрес
                    </button>
                </>
            )}
        </Modal>
    );
};

export default AddressesModal;

