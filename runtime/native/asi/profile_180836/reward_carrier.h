// Shared by the currency and item domains of the build 180836 research profile: find one of this
// project's own entries in the game's reward table (the data file of runtime/mods/courier_rewards)
// so a domain can use it as a carrier. A carrier is an entry with exactly one reward; the domain
// checks that it still holds what the data file gave it, writes the requested content, calls the
// game's reward routine and writes the original content back. Only that entry is ever written; what
// the player receives is added by the game, which also shows its own notification. Layout observed
// offline on 2026-10-08 (docs/CURRENCY_DELIVERY_NOTES.md). Included once by profile_core.c, after
// shipped_reward_dispatch.h.

#define REWARD_CARRIER_MAP_OFFSET 0x7a0u       // from the manager object: entries at +0x10, end at +0x18
#define REWARD_CARRIER_MAP_LOOKUP_RVA 0x567610u  // entry bytes are checked by the account domain
#define REWARD_CARRIER_MAP_ENTRY_SIZE 24u
// A reward table entry as the game's reward routine (0xf19e90) reads it: the stat identifier first,
// the item list at +0x10 (its count at +0x18), the choice mode at +0x20 and the entry's own
// identifier at +0x28.
#define REWARD_CARRIER_ENTRY_LIST_OFFSET 0x10u
#define REWARD_CARRIER_ENTRY_ID_OFFSET 0x28u
#define REWARD_CARRIER_ITEM_REWARD_OFFSET 0x10u  // reward item: reference to the reward and its class hash

enum {
    REWARD_CARRIER_FOUND = 0,
    REWARD_CARRIER_UNKNOWN,     // not in the game's reward table: the data file is not loaded
    REWARD_CARRIER_BAD_LAYOUT,  // the entry does not look as expected; nothing may be written
    REWARD_CARRIER_NOT_READY
};

typedef uint64_t (*reward_carrier_lookup_fn)(void *map, const char *id);
// Says whether a candidate reward structure is the data file's own content.
typedef int (*reward_carrier_check_fn)(const void *reward, int context);

static reward_carrier_lookup_fn reward_carrier_lookup;

__attribute__((unused)) static int reward_carrier_resolve(uintptr_t base) {
    reward_carrier_lookup = (reward_carrier_lookup_fn)(base + REWARD_CARRIER_MAP_LOOKUP_RVA);
    return 1;
}

static int reward_carrier_readable(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return address && VirtualQuery((void *)address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// A reference of the loaded table is either a pointer or, as in the file, an offset from its own
// position. Both are tried; the caller's check decides.
static uintptr_t reward_carrier_follow(uintptr_t position, int attempt) {
    if (!reward_carrier_readable(position, 16)) return 0;
    uint64_t value = *(const uint64_t *)position;
    return attempt == 0 ? (uintptr_t)value : position + (uintptr_t)value;
}

// The writable reward structure of the carrier `id`, of `size` bytes and class `class_hash`, that
// passes `check`; or NULL with the reason.
static void *reward_carrier_find(uintptr_t manager, const char *id, uint32_t class_hash, size_t size,
                                 reward_carrier_check_fn check, int context, LONG *reason) {
    uint8_t *map = (uint8_t *)(manager + REWARD_CARRIER_MAP_OFFSET);
    *reason = REWARD_CARRIER_NOT_READY;
    if (!reward_carrier_lookup || !reward_carrier_readable((uintptr_t)map, 0x40)) return NULL;
    const uint8_t *entries = *(const uint8_t *const *)(map + 0x10), *end = *(const uint8_t *const *)(map + 0x18);
    if (!entries || end < entries) return NULL;
    char key[16] = {0};
    memcpy(key, id, strlen(id) < 15 ? strlen(id) : 15);
    const uint8_t *slot = entries + reward_carrier_lookup(map, key) * REWARD_CARRIER_MAP_ENTRY_SIZE;
    *reason = REWARD_CARRIER_UNKNOWN;
    if (slot < entries || slot >= end || !reward_carrier_readable((uintptr_t)slot, REWARD_CARRIER_MAP_ENTRY_SIZE))
        return NULL;
    uintptr_t entry = *(const uintptr_t *)(slot + 0x10);
    if (!entry) return NULL;
    *reason = REWARD_CARRIER_BAD_LAYOUT;
    if (!reward_carrier_readable(entry, 0x38) ||
        strncmp((const char *)entry + REWARD_CARRIER_ENTRY_ID_OFFSET, key, 16) != 0 ||
        *(const uint32_t *)(entry + REWARD_CARRIER_ENTRY_LIST_OFFSET + 8) != 1) return NULL;
    for (int list_attempt = 0; list_attempt < 2; ++list_attempt) {
        uintptr_t item = reward_carrier_follow(entry + REWARD_CARRIER_ENTRY_LIST_OFFSET, list_attempt);
        if (!reward_carrier_readable(item, 0x28) ||
            *(const uint32_t *)(item + REWARD_CARRIER_ITEM_REWARD_OFFSET + 8) != class_hash) continue;
        for (int reward_attempt = 0; reward_attempt < 2; ++reward_attempt) {
            void *reward = (void *)reward_carrier_follow(item + REWARD_CARRIER_ITEM_REWARD_OFFSET, reward_attempt);
            if (!writable_range((uintptr_t)reward, size) || !check(reward, context)) continue;
            *reason = REWARD_CARRIER_FOUND;
            return reward;
        }
    }
    return NULL;
}

// One call of the game's reward routine for a carrier.
static void reward_carrier_give(const char *id, uint8_t silent) {
    char reward_id[16] = {0}, mission_id[16] = {0};
    unsigned char seed[16] = {0};
    uint64_t multi_product_count = 0;
    memcpy(reward_id, id, strlen(id) < 15 ? strlen(id) : 15);
    give_reward(reward_manager, reward_id, mission_id, seed, 0, !silent, &multi_product_count, silent, -1, 0);
}
