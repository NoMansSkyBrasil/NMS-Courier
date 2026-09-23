#ifndef COURIER_CARBON_DELIVERY_179666_H
#define COURIER_CARBON_DELIVERY_179666_H

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>

typedef void(WINAPI *courier_inventory_add_fn)(void *store, void *result, const void *element);

enum courier_delivery_result {
    COURIER_DELIVERY_REJECTED = 0,
    COURIER_DELIVERY_CONFIRMED = 1,
    COURIER_DELIVERY_UNKNOWN = 2
};

enum courier_delivery_result courier_deliver_carbon_500_with(
    uintptr_t application_data, courier_inventory_add_fn add,
    uint32_t *before_quantity, uint32_t *after_quantity);
enum courier_delivery_result courier_deliver_carbon_500(
    uintptr_t executable_base, uintptr_t application_data,
    uint32_t *before_quantity, uint32_t *after_quantity);

#endif
