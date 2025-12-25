<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}
        <br>
        <div class="fi-form-actions">
            <x-filament::button
                type="submit"
                size="lg"
            >
                Сохранить настройки
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>
