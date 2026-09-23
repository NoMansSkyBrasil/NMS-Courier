#ifndef COURIER_INVENTORY_SNAPSHOT_179666_H
#define COURIER_INVENTORY_SNAPSHOT_179666_H

#include <stddef.h>
#include <stdint.h>

typedef struct courier_carbon_snapshot {
    int16_t width;
    int16_t height;
    int16_t capacity;
    uint32_t vector_size;
    uint32_t carbon_stacks;
    uint32_t carbon_quantity;
} courier_carbon_snapshot;

int courier_readable_range(const void *pointer, size_t size);
int courier_snapshot_carbon(uintptr_t application_data, courier_carbon_snapshot *snapshot);
int courier_prepare_carbon_500(uintptr_t application_data, uintptr_t *store_address,
                               unsigned char element[48], uint32_t *before_quantity);

#endif
