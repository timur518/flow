/**
 * Address Service
 * Сервис для работы с адресами доставки
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { Address, CreateAddressData, UpdateAddressData } from '../types';

export const addressService = {
    /**
     * Получить список адресов
     */
    async getAddresses(): Promise<Address[]> {
        const response = await apiClient.get<{ addresses: Address[] }>(
            API_ENDPOINTS.ADDRESSES
        );
        return response.data.addresses;
    },

    /**
     * Получить адрес по ID
     */
    async getAddress(id: number): Promise<Address> {
        const response = await apiClient.get<{ address: Address }>(
            API_ENDPOINTS.ADDRESS_DETAIL(id)
        );
        return response.data.address;
    },

    /**
     * Создать новый адрес
     */
    async createAddress(data: CreateAddressData): Promise<Address> {
        const response = await apiClient.post<{ address: Address }>(
            API_ENDPOINTS.ADDRESSES,
            data
        );
        return response.data.address;
    },

    /**
     * Обновить адрес
     */
    async updateAddress(id: number, data: UpdateAddressData): Promise<Address> {
        const response = await apiClient.put<{ address: Address }>(
            API_ENDPOINTS.ADDRESS_DETAIL(id),
            data
        );
        return response.data.address;
    },

    /**
     * Удалить адрес
     */
    async deleteAddress(id: number): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.ADDRESS_DETAIL(id));
    },

    /**
     * Установить адрес по умолчанию
     */
    async setDefaultAddress(id: number): Promise<Address> {
        const response = await apiClient.post<{ address: Address }>(
            API_ENDPOINTS.ADDRESS_SET_DEFAULT(id)
        );
        return response.data.address;
    },
};

