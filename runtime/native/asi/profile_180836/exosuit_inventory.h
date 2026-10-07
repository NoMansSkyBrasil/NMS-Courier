// Exosuit domain of the build 180836 research profile: where the exosuit's stores are, and the shipped
// exosuit slot reward. Included once by profile_core.c.
// The exosuit cargo and technology stores are active player stores inside the game manager object. The
// cargo store keeps a slot count that differs from its set bits, so only its rows are checked.

#define ACTIVE_SUIT_CARGO_OFFSET 0xc250u
#define ACTIVE_SUIT_TECHNOLOGY_OFFSET 0xc498u
// Shipped reward that opens the game's own window for one more exosuit slot.
#define EXOSUIT_SLOT_REWARD_ID "RS_INV_SLOT"

__attribute__((unused)) static void exosuit_inventory_stores(uintptr_t manager, uint8_t **cargo, uint8_t **technology) {
    *cargo = (uint8_t *)(manager + ACTIVE_SUIT_CARGO_OFFSET);
    *technology = (uint8_t *)(manager + ACTIVE_SUIT_TECHNOLOGY_OFFSET);
}
