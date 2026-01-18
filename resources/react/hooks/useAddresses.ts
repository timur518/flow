/**
 * useAddresses Hook
 * Хук для работы с адресами доставки
 */

import { useState, useEffect, useCallback } from 'react';
import { addressService } from '@/api/services';
import { Address, CreateAddressData, UpdateAddressData } from '@/api/types';

export const useAddresses = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const createAddress = useCallback(async (data: CreateAddressData) => {
        try {
            setLoading(true);
            setError(null);
            const newAddress = await addressService.createAddress(data);
            await fetchAddresses();
            return newAddress;
        } catch (err: any) {
            setError(err.message || 'Ошибка создания адреса');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    const updateAddress = useCallback(async (id: number, data: UpdateAddressData) => {
        try {
            setLoading(true);
            setError(null);
            const updatedAddress = await addressService.updateAddress(id, data);
            await fetchAddresses();
            return updatedAddress;
        } catch (err: any) {
            setError(err.message || 'Ошибка обновления адреса');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    const deleteAddress = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            await addressService.deleteAddress(id);
            await fetchAddresses();
        } catch (err: any) {
            setError(err.message || 'Ошибка удаления адреса');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    return {
        addresses,
        loading,
        error,
        createAddress,
        updateAddress,
        deleteAddress,
        refetch: fetchAddresses,
    };
};

