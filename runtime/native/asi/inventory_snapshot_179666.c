#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>

#include "inventory_snapshot_179666.h"

#define GAME_STATE_OFFSET 0x0e70u
#define PLAYER_STATE_OFFSET 0xaad0u
#define PERSONAL_INVENTORY_OFFSET 0x0910u
#define MAX_INVENTORY_ELEMENTS 4096u

typedef struct inventory_element {
    char game_id[16];
    int32_t x;
    int32_t y;
    int32_t amount;
    float damage_factor;
    int32_t max_amount;
    int32_t item_type;
    uint8_t added_automatically;
    uint8_t fully_installed;
    uint8_t padding[6];
} inventory_element;

typedef struct inventory_store_view {
    uint64_t valid_slots[16];
    int16_t width;
    int16_t height;
    int16_t capacity;
    uint16_t padding;
    uint32_t allocated_size;
    uint32_t vector_size;
    inventory_element *elements;
} inventory_store_view;

_Static_assert(sizeof(inventory_element) == 48, "Unexpected inventory element size");
_Static_assert(offsetof(inventory_store_view, elements) == 144, "Unexpected store vector offset");

int courier_readable_range(const void *pointer, size_t size) {
    if (!pointer || size == 0) return 0;
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery(pointer, &memory, sizeof(memory)) != sizeof(memory)) return 0;
    if (memory.State != MEM_COMMIT || (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS))) return 0;
    DWORD access = memory.Protect & 0xff;
    if (access != PAGE_READONLY && access != PAGE_READWRITE && access != PAGE_WRITECOPY &&
        access != PAGE_EXECUTE_READ && access != PAGE_EXECUTE_READWRITE &&
        access != PAGE_EXECUTE_WRITECOPY) return 0;
    uintptr_t start = (uintptr_t)pointer;
    if (size > UINTPTR_MAX - start) return 0;
    uintptr_t end = start + size;
    uintptr_t region_end = (uintptr_t)memory.BaseAddress + memory.RegionSize;
    return end <= region_end;
}

int courier_snapshot_carbon(uintptr_t application_data, courier_carbon_snapshot *snapshot) {
    if (!application_data || !snapshot) return 0;
    if (application_data > UINTPTR_MAX - GAME_STATE_OFFSET - PLAYER_STATE_OFFSET -
                               PERSONAL_INVENTORY_OFFSET) return 0;
    uintptr_t store_address = application_data + GAME_STATE_OFFSET + PLAYER_STATE_OFFSET +
                              PERSONAL_INVENTORY_OFFSET;
    if (!courier_readable_range((const void *)store_address, sizeof(inventory_store_view))) return 0;
    inventory_store_view store;
    memcpy(&store, (const void *)store_address, sizeof(store));
    if (store.width <= 0 || store.height <= 0 || store.capacity <= 0 ||
        store.width > 64 || store.height > 64 || store.capacity > 4096 ||
        store.vector_size > MAX_INVENTORY_ELEMENTS ||
        store.allocated_size > MAX_INVENTORY_ELEMENTS * 2 ||
        store.vector_size > store.allocated_size) return 0;
    if (store.vector_size &&
        !courier_readable_range(store.elements, store.vector_size * sizeof(inventory_element))) return 0;

    courier_carbon_snapshot result = {
        .width = store.width,
        .height = store.height,
        .capacity = store.capacity,
        .vector_size = store.vector_size,
        .carbon_stacks = 0,
        .carbon_quantity = 0
    };
    for (uint32_t index = 0; index < store.vector_size; ++index) {
        inventory_element element;
        memcpy(&element, store.elements + index, sizeof(element));
        if (memcmp(element.game_id, "FUEL1\0", 6) != 0 || element.item_type != 0) continue;
        if (element.amount < 0 || element.max_amount <= 0 ||
            element.amount > element.max_amount ||
            result.carbon_quantity > UINT32_MAX - (uint32_t)element.amount) return 0;
        result.carbon_stacks += 1;
        result.carbon_quantity += (uint32_t)element.amount;
    }
    *snapshot = result;
    return 1;
}

int courier_prepare_carbon_500(uintptr_t application_data, uintptr_t *store_address,
                               unsigned char element[48], uint32_t *before_quantity) {
    if (!store_address || !element || !before_quantity) return 0;
    courier_carbon_snapshot before;
    if (!courier_snapshot_carbon(application_data, &before) ||
        before.carbon_stacks == 0 || before.carbon_quantity > UINT32_MAX - 500) return 0;
    uintptr_t address = application_data + GAME_STATE_OFFSET + PLAYER_STATE_OFFSET +
                        PERSONAL_INVENTORY_OFFSET;
    inventory_store_view store;
    memcpy(&store, (const void *)address, sizeof(store));
    for (uint32_t index = 0; index < store.vector_size; ++index) {
        inventory_element template;
        memcpy(&template, store.elements + index, sizeof(template));
        if (memcmp(template.game_id, "FUEL1\0", 6) != 0 || template.item_type != 0 ||
            template.max_amount < 500) continue;
        template.x = -1;
        template.y = -1;
        template.amount = 500;
        memcpy(element, &template, sizeof(template));
        *store_address = address;
        *before_quantity = before.carbon_quantity;
        return 1;
    }
    return 0;
}
