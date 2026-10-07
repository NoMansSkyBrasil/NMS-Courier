// Starship domain of the build 180836 research profile: where the owned ships' inventory stores are,
// which ship is the primary one, and the shipped ship rewards. Included once by profile_core.c.
// Owned inventory stores sit at fixed offsets inside the game manager object on this build. Observed
// read-only on 2026-10-07 (scan-owned-inventory-stores.py): ship main and technology stores in two
// arrays with one store per ship slot.

#define OWNED_SHIP_MAIN_OFFSET 0x12d98u
#define OWNED_SHIP_TECHNOLOGY_OFFSET 0x16468u
#define OWNED_SHIP_SLOTS 12u
// Primary ship slot: the ship setup code indexes the ship store array with the 32-bit value at
// +0x182a0 of the object whose pointer is at manager+0xc240 (read-only check: value 1 with ship slot 1
// as the user's current ship).
#define PLAYER_STATE_POINTER_OFFSET 0xc240u
#define PRIMARY_SHIP_INDEX_OFFSET 0x182a0u
// Shipped rewards: one class step on the current ship, and the game's own windows for one more slot.
#define SHIP_CLASS_REWARD_ID "R_SHIPUPGRADE"
#define SHIP_SLOT_REWARD_CASH_ID "R_SHIPSLOT_CASH"
#define SHIP_SLOT_REWARD_PRODUCT_ID "R_SHIPSLOT_PROD"

// Slot index of the primary ship as the game resolves it, or -1.
__attribute__((unused)) static LONG ship_primary_index(uintptr_t manager) {
    if (manager && writable_range(manager + PLAYER_STATE_POINTER_OFFSET, sizeof(uintptr_t))) {
        uintptr_t state = *(const uintptr_t *)(manager + PLAYER_STATE_POINTER_OFFSET);
        if (writable_range(state + PRIMARY_SHIP_INDEX_OFFSET, sizeof(int32_t)))
            return *(const int32_t *)(state + PRIMARY_SHIP_INDEX_OFFSET);
    }
    return -1;
}

// Main and technology stores of one ship slot; 0 when the index is outside the ship slots.
__attribute__((unused)) static int ship_inventory_stores(uintptr_t manager, LONG index, uint8_t **main_store,
                                                         uint8_t **technology) {
    if (index < 0 || index >= (LONG)OWNED_SHIP_SLOTS) return 0;
    *main_store = (uint8_t *)(manager + OWNED_SHIP_MAIN_OFFSET + (uintptr_t)index * STORE_SIZE);
    *technology = (uint8_t *)(manager + OWNED_SHIP_TECHNOLOGY_OFFSET + (uintptr_t)index * STORE_SIZE);
    return 1;
}
