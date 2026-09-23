#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "inventory_snapshot_179666.h"
#include "carbon_delivery_179666.h"

static void WINAPI mock_add(void *store, void *result, const void *element) {
    unsigned char *items = *(unsigned char **)((unsigned char *)store + 144);
    *(int32_t *)(items + 24) += *(const int32_t *)((const unsigned char *)element + 24);
    *(int32_t *)result = 0;
    *((int32_t *)result + 1) = 0;
}

static void WINAPI noop_add(void *store, void *result, const void *element) {
    (void)store;
    (void)result;
    (void)element;
}

int main(void) {
    const size_t store_offset = 0x0e70 + 0xaad0 + 0x0910;
    unsigned char *application = (unsigned char *)HeapAlloc(GetProcessHeap(), HEAP_ZERO_MEMORY,
                                                            store_offset + 0x248);
    unsigned char *elements = (unsigned char *)HeapAlloc(GetProcessHeap(), HEAP_ZERO_MEMORY, 2 * 48);
    if (!application || !elements) return 2;
    unsigned char *store = application + store_offset;
    *(int16_t *)(store + 128) = 10;
    *(int16_t *)(store + 130) = 5;
    *(int16_t *)(store + 132) = 50;
    *(uint32_t *)(store + 136) = 2;
    *(uint32_t *)(store + 140) = 2;
    *(unsigned char **)(store + 144) = elements;
    memcpy(elements, "FUEL1", 5);
    *(int32_t *)(elements + 24) = 115;
    *(int32_t *)(elements + 32) = 9999;
    memcpy(elements + 48, "IRON", 4);
    *(int32_t *)(elements + 48 + 24) = 20;
    *(int32_t *)(elements + 48 + 32) = 9999;

    courier_carbon_snapshot snapshot;
    int valid = courier_snapshot_carbon((uintptr_t)application, &snapshot);
    if (!valid || snapshot.width != 10 || snapshot.capacity != 50 ||
        snapshot.vector_size != 2 || snapshot.carbon_stacks != 1 ||
        snapshot.carbon_quantity != 115) return 3;
    uintptr_t prepared_store = 0;
    uint32_t before_quantity = 0;
    unsigned char prepared[48];
    if (!courier_prepare_carbon_500((uintptr_t)application, &prepared_store, prepared,
                                   &before_quantity) ||
        prepared_store != (uintptr_t)store || before_quantity != 115 ||
        *(int32_t *)(prepared + 16) != -1 || *(int32_t *)(prepared + 20) != -1 ||
        *(int32_t *)(prepared + 24) != 500) return 5;
    uint32_t after_quantity = 0;
    if (courier_deliver_carbon_500_with((uintptr_t)application, mock_add,
                                       &before_quantity, &after_quantity) !=
            COURIER_DELIVERY_CONFIRMED ||
        before_quantity != 115 || after_quantity != 615) return 6;
    *(int32_t *)(elements + 24) = 115;
    if (courier_deliver_carbon_500_with((uintptr_t)application, noop_add,
                                       &before_quantity, &after_quantity) !=
            COURIER_DELIVERY_UNKNOWN ||
        before_quantity != 115 || after_quantity != 115) return 7;
    *(uint32_t *)(store + 140) = 3;
    if (courier_snapshot_carbon((uintptr_t)application, &snapshot)) return 4;
    HeapFree(GetProcessHeap(), 0, elements);
    HeapFree(GetProcessHeap(), 0, application);
    puts("inventory_snapshot_fixture=passed");
    return 0;
}
