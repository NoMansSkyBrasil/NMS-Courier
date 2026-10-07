// Multitool domain of the build 180836 research profile: where the owned multitools' stores are, and
// the shipped multitool rewards. Included once by profile_core.c.
// Weapon records are 0x320 bytes apart inside the game manager object with the store first. The game
// copies the equipped multitool's active store over its record in that array, so a change made only in
// the array is lost for the equipped one; the active store is the one to change.

#define OWNED_WEAPON_OFFSET 0x2b2fe0u
#define OWNED_WEAPON_STRIDE 0x320u
#define OWNED_WEAPON_SLOTS 6u
#define ACTIVE_WEAPON_OFFSET 0xc928u
// Shipped rewards: one class step on the equipped multitool, and the game's own windows for one more slot.
#define MULTITOOL_CLASS_REWARD_ID "R_WEAP_UPGRADE"
#define MULTITOOL_SLOT_REWARD_CASH_ID "R_WEAPSLOT_CASH"
#define MULTITOOL_SLOT_REWARD_PRODUCT_ID "R_WEAPSLOT_PROD"

// Store of one multitool record; NULL when the index is outside the multitool slots.
__attribute__((unused)) static uint8_t *multitool_record_store(uintptr_t manager, LONG index) {
    if (index < 0 || index >= (LONG)OWNED_WEAPON_SLOTS) return NULL;
    return (uint8_t *)(manager + OWNED_WEAPON_OFFSET + (uintptr_t)index * OWNED_WEAPON_STRIDE);
}

// Active store of the equipped multitool.
__attribute__((unused)) static uint8_t *multitool_equipped_store(uintptr_t manager) {
    return (uint8_t *)(manager + ACTIVE_WEAPON_OFFSET);
}
