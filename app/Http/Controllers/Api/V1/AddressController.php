<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Requests\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Получить все адреса текущего пользователя
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();

        return response()->json([
            'addresses' => AddressResource::collection($addresses),
        ]);
    }

    /**
     * Создать новый адрес
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        $address = $request->user()->addresses()->create($request->validated());

        // Если это первый адрес или указано is_default, делаем его основным
        if ($request->is_default || $request->user()->addresses()->count() === 1) {
            $this->setDefaultAddress($request->user(), $address);
        }

        return response()->json([
            'message' => 'Адрес создан успешно',
            'address' => new AddressResource($address),
        ], 201);
    }

    /**
     * Получить конкретный адрес
     */
    public function show(Request $request, Address $address): JsonResponse
    {
        // Проверяем, что адрес принадлежит текущему пользователю
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещен',
            ], 403);
        }

        return response()->json([
            'address' => new AddressResource($address),
        ]);
    }

    /**
     * Обновить адрес
     */
    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        // Проверяем, что адрес принадлежит текущему пользователю
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещен',
            ], 403);
        }

        // Получаем валидированные данные
        $validatedData = $request->validated();

        // Обрабатываем is_default отдельно
        $shouldBeDefault = $validatedData['is_default'] ?? null;

        // Удаляем is_default из данных для обновления, обработаем его отдельно
        unset($validatedData['is_default']);

        // Обновляем остальные поля адреса
        $address->update($validatedData);

        // Обрабатываем is_default
        if ($shouldBeDefault !== null) {
            if ($shouldBeDefault) {
                // Устанавливаем этот адрес как основной
                $this->setDefaultAddress($request->user(), $address);
            } else {
                // Если снимаем галочку с основного адреса
                if ($address->is_default) {
                    $address->update(['is_default' => false]);
                    // Делаем основным первый из оставшихся адресов
                    $firstAddress = $request->user()->addresses()
                        ->where('id', '!=', $address->id)
                        ->first();
                    if ($firstAddress) {
                        $firstAddress->update(['is_default' => true]);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Адрес обновлен успешно',
            'address' => new AddressResource($address->fresh()),
        ]);
    }

    /**
     * Удалить адрес
     */
    public function destroy(Request $request, Address $address): JsonResponse
    {
        // Проверяем, что адрес принадлежит текущему пользователю
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещен',
            ], 403);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // Если удалили основной адрес, делаем основным первый из оставшихся
        if ($wasDefault) {
            $firstAddress = $request->user()->addresses()->first();
            if ($firstAddress) {
                $firstAddress->update(['is_default' => true]);
            }
        }

        return response()->json([
            'message' => 'Адрес удален успешно',
        ]);
    }

    /**
     * Установить адрес как основной
     */
    public function setDefault(Request $request, Address $address): JsonResponse
    {
        // Проверяем, что адрес принадлежит текущему пользователю
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещен',
            ], 403);
        }

        $this->setDefaultAddress($request->user(), $address);

        return response()->json([
            'message' => 'Адрес установлен как основной',
            'address' => new AddressResource($address->fresh()),
        ]);
    }

    /**
     * Вспомогательный метод для установки адреса по умолчанию
     */
    private function setDefaultAddress($user, Address $address): void
    {
        // Сбрасываем is_default у всех адресов пользователя
        $user->addresses()->update(['is_default' => false]);

        // Устанавливаем is_default для выбранного адреса
        $address->update(['is_default' => true]);
    }
}
