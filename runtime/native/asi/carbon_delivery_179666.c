#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <string.h>

#include "carbon_delivery_179666.h"
#include "inventory_snapshot_179666.h"

#define COURIER_INVENTORY_ADD_RVA 0x4ce130u

typedef struct inventory_index {
    int32_t x;
    int32_t y;
} inventory_index;

enum courier_delivery_result courier_deliver_carbon_500_with(
    uintptr_t application_data, courier_inventory_add_fn add,
    uint32_t *before_quantity, uint32_t *after_quantity) {
    if (!add || !before_quantity || !after_quantity) return COURIER_DELIVERY_REJECTED;
    unsigned char element[48];
    uintptr_t store_address = 0;
    uint32_t before = 0;
    if (!courier_prepare_carbon_500(application_data, &store_address, element, &before)) {
        return COURIER_DELIVERY_REJECTED;
    }
    *before_quantity = before;
    *after_quantity = before;
    inventory_index result = {.x = -1, .y = -1};
    add((void *)store_address, &result, element);
    courier_carbon_snapshot after;
    if (!courier_snapshot_carbon(application_data, &after)) return COURIER_DELIVERY_UNKNOWN;
    *after_quantity = after.carbon_quantity;
    return after.carbon_quantity == before + 500
               ? COURIER_DELIVERY_CONFIRMED
               : COURIER_DELIVERY_UNKNOWN;
}

enum courier_delivery_result courier_deliver_carbon_500(
    uintptr_t executable_base, uintptr_t application_data,
    uint32_t *before_quantity, uint32_t *after_quantity) {
    if (!executable_base || !application_data) return COURIER_DELIVERY_REJECTED;
    static const unsigned char expected[] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x74,
        0x24, 0x18, 0x55, 0x57, 0x41, 0x56, 0x48, 0x8d,
        0x6c, 0x24, 0xb0, 0x48, 0x81, 0xec, 0x50, 0x01,
        0x00, 0x00, 0x41, 0x0f, 0x10, 0x00, 0x4c, 0x8b
    };
    if (executable_base > UINTPTR_MAX - COURIER_INVENTORY_ADD_RVA) {
        return COURIER_DELIVERY_REJECTED;
    }
    unsigned char *target = (unsigned char *)(executable_base + COURIER_INVENTORY_ADD_RVA);
    if (!courier_readable_range(target, sizeof(expected)) ||
        memcmp(target, expected, sizeof(expected)) != 0) {
        return COURIER_DELIVERY_REJECTED;
    }
    return courier_deliver_carbon_500_with(application_data,
                                           (courier_inventory_add_fn)target,
                                           before_quantity, after_quantity);
}
