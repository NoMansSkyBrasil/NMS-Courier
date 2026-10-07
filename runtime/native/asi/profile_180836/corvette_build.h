// Corvette domain of the build 180836 research profile: the class of the ship item the game sets up
// when corvette build mode starts, and the shipped reward that starts it. Included once by
// profile_core.c. The part layout and the validation switch still come from the static research mod.

// Shipped reward that starts corvette build mode from the default layout (GcRewardStartShipBuildMode,
// CreateFromDefault). Dispatched only by the separate "corvette" event.
#define CORVETTE_BUILD_REWARD_ID "R_BIGGS_NEW"
// Ship item (setup kind 0): main, technology and cargo stores. Owned S ships carry the class in all three.
// The base-stat row is the Corvette ship class (10), the row the size-type mapping gives a corvette.
#define SHIP_ITEM_KIND 0
#define CORVETTE_SHIP_CLASS 10
static const struct { uint32_t offset; uint32_t inventory_type; } ship_stores[3] = {
    {0x980u, 4u}, {0xe10u, 5u}, {0xbc8u, 6u}
};
static volatile LONG ship_class_armed;     // the corvette event asks for the class on the next ship setup

static void apply_corvette_build_class(uintptr_t item, int32_t item_class) {
    if (!writable_range(item, ITEM_READ_SPAN)) {
        InterlockedIncrement(&rejected_item);
        return;
    }
    for (unsigned index = 0; index < 3; ++index) {
        uint8_t *store = (uint8_t *)item + ship_stores[index].offset;
        int32_t *header = (int32_t *)(store + STORE_CLASS_OFFSET);
        InterlockedExchange(&class_before[index], *header);
        *header = item_class;
        stat_generator(store, ship_stores[index].inventory_type, (void *)(item + ITEM_SEED_OFFSET),
                       item_class, CORVETTE_SHIP_CLASS, 10, 0, 0);
        InterlockedExchange(&class_after[index], *header);
    }
    InterlockedExchange(&applied_class, item_class);
    InterlockedIncrement(&applied_count);
}
