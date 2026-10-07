// Research profile for build 180836: request-scoped freighter offer class.
// After the native purchase setup returns for item kind 3, an explicitly armed
// request stores the requested class in the three temporary offer inventories
// and regenerates their base stats with the game's own generator. A separate
// armed request changes two arguments of the native layout initializer during
// that setup so the offered main and technology grids are created at their
// largest table bounds. Further armed requests mark every valid technology
// slot of the offer as a special (supercharged) slot, raise the technology
// grid height bound for that one layout call, and at acceptance copy the
// offered technology store into the owned one with the native store copy, as
// the game itself does for a freighter bought from an NPC. Nothing is changed
// unless an event was signaled; one armed request applies once. A model
// request read from a per-process request file replaces the scene filename and
// model seed arguments of that setup, and a home seed replaces the value the
// reward acceptance would copy from the current solar system.
// An optional one-shot dispatch of a shipped freighter reward provides a test
// trigger. This is not a production delivery adapter.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <bcrypt.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>
#include "MinHook.h"

#if !defined(COURIER_BUILD_180836) || defined(COURIER_OBSERVE_180383)
#error Freighter class profile requires the exact build 180836 profile only
#endif

#define UPDATE_RVA 0x2d7580u
#define GIVE_REWARD_RVA 0xf140f0u
#define REWARD_MANAGER_RVA 0x7207900u
#define SETUP_RVA 0x8e58e0u
#define STAT_GENERATOR_RVA 0x4ceab0u
#define LAYOUT_RVA 0x4cd300u
#define SPECIAL_GENERATOR_RVA 0x4d2350u
#define STORE_COPY_RVA 0x4d12d0u
#define VECTOR_GROW_RVA 0x2bf95c0u
#define VECTOR_GROW_CALLBACK_RVA 0x2bf9f00u
#define ACCEPT_SITE_RVA 0x8ee2a6u
#define ACCEPT_RETURN_RVA 0x8ee2cau
#define HOME_SEED_SETTER_RVA 0x546d40u
#define HOME_SEED_SITE_RVA 0x8ee71au
#define HOME_SEED_RETURN_RVA 0x8ee735u
#define SCENE_CAPACITY 128
// Extent of the purchase update function that contains the acceptance block.
#define PURCHASE_UPDATE_BEGIN_RVA 0x8ea6f0u
#define PURCHASE_UPDATE_END_RVA 0x8ef9c6u
#define CARRY_TRACE_CAPACITY 6
#define MANAGER_POINTER_RVA 0x6e8d708u
#define TABLE_POINTER_OFFSET 0x218u
#define GENERATION_ENTRIES_OFFSET 0x5e0u
#define GENERATION_ENTRY_SIZE 0x54u
#define ENTRY_TECH_LARGE_HEIGHT 0x18u
#define ENTRY_TECH_LARGE_WIDTH 0x24u
#define STORE_SPECIAL_VECTOR 0xc0u
#define SPECIAL_SLOT_TECH_BONUS 4
#define EXTENDED_TECHNOLOGY_ROWS 12
#define FREIGHTER_BLOCK_RVA 0x8e684du
#define FREIGHTER_ITEM_KIND 3
#define ITEM_SEED_OFFSET 0x10u
#define STORE_CLASS_OFFSET 0x100u
#define ITEM_READ_SPAN 0x1070u
#define CLASS_COUNT 4
#define EVENT_COUNT (CLASS_COUNT + 10)
// Largest FreighterLarge bounds in the inventory table: 10 x 12 and 10 x 6.
#define MAX_MAIN_SLOTS 120u
#define MAX_TECHNOLOGY_SLOTS 60u
#define MAIN_STORE_OFFSET 0x980u
#define TECHNOLOGY_STORE_OFFSET 0xe10u
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
#define ARM_WINDOW_SECONDS 6u
#else
#define ARM_WINDOW_SECONDS 1800u
#endif
// Shipped specific-ship freighter reward; its table entry declares class B.
#define TEST_REWARD_ID "RS_S13_S4M6"
// Shipped reward that starts corvette build mode from the default layout (GcRewardStartShipBuildMode,
// CreateFromDefault). Dispatched only by the separate "corvette" event, for observation.
#define CORVETTE_BUILD_REWARD_ID "R_BIGGS_NEW"

typedef void (WINAPI *update_fn)(void *application);
typedef uintptr_t (*setup_fn)(uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t,
                              uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t);
typedef void (*stat_generator_fn)(void *store, uint32_t inventory_type, void *seed, int32_t item_class,
                                  uint32_t argument_5, uint32_t argument_6, uint64_t argument_7,
                                  uint8_t minimum_values);
typedef uintptr_t (*layout_fn)(uintptr_t store, uintptr_t inventory_type, uintptr_t slot_count,
                               uintptr_t layout, uintptr_t a5, uintptr_t size_type, uintptr_t a7,
                               uintptr_t a8, uintptr_t use_slot_count);
typedef void (*special_generator_fn)(void *store, uint32_t inventory_type, void *seed);
typedef void (*store_copy_fn)(void *destination, const void *source);
// Argument list copied from the native append sites of the special-slot vector.
typedef void *(*vector_grow_fn)(void *vector, void *callback, uint32_t new_count, void *data, uint64_t count,
                                const void *element, uint64_t one, uint64_t zero_1, uint64_t zero_2,
                                uint64_t element_size, uint64_t alignment, uint32_t minus_one, void *data_again,
                                uint64_t zero_3);
typedef void (*home_seed_fn)(void *ownership, const void *seed);
typedef struct { uint64_t value; uint64_t valid; } seed_pair;
typedef struct { int32_t x, y, type; } special_slot;
typedef struct { uint32_t capacity, count; special_slot *data; } special_vector;
typedef uint8_t (*give_reward_fn)(void *manager, const char *reward_id, const char *mission_id,
                                  const void *seed, uint8_t peek, uint8_t force_show_message,
                                  uint64_t *out_multi_product_count, uint8_t force_silent,
                                  int32_t inventory_choice_override, uint8_t use_mining_modifier);

// Store offsets and inventory-type arguments exactly as the native freighter branch passes them.
static const struct { uint32_t offset; uint32_t inventory_type; } stores[3] = {
    {0x980u, 7u}, {0xe10u, 5u}, {0xbc8u, 9u}
};
// Ship item (setup kind 0): main, technology and cargo stores. Owned S ships carry the class in all three.
// The base-stat row is the Corvette ship class (10), the row the size-type mapping gives a corvette.
#define SHIP_ITEM_KIND 0
#define CORVETTE_SHIP_CLASS 10
static const struct { uint32_t offset; uint32_t inventory_type; } ship_stores[3] = {
    {0x980u, 4u}, {0xe10u, 5u}, {0xbc8u, 6u}
};
static volatile LONG ship_class_armed;     // the corvette event asks for the class on the next ship setup

static update_fn original_update;
static setup_fn original_setup;
static layout_fn original_layout;
static stat_generator_fn stat_generator;
static give_reward_fn give_reward;
static void *reward_manager;
static void *update_target;
static void *setup_target;
static void *layout_target;
static void *special_target;
static void *accept_return;
static special_generator_fn original_special;
static store_copy_fn store_copy;
static vector_grow_fn vector_grow;
static void *vector_grow_callback;
static volatile LONG tech_rows_armed;      // raise the technology height bound for the armed setup
static volatile LONG super_armed;
static volatile LONG super_added = -1;
static volatile LONG super_errors;
static volatile LONG table_patches;
static volatile LONG table_rejected;
static volatile LONG carry_applied;
// One model request: optional scene, model seed and home seed, armed by the model event.
static void *home_target;
static void *home_return;
static home_seed_fn original_home;
static char request_scene[SCENE_CAPACITY];
static seed_pair request_model_seed, request_home_seed;
static volatile LONG request_has_scene, request_has_model_seed, request_has_home_seed;
static volatile LONG model_armed;
static volatile LONG model_applied;
static volatile LONG home_pending;
static volatile LONG home_applied;
static volatile LONG request_errors;
// Diagnostics while a carry is pending: type-8 calls for stores outside the offer.
static volatile LONG carry_candidates;
static volatile LONG carry_seed_equal = -1;
static volatile LONG carry_exact_site = -1;
static volatile LONG carry_trace_count;
static volatile LONG carry_trace[CARRY_TRACE_CAPACITY];   // caller return RVAs, 0 if outside the executable
static volatile LONG scope_rows;
// Offer whose technology store is copied at acceptance; identified by item and seed.
static volatile uintptr_t carry_item;
static uint64_t carry_seed[2];
static volatile LONG slots_armed;
static volatile LONG slots_applied;
static volatile LONG layout_overrides;
static volatile LONG grid[6] = {-1, -1, -1, -1, -1, -1};  // main w,h,count then technology w,h,count
// Scope of one armed setup call on its own thread; read only by the layout detour.
static volatile LONG scope_thread;
static volatile uintptr_t scope_item;
static volatile LONG requested_class = -1;
static volatile LONG dispatch_choice;     // 0 freighter test reward, 1 corvette build reward, 2 listed reward
// Shipped rewards that change an owned item in place through the game's own flow (class step, added
// slots). Only these IDs can be requested by the "reward" event; the ID comes from a per-process file.
static const char *const listed_rewards[] = {
    "R_WEAP_UPGRADE", "R_SHIPUPGRADE", "R_ROGUE_CLASS", "R_SHIPSLOT_CASH", "R_SHIPSLOT_PROD",
    "R_WEAPSLOT_CASH", "R_WEAPSLOT_PROD", "RS_INV_SLOT", "R_INVBOX", "R_ROGUE_INV", "R_FREIGHTSLOT"
};
static volatile LONG listed_reward_index = -1;
// Owned inventory stores sit at fixed offsets inside the game manager object on this build. Observed
// read-only on 2026-10-07 (scan-owned-inventory-stores.py): ship main and technology stores in two arrays
// with one 0x248-byte store per ship slot, weapon records 0x320 bytes apart with the store first.
#define OWNED_SHIP_MAIN_OFFSET 0x12d98u
#define OWNED_SHIP_TECHNOLOGY_OFFSET 0x16468u
#define OWNED_STORE_STRIDE 0x248u
#define OWNED_SHIP_SLOTS 12u
#define OWNED_WEAPON_OFFSET 0x2b2fe0u
#define OWNED_WEAPON_STRIDE 0x320u
#define OWNED_WEAPON_SLOTS 6u
// Active player stores, also inside the manager: the exosuit cargo and technology stores and the store of
// the equipped multitool. The game copies the equipped multitool's active store over its record in the
// weapon array, so a change made only in the array is lost; the exosuit cargo store keeps a slot count
// that differs from its set bits, so only its rows are checked.
#define ACTIVE_SUIT_CARGO_OFFSET 0xc250u
#define ACTIVE_SUIT_TECHNOLOGY_OFFSET 0xc498u
#define ACTIVE_WEAPON_OFFSET 0xc928u
// Primary ship slot: the ship setup code indexes the ship store array with the 32-bit value at
// +0x182a0 of the object whose pointer is at manager+0xc240 (read-only check: value 1 with ship slot 1
// as the user's current ship).
#define PLAYER_STATE_POINTER_OFFSET 0xc240u
#define PRIMARY_SHIP_INDEX_OFFSET 0x182a0u
#define OWNED_GRID_WIDTH 10
#define OWNED_GRID_HEIGHT 12
static volatile LONG owned_state;          // 0 idle, 1 requested
static volatile LONG owned_target;         // 0 ship, 1 weapon record, 2 equipped weapon, 3 exosuit, 4 primary ship
static volatile LONG owned_index;
static volatile LONG owned_slots;
static volatile LONG owned_super;
static volatile LONG owned_applied;
static volatile LONG owned_rejected;
static volatile LONG dispatch_state;      // 0 unused, 1 requested, 2 calling, 3 returned
static volatile LONG setup_calls;
static volatile LONG freighter_setups;
static volatile LONG applied_count;
static volatile LONG rejected_item;
static volatile LONG last_kind = -1;
static volatile LONG applied_class = -1;
static volatile LONG class_before[3] = {-1, -1, -1};
static volatile LONG class_after[3] = {-1, -1, -1};
static wchar_t event_base[112];

static int writable_range(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    if (!address || address > UINTPTR_MAX - length ||
        VirtualQuery((const void *)address, &memory, sizeof(memory)) != sizeof(memory)) return 0;
    uintptr_t end = (uintptr_t)memory.BaseAddress + memory.RegionSize;
    DWORD protection = memory.Protect & 0xff;
    return memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           (protection == PAGE_READWRITE || protection == PAGE_EXECUTE_READWRITE) &&
           length <= end - address;
}

static void write_status(const char *status, MH_STATUS result) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH) return;
    int size = swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-freighter-class-180836-%lu.log",
                        root, (unsigned long)GetCurrentProcessId());
    if (size < 0 || size >= MAX_PATH) return;
    // The startup verifier already created this diagnostics directory.
    HANDLE file = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) return;
    char text[2048];
#define READ(value) ((long)InterlockedCompareExchange(&(value), 0, 0))
    size = snprintf(text, sizeof(text),
        "status=%s\npid=%lu\nhook_status=%d\nmode=request_scoped_class_research\nevent_base=%ls\n"
        "requested_class=%ld\ndispatch_state=%ld\nsetup_calls=%ld\nfreighter_setups=%ld\nlast_kind=%ld\n"
        "applied_count=%ld\napplied_class=%ld\nrejected_item=%ld\n"
        "class_before=%ld,%ld,%ld\nclass_after=%ld,%ld,%ld\n"
        "slots_armed=%ld\nslots_applied=%ld\nlayout_overrides=%ld\n"
        "main_grid=%ld,%ld,%ld\ntechnology_grid=%ld,%ld,%ld\n"
        "super_added=%ld\nsuper_errors=%ld\ntable_patches=%ld\ntable_rejected=%ld\n"
        "carry_pending=%d\ncarry_applied=%ld\ncarry_candidates=%ld\ncarry_seed_equal=%ld\n"
        "carry_exact_site=%ld\ncarry_callers=%lx,%lx,%lx,%lx,%lx,%lx\n"
        "model_armed=%ld\nmodel_applied=%ld\nhome_pending=%ld\nhome_applied=%ld\nrequest_errors=%ld\n"
        "owned_index=%ld\nowned_applied=%ld\nowned_rejected=%ld\n",
        status, (unsigned long)GetCurrentProcessId(), result, event_base,
        READ(requested_class), READ(dispatch_state), READ(setup_calls), READ(freighter_setups), READ(last_kind),
        READ(applied_count), READ(applied_class), READ(rejected_item),
        READ(class_before[0]), READ(class_before[1]), READ(class_before[2]),
        READ(class_after[0]), READ(class_after[1]), READ(class_after[2]),
        READ(slots_armed), READ(slots_applied), READ(layout_overrides),
        READ(grid[0]), READ(grid[1]), READ(grid[2]), READ(grid[3]), READ(grid[4]), READ(grid[5]),
        READ(super_added), READ(super_errors), READ(table_patches), READ(table_rejected),
        carry_item != 0, READ(carry_applied), READ(carry_candidates), READ(carry_seed_equal),
        READ(carry_exact_site), (unsigned long)READ(carry_trace[0]), (unsigned long)READ(carry_trace[1]),
        (unsigned long)READ(carry_trace[2]), (unsigned long)READ(carry_trace[3]),
        (unsigned long)READ(carry_trace[4]), (unsigned long)READ(carry_trace[5]),
        READ(model_armed), READ(model_applied), READ(home_pending), READ(home_applied), READ(request_errors),
        READ(owned_index), READ(owned_applied), READ(owned_rejected));
#undef READ
    if (size > 0 && size < (int)sizeof(text)) {
        DWORD written;
        WriteFile(file, text, (DWORD)size, &written, NULL);
    }
    CloseHandle(file);
}

static void apply_ship_class(uintptr_t item, int32_t item_class) {
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

static void apply_class(uintptr_t item, int32_t item_class) {
    if (!writable_range(item, ITEM_READ_SPAN)) {
        InterlockedIncrement(&rejected_item);
        return;
    }
    for (unsigned index = 0; index < 3; ++index) {
        uint8_t *store = (uint8_t *)item + stores[index].offset;
        int32_t *header = (int32_t *)(store + STORE_CLASS_OFFSET);
        InterlockedExchange(&class_before[index], *header);
        *header = item_class;
        // Same arguments as the native branch, except the class and random (non-minimum) values.
        stat_generator(store, stores[index].inventory_type, (void *)(item + ITEM_SEED_OFFSET),
                       item_class, 0, 10, 0, 0);
        InterlockedExchange(&class_after[index], *header);
    }
    InterlockedExchange(&applied_class, item_class);
    InterlockedIncrement(&applied_count);
}

// Large technology height bound of one generation entry, or NULL unless it holds the expected 10 x 6.
static int32_t *technology_height_bound(uintptr_t size_type) {
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    (void)size_type;
    return NULL;
#else
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = *(const uintptr_t *)(base + MANAGER_POINTER_RVA);
    if (size_type > 0x40 || !writable_range(manager + TABLE_POINTER_OFFSET, sizeof(uintptr_t))) return NULL;
    uintptr_t entry = *(const uintptr_t *)(manager + TABLE_POINTER_OFFSET) + GENERATION_ENTRIES_OFFSET +
                      size_type * GENERATION_ENTRY_SIZE;
    if (!writable_range(entry, GENERATION_ENTRY_SIZE) ||
        *(const int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT) != 6 ||
        *(const int32_t *)(entry + ENTRY_TECH_LARGE_WIDTH) != 10) return NULL;
    return (int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT);
#endif
}

static uintptr_t layout_detour(uintptr_t store, uintptr_t inventory_type, uintptr_t slot_count,
                               uintptr_t layout, uintptr_t a5, uintptr_t size_type, uintptr_t a7,
                               uintptr_t a8, uintptr_t use_slot_count) {
    uintptr_t item = scope_item;
    int32_t *height = NULL;
    if (item && (LONG)GetCurrentThreadId() == InterlockedCompareExchange(&scope_thread, 0, 0)) {
        uint32_t wanted = store == item + MAIN_STORE_OFFSET ? MAX_MAIN_SLOTS :
                          store == item + TECHNOLOGY_STORE_OFFSET ? MAX_TECHNOLOGY_SLOTS : 0;
        if (wanted == MAX_TECHNOLOGY_SLOTS && InterlockedCompareExchange(&scope_rows, 0, 0)) {
            // The shared table is changed only for the duration of this one native call.
            height = technology_height_bound((uint32_t)size_type);
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
            wanted = 10 * EXTENDED_TECHNOLOGY_ROWS;
#else
            if (height) wanted = 10 * EXTENDED_TECHNOLOGY_ROWS;
            else InterlockedIncrement(&table_rejected);
#endif
        }
        if (wanted) {
            // Native meaning: use the supplied slot count; bounds then follow from that count.
            slot_count = wanted;
            use_slot_count = 1;
            InterlockedIncrement(&layout_overrides);
        }
    }
    if (height) { *height = EXTENDED_TECHNOLOGY_ROWS; InterlockedIncrement(&table_patches); }
    uintptr_t result = original_layout(store, inventory_type, slot_count, layout, a5, size_type, a7, a8, use_slot_count);
    if (height) *height = 6;
    return result;
}

// Mark every valid slot of a store as a technology-bonus special slot.
static void add_special_slots(uint8_t *store) {
    const uint64_t *rows = (const uint64_t *)store;
    int16_t width = *(const int16_t *)(store + 0x80), height = *(const int16_t *)(store + 0x82);
    special_vector *vector = (special_vector *)(store + STORE_SPECIAL_VECTOR);
    LONG added = 0;
    if (width < 1 || width > 16 || height < 1 || height > 16) { InterlockedIncrement(&super_errors); return; }
    for (int32_t y = 0; y < height; ++y) for (int32_t x = 0; x < width; ++x) {
        if (!(rows[y] >> x & 1)) continue;
        int present = 0;
        for (uint32_t index = 0; index < vector->count && !present; ++index)
            present = vector->data[index].x == x && vector->data[index].y == y &&
                      vector->data[index].type == SPECIAL_SLOT_TECH_BONUS;
        if (present) continue;
        special_slot slot = {x, y, SPECIAL_SLOT_TECH_BONUS};
        uint32_t before = vector->count;
        if (before < vector->capacity) {
            vector->data[before] = slot;
            vector->count = before + 1;
        } else {
            vector->data = vector_grow(vector, vector_grow_callback, before + 1, vector->data, before, &slot,
                                       1, 0, 0, sizeof(slot), 4, 0xffffffffu, vector->data, 0);
        }
        // Stop at the first append that did not behave as the native sites expect.
        if (vector->count != before + 1 || !vector->data) { InterlockedIncrement(&super_errors); break; }
        ++added;
    }
    InterlockedExchange(&super_added, added);
}

// A store is accepted for an in-place change only when its header is self-consistent: grid inside
// sixteen by sixteen, rows inside the width, no rows past the height, slot count equal to the set bits.
__attribute__((unused)) static int consistent_store(const uint8_t *store, int any_count) {
    if (!writable_range((uintptr_t)store, OWNED_STORE_STRIDE)) return 0;
    const uint64_t *rows = (const uint64_t *)store;
    int16_t width = *(const int16_t *)(store + 0x80), height = *(const int16_t *)(store + 0x82);
    int16_t count = *(const int16_t *)(store + 0x84);
    if (width < 1 || width > 16 || height < 1 || height > 16 || *(const uint32_t *)(store + STORE_CLASS_OFFSET) > 3)
        return 0;
    int bits = 0;
    for (int y = 0; y < 16; ++y) {
        if (y >= height ? rows[y] != 0 : (rows[y] >> width) != 0) return 0;
        bits += __builtin_popcountll(rows[y]);
    }
    return any_count || bits == count;
}

// Make every position of a ten by twelve grid valid. Existing elements keep their positions; this writes
// the same header fields the native layout step produces for a full grid, without calling it.
__attribute__((unused)) static void fill_owned_grid(uint8_t *store) {
    uint64_t *rows = (uint64_t *)store;
    for (int y = 0; y < 16; ++y) rows[y] = y < OWNED_GRID_HEIGHT ? (1ull << OWNED_GRID_WIDTH) - 1 : 0;
    *(int16_t *)(store + 0x80) = OWNED_GRID_WIDTH;
    *(int16_t *)(store + 0x82) = OWNED_GRID_HEIGHT;
    *(int16_t *)(store + 0x84) = OWNED_GRID_WIDTH * OWNED_GRID_HEIGHT;
}

static void add_special_slots(uint8_t *store);

// Runs on the game's update thread: one in-place change of an owned ship's or weapon's stores.
static void apply_owned_request(void) {
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = *(const uintptr_t *)(base + MANAGER_POINTER_RVA);
    LONG index = InterlockedCompareExchange(&owned_index, 0, 0);
    uint8_t *main_store = NULL, *technology = NULL;
    if (InterlockedCompareExchange(&owned_target, 0, 0) == 4) {
        // Resolve the primary ship slot the way the game does, then continue as an ordinary ship request.
        index = -1;
        if (manager && writable_range(manager + PLAYER_STATE_POINTER_OFFSET, sizeof(uintptr_t))) {
            uintptr_t state = *(const uintptr_t *)(manager + PLAYER_STATE_POINTER_OFFSET);
            if (writable_range(state + PRIMARY_SHIP_INDEX_OFFSET, sizeof(int32_t)))
                index = *(const int32_t *)(state + PRIMARY_SHIP_INDEX_OFFSET);
        }
        InterlockedExchange(&owned_index, index);
        InterlockedExchange(&owned_target, 0);
    }
    if (InterlockedCompareExchange(&owned_target, 0, 0) == 0 && index >= 0 && index < (LONG)OWNED_SHIP_SLOTS) {
        main_store = (uint8_t *)(manager + OWNED_SHIP_MAIN_OFFSET + (uintptr_t)index * OWNED_STORE_STRIDE);
        technology = (uint8_t *)(manager + OWNED_SHIP_TECHNOLOGY_OFFSET + (uintptr_t)index * OWNED_STORE_STRIDE);
    } else if (InterlockedCompareExchange(&owned_target, 0, 0) == 1 && index >= 0 && index < (LONG)OWNED_WEAPON_SLOTS) {
        technology = (uint8_t *)(manager + OWNED_WEAPON_OFFSET + (uintptr_t)index * OWNED_WEAPON_STRIDE);
    } else if (InterlockedCompareExchange(&owned_target, 0, 0) == 2) {
        technology = (uint8_t *)(manager + ACTIVE_WEAPON_OFFSET);
    } else if (InterlockedCompareExchange(&owned_target, 0, 0) == 3) {
        main_store = (uint8_t *)(manager + ACTIVE_SUIT_CARGO_OFFSET);
        technology = (uint8_t *)(manager + ACTIVE_SUIT_TECHNOLOGY_OFFSET);
    }
    int suit = InterlockedCompareExchange(&owned_target, 0, 0) == 3;
    if (!manager || !technology || !consistent_store(technology, 0) ||
        (main_store && !consistent_store(main_store, suit))) {
        InterlockedIncrement(&owned_rejected);
        return;
    }
    if (InterlockedCompareExchange(&owned_slots, 0, 0)) {
        if (main_store) fill_owned_grid(main_store);
        fill_owned_grid(technology);
    }
    if (InterlockedCompareExchange(&owned_super, 0, 0)) add_special_slots(technology);
    if (main_store) {
        const int16_t *header = (const int16_t *)(main_store + 0x80);
        InterlockedExchange(&grid[0], header[0]);
        InterlockedExchange(&grid[1], header[1]);
        InterlockedExchange(&grid[2], header[2]);
    }
    const int16_t *header = (const int16_t *)(technology + 0x80);
    InterlockedExchange(&grid[3], header[0]);
    InterlockedExchange(&grid[4], header[1]);
    InterlockedExchange(&grid[5], header[2]);
    InterlockedIncrement(&owned_applied);
#endif
}

// Parse the per-process owned request: "target=ship|weapon", "index=N", optional "slots=1", "super=1".
static int read_owned_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-owned-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) < 0) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG target = -1, index = -1, slots = 0, super = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "target=ship") == 0) target = 0;
        else if (strcmp(line, "target=weapon") == 0) target = 1;
        else if (strcmp(line, "target=equipped-weapon") == 0) { target = 2; if (index < 0) index = 0; }
        else if (strcmp(line, "target=suit") == 0) { target = 3; if (index < 0) index = 0; }
        else if (strcmp(line, "target=primary-ship") == 0) { target = 4; if (index < 0) index = 0; }
        else if (strncmp(line, "index=", 6) == 0 && line[6] >= '0' && line[6] <= '9' && (!line[7] || (line[7] >= '0' && line[7] <= '9' && !line[8])))
            index = atoi(line + 6);
        else if (strcmp(line, "slots=1") == 0) slots = 1;
        else if (strcmp(line, "super=1") == 0) super = 1;
        else ok = 0;
    }
    fclose(file);
    if (!ok || target < 0 || index < 0 || !(slots || super)) return 0;
    InterlockedExchange(&owned_target, target);
    InterlockedExchange(&owned_index, index);
    InterlockedExchange(&owned_slots, slots);
    InterlockedExchange(&owned_super, super);
    return 1;
}

static void special_detour(void *store, uint32_t inventory_type, void *seed) {
    uintptr_t item = carry_item;
    // Candidate: a type-8 store outside the armed offer whose own seed is unchanged.
    if (item && inventory_type == 8 && (uintptr_t)store - item >= ITEM_READ_SPAN &&
        writable_range(item, ITEM_READ_SPAN) &&
        memcmp((const void *)(item + ITEM_SEED_OFFSET), carry_seed, sizeof(carry_seed)) == 0) {
        uintptr_t caller = (uintptr_t)__builtin_return_address(0);
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
        int from_purchase = caller - (uintptr_t)accept_return < 0x80;
        uintptr_t caller_rva = caller - (uintptr_t)accept_return;
#else
        uintptr_t caller_rva = caller - (uintptr_t)GetModuleHandleW(NULL);
        int from_purchase = caller_rva >= PURCHASE_UPDATE_BEGIN_RVA && caller_rva < PURCHASE_UPDATE_END_RVA;
        InterlockedExchange(&carry_exact_site, (void *)caller == accept_return);
#endif
        InterlockedIncrement(&carry_candidates);
        LONG slot = InterlockedIncrement(&carry_trace_count) - 1;
        if (slot < CARRY_TRACE_CAPACITY) InterlockedExchange(&carry_trace[slot], (LONG)(caller_rva & 0x7fffffff));
        InterlockedExchange(&carry_seed_equal, seed && memcmp(seed, carry_seed, sizeof(carry_seed)) == 0);
        // Only a call made by the purchase update function copies; the passed seed is diagnostic.
        if (from_purchase) {
            carry_item = 0;
            store_copy(store, (const void *)(item + TECHNOLOGY_STORE_OFFSET));
            InterlockedIncrement(&carry_applied);
        }
    }
    original_special(store, inventory_type, seed);
}

static void home_detour(void *ownership, const void *seed) {
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    int from_acceptance = (uintptr_t)__builtin_return_address(0) - (uintptr_t)home_return < 0x20;
#else
    int from_acceptance = __builtin_return_address(0) == home_return;
#endif
    // Only the reward-acceptance write of the current system seed is replaced, once.
    if (from_acceptance && InterlockedCompareExchange(&home_pending, 0, 1) == 1) {
        seed = &request_home_seed;
        InterlockedIncrement(&home_applied);
    }
    original_home(ownership, seed);
}

// Parse "key=value" lines of the per-process request file; unknown or invalid lines reject the request.
static int read_model_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-freighter-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) < 0) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[256], scene[SCENE_CAPACITY] = {0};
    unsigned long long model = 0, home = 0;
    int has_scene = 0, has_model = 0, has_home = 0, ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        size_t size = strcspn(line, "\r\n");
        line[size] = 0;
        if (!size) continue;
        char *end = NULL;
        if (strncmp(line, "scene=", 6) == 0) {
            size_t count = size - 6;
            // Shipped model scenes only: fixed prefix and suffix, conservative characters.
            ok = count > 23 && count < SCENE_CAPACITY && strncmp(line + 6, "MODELS/", 7) == 0 &&
                 strcmp(line + size - 11, ".SCENE.MBIN") == 0 &&
                 strspn(line + 6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/.") == count;
            if (ok) { memcpy(scene, line + 6, count); has_scene = 1; }
        } else if (strncmp(line, "model_seed=0x", 13) == 0) {
            model = strtoull(line + 13, &end, 16); ok = end != line + 13 && !*end && size - 13 <= 16; has_model = ok;
        } else if (strncmp(line, "home_seed=0x", 12) == 0) {
            home = strtoull(line + 12, &end, 16); ok = end != line + 12 && !*end && size - 12 <= 16; has_home = ok;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || !(has_scene || has_model || has_home)) return 0;
    memset(request_scene, 0, sizeof(request_scene));
    memcpy(request_scene, scene, sizeof(scene));
    request_model_seed = (seed_pair){model, 1};
    request_home_seed = (seed_pair){home, 1};
    InterlockedExchange(&request_has_scene, has_scene);
    InterlockedExchange(&request_has_model_seed, has_model);
    InterlockedExchange(&request_has_home_seed, has_home);
    return 1;
}

// Read the requested reward ID from the per-process file and accept it only when it is on the list.
static int read_reward_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-reward-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) < 0) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64] = {0};
    char *read = fgets(line, sizeof(line), file);
    fclose(file);
    if (!read) return 0;
    line[strcspn(line, "\r\n")] = 0;
    for (LONG index = 0; index < (LONG)(sizeof(listed_rewards) / sizeof(listed_rewards[0])); ++index)
        if (strcmp(line, listed_rewards[index]) == 0) {
            InterlockedExchange(&listed_reward_index, index);
            return 1;
        }
    return 0;
}

static void record_grid(uintptr_t item) {
    static const uint32_t offsets[2] = {MAIN_STORE_OFFSET, TECHNOLOGY_STORE_OFFSET};
    if (!writable_range(item, ITEM_READ_SPAN)) return;
    for (unsigned index = 0; index < 2; ++index) {
        const int16_t *header = (const int16_t *)(item + offsets[index] + 0x80u);
        InterlockedExchange(&grid[index * 3], header[0]);
        InterlockedExchange(&grid[index * 3 + 1], header[1]);
        InterlockedExchange(&grid[index * 3 + 2], header[2]);
    }
}

static uintptr_t setup_detour(uintptr_t item, uintptr_t a2, uintptr_t a3, uintptr_t a4, uintptr_t a5,
                              uintptr_t a6, uintptr_t kind, uintptr_t a8, uintptr_t a9, uintptr_t a10,
                              uintptr_t a11) {
    // A corvette build start is the ship setup that follows the corvette event. Its size type has the same
    // large bounds as the freighter entry (10 x 12 main, 10 x 6 technology), so the slot scope is shared.
    int corvette = (uint32_t)kind == SHIP_ITEM_KIND && item &&
                   InterlockedCompareExchange(&ship_class_armed, 0, 0) == 1;
    int scoped = ((uint32_t)kind == FREIGHTER_ITEM_KIND || corvette) && item &&
                 InterlockedCompareExchange(&slots_armed, 0, 1) == 1;
    if ((uint32_t)kind == FREIGHTER_ITEM_KIND) {
        carry_item = 0;   // a new offer supersedes any pending carry
        InterlockedExchange(&home_pending, 0);
        if (item && InterlockedCompareExchange(&model_armed, 0, 1) == 1) {
            // Native meaning of arguments 2 and 3: model seed pair and scene filename.
            if (InterlockedCompareExchange(&request_has_model_seed, 0, 0)) a2 = (uintptr_t)&request_model_seed;
            if (InterlockedCompareExchange(&request_has_scene, 0, 0)) a3 = (uintptr_t)request_scene;
            if (InterlockedCompareExchange(&request_has_home_seed, 0, 0)) InterlockedExchange(&home_pending, 1);
            InterlockedIncrement(&model_applied);
        }
    }
    if (scoped) {
        InterlockedExchange(&scope_rows, InterlockedExchange(&tech_rows_armed, 0));
        scope_item = item;
        InterlockedExchange(&scope_thread, (LONG)GetCurrentThreadId());
    }
    uintptr_t result = original_setup(item, a2, a3, a4, a5, a6, kind, a8, a9, a10, a11);
    if (scoped) {
        InterlockedExchange(&scope_thread, 0);
        scope_item = 0;
        InterlockedExchange(&scope_rows, 0);
        InterlockedIncrement(&slots_applied);
    }
    InterlockedIncrement(&setup_calls);
    InterlockedExchange(&last_kind, (LONG)(uint32_t)kind);
    if ((uint32_t)kind == SHIP_ITEM_KIND && item && InterlockedCompareExchange(&ship_class_armed, 0, 1) == 1) {
        // Corvette build start: apply the armed class once to the ship item the game just set up.
        LONG ship_class = InterlockedCompareExchange(&requested_class, 0, 0);
        if (ship_class >= 0 && ship_class < CLASS_COUNT &&
            InterlockedCompareExchange(&requested_class, -1, ship_class) == ship_class)
            apply_ship_class(item, (int32_t)ship_class);
        int ship_marked = InterlockedCompareExchange(&super_armed, 0, 1) == 1 && writable_range(item, ITEM_READ_SPAN);
        if (ship_marked) add_special_slots((uint8_t *)item + TECHNOLOGY_STORE_OFFSET);
        if ((scoped || ship_marked) && writable_range(item, ITEM_READ_SPAN)) record_grid(item);
    }
    if ((uint32_t)kind != FREIGHTER_ITEM_KIND) return result;
    InterlockedIncrement(&freighter_setups);
    LONG item_class = InterlockedCompareExchange(&requested_class, 0, 0);
    // Consume the armed request atomically so a second setup never reuses it.
    if (item_class >= 0 && item_class < CLASS_COUNT &&
        InterlockedCompareExchange(&requested_class, -1, item_class) == item_class)
        apply_class(item, (int32_t)item_class);
    int marked = InterlockedCompareExchange(&super_armed, 0, 1) == 1 && writable_range(item, ITEM_READ_SPAN);
    if (marked) add_special_slots((uint8_t *)item + TECHNOLOGY_STORE_OFFSET);
    if ((scoped || marked) && writable_range(item, ITEM_READ_SPAN)) {
        record_grid(item);
        memcpy(carry_seed, (const void *)(item + ITEM_SEED_OFFSET), sizeof(carry_seed));
        carry_item = item;
    }
    return result;
}

#include "technology_learn_180836.h"
#include "recipe_learn_180836.h"

static void WINAPI update_detour(void *application) {
    if (InterlockedCompareExchange(&technology_state, 0, 0) == 1) technology_apply_request();
    if (InterlockedCompareExchange(&recipe_state, 0, 0) == 1) recipe_apply_request();
    if (InterlockedCompareExchange(&owned_state, 0, 1) == 1) apply_owned_request();
    if (InterlockedCompareExchange(&dispatch_state, 2, 1) == 1) {
        char reward_id[16] = {0}, mission_id[16] = {0};
        unsigned char seed[16] = {0};
        uint64_t multi_product_count = 0;
        LONG choice = InterlockedCompareExchange(&dispatch_choice, 0, 0);
        LONG listed = InterlockedCompareExchange(&listed_reward_index, 0, 0);
        if (choice == 2 && listed >= 0 && listed < (LONG)(sizeof(listed_rewards) / sizeof(listed_rewards[0])))
            memcpy(reward_id, listed_rewards[listed], strlen(listed_rewards[listed]));
        else if (choice == 1)
            memcpy(reward_id, CORVETTE_BUILD_REWARD_ID, sizeof(CORVETTE_BUILD_REWARD_ID) - 1);
        else
            memcpy(reward_id, TEST_REWARD_ID, sizeof(TEST_REWARD_ID) - 1);
        give_reward(reward_manager, reward_id, mission_id, seed, 0, 1, &multi_product_count, 0, -1, 0);
        InterlockedExchange(&dispatch_state, 3);
    }
    original_update(application);
}

static int resolve_targets(void) {
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    HMODULE host = (HMODULE)base;
    update_target = (void *)GetProcAddress(host, "CourierTestUpdate");
    setup_target = (void *)GetProcAddress(host, "CourierTestPurchaseSetup");
    layout_target = (void *)GetProcAddress(host, "CourierTestLayoutInitializer");
    special_target = (void *)GetProcAddress(host, "CourierTestSpecialGenerator");
    store_copy = (store_copy_fn)(void *)GetProcAddress(host, "CourierTestStoreCopy");
    vector_grow = (vector_grow_fn)(void *)GetProcAddress(host, "CourierTestVectorGrow");
    vector_grow_callback = (void *)GetProcAddress(host, "CourierTestVectorGrowCallback");
    accept_return = (void *)GetProcAddress(host, "CourierTestAccept");
    home_target = (void *)GetProcAddress(host, "CourierTestHomeSeed");
    home_return = (void *)GetProcAddress(host, "CourierTestAcceptHome");
    if (!home_target || !home_return) return 0;
    if (!accept_return || !special_target || !store_copy || !vector_grow || !vector_grow_callback) return 0;
    stat_generator = (stat_generator_fn)(void *)GetProcAddress(host, "CourierTestStatGenerator");
    give_reward = (give_reward_fn)(void *)GetProcAddress(host, "CourierTestGiveReward");
    reward_manager = (void *)GetProcAddress(host, "CourierTestRewardManager");
    return update_target && setup_target && layout_target && stat_generator && give_reward && reward_manager;
#else
    static const unsigned char update_entry[16] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0xe8, 0xe5, 0x83, 0x92, 0x02, 0x48,
        0x89, 0x05, 0x8e, 0xfd
    };
    static const unsigned char reward_entry[24] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xec, 0x70
    };
    static const unsigned char setup_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x4c, 0x89, 0x44, 0x24, 0x18, 0x55, 0x56,
        0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48, 0x8d, 0xac,
        0x24, 0x10, 0xc2, 0xff, 0xff, 0xb8, 0xf0, 0x3e
    };
    static const unsigned char statgen_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x6c, 0x24, 0x20, 0x56, 0x57,
        0x41, 0x56, 0x48, 0x81, 0xec, 0xa0, 0x00, 0x00, 0x00, 0x48, 0x8b, 0xf1,
        0x49, 0x63, 0xe9, 0x48, 0x8d, 0x8c, 0x24, 0xd0
    };
    static const unsigned char layout_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x4c, 0x89, 0x4c, 0x24, 0x20, 0x44, 0x89,
        0x44, 0x24, 0x18, 0x55, 0x56, 0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56,
        0x41, 0x57, 0x48, 0x8b, 0xec, 0x48, 0x83, 0xec
    };
    static const unsigned char special_entry[32] = {
        0x4c, 0x8b, 0xdc, 0x53, 0x55, 0x48, 0x81, 0xec, 0x98, 0x00, 0x00, 0x00,
        0x4c, 0x63, 0xca, 0x49, 0x8b, 0xd8, 0x48, 0x8b, 0xe9, 0x41, 0x83, 0xf9,
        0x0b, 0x0f, 0x87, 0xb3, 0x02, 0x00, 0x00, 0xb8
    };
    static const unsigned char copy_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x48, 0x83, 0xec, 0x40, 0x0f, 0xb7, 0x82, 0x80,
        0x00, 0x00, 0x00, 0x48, 0x8d, 0xb1, 0x88, 0x00
    };
    static const unsigned char grow_entry[32] = {
        0x40, 0x53, 0x48, 0x81, 0xec, 0xb0, 0x00, 0x00, 0x00, 0x4c, 0x8b, 0x94,
        0x24, 0x08, 0x01, 0x00, 0x00, 0x48, 0x8d, 0x05, 0xa0, 0x3b, 0x92, 0x00,
        0x4c, 0x8b, 0x9c, 0x24, 0xf0, 0x00, 0x00, 0x00
    };
    // Acceptance: special-slot generation for the owned type-8 store, ending in the hooked call.
    static const unsigned char accept_site[36] = {
        0x8d, 0x95, 0xa0, 0x10, 0x00, 0x00, 0x48, 0x8b, 0xc8, 0xe8, 0x1c, 0xfb,
        0x8d, 0xff, 0x4c, 0x8d, 0x45, 0x20, 0x41, 0x8b, 0xd7, 0x48, 0x8b, 0xcb,
        0x0f, 0x10, 0x00, 0x0f, 0x29, 0x45, 0x20, 0xe8, 0x86, 0x40, 0xbe, 0xff
    };
    static const unsigned char home_entry[16] = {
        0x0f, 0x10, 0x02, 0x0f, 0x11, 0x81, 0xb0, 0x02, 0x00, 0x00, 0xc3, 0xcc,
        0xcc, 0xcc, 0xcc, 0xcc
    };
    // Reward acceptance: current solar system seed passed to the home seed setter.
    static const unsigned char home_site[27] = {
        0x48, 0x8b, 0x88, 0x20, 0xe0, 0x25, 0x00, 0xe8, 0xaa, 0xea, 0x8d, 0xff,
        0x48, 0x8b, 0xcb, 0x48, 0x8d, 0x90, 0x80, 0x24, 0x00, 0x00, 0xe8, 0x0b,
        0x86, 0xc5, 0xff
    };
    // The three native class-0 stat calls for stores 0x980, 0xe10 and 0xbc8.
    static const unsigned char freighter_block[127] = {
        0x8b, 0x95, 0x68, 0x3e, 0x00, 0x00, 0x4c, 0x8d, 0x46, 0x10, 0xc6, 0x44,
        0x24, 0x38, 0x01, 0x48, 0x8d, 0x8e, 0x80, 0x09, 0x00, 0x00, 0xc7, 0x44,
        0x24, 0x28, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x33, 0xc9, 0x44, 0x89, 0x74,
        0x24, 0x20, 0xe8, 0x38, 0x82, 0xbe, 0xff, 0xc6, 0x44, 0x24, 0x38, 0x01,
        0x4c, 0x8d, 0x46, 0x10, 0xc7, 0x44, 0x24, 0x28, 0x0a, 0x00, 0x00, 0x00,
        0x48, 0x8d, 0x8e, 0x10, 0x0e, 0x00, 0x00, 0x45, 0x33, 0xc9, 0x44, 0x89,
        0x74, 0x24, 0x20, 0xba, 0x05, 0x00, 0x00, 0x00, 0xe8, 0x0e, 0x82, 0xbe,
        0xff, 0xc6, 0x44, 0x24, 0x38, 0x01, 0x4c, 0x8d, 0x46, 0x10, 0xc7, 0x44,
        0x24, 0x28, 0x0a, 0x00, 0x00, 0x00, 0x48, 0x8d, 0x8e, 0xc8, 0x0b, 0x00,
        0x00, 0x45, 0x33, 0xc9, 0x44, 0x89, 0x74, 0x24, 0x20, 0xba, 0x09, 0x00,
        0x00, 0x00, 0xe8, 0xe4, 0x81, 0xbe, 0xff
    };
    update_target = (void *)(base + UPDATE_RVA);
    setup_target = (void *)(base + SETUP_RVA);
    layout_target = (void *)(base + LAYOUT_RVA);
    special_target = (void *)(base + SPECIAL_GENERATOR_RVA);
    store_copy = (store_copy_fn)(base + STORE_COPY_RVA);
    vector_grow = (vector_grow_fn)(base + VECTOR_GROW_RVA);
    vector_grow_callback = (void *)(base + VECTOR_GROW_CALLBACK_RVA);
    accept_return = (void *)(base + ACCEPT_RETURN_RVA);
    home_target = (void *)(base + HOME_SEED_SETTER_RVA);
    home_return = (void *)(base + HOME_SEED_RETURN_RVA);
    stat_generator = (stat_generator_fn)(base + STAT_GENERATOR_RVA);
    give_reward = (give_reward_fn)(base + GIVE_REWARD_RVA);
    reward_manager = (void *)(base + REWARD_MANAGER_RVA);
    return memcmp(update_target, update_entry, sizeof(update_entry)) == 0 &&
           memcmp((void *)(base + GIVE_REWARD_RVA), reward_entry, sizeof(reward_entry)) == 0 &&
           memcmp(setup_target, setup_entry, sizeof(setup_entry)) == 0 &&
           memcmp(layout_target, layout_entry, sizeof(layout_entry)) == 0 &&
           memcmp(special_target, special_entry, sizeof(special_entry)) == 0 &&
           memcmp((void *)(base + STORE_COPY_RVA), copy_entry, sizeof(copy_entry)) == 0 &&
           memcmp((void *)(base + VECTOR_GROW_RVA), grow_entry, sizeof(grow_entry)) == 0 &&
           memcmp((void *)(base + ACCEPT_SITE_RVA), accept_site, sizeof(accept_site)) == 0 &&
           memcmp(home_target, home_entry, sizeof(home_entry)) == 0 &&
           memcmp((void *)(base + HOME_SEED_SITE_RVA), home_site, sizeof(home_site)) == 0 &&
           writable_range(base + MANAGER_POINTER_RVA, sizeof(uintptr_t)) &&
           memcmp((void *)(base + STAT_GENERATOR_RVA), statgen_entry, sizeof(statgen_entry)) == 0 &&
           memcmp((void *)(base + FREIGHTER_BLOCK_RVA), freighter_block, sizeof(freighter_block)) == 0 &&
           writable_range((uintptr_t)reward_manager, 1) && technology_resolve(base) && recipe_resolve(base);
#endif
}

void courier_probe_after_verified(void) {
    static const wchar_t *const tags[EVENT_COUNT] = {L"c", L"b", L"a", L"s", L"dispatch", L"slots",
                                                     L"techrows", L"super", L"model", L"corvette",
                                                     L"reward", L"owned", L"technology", L"recipes"};
    HANDLE events[EVENT_COUNT] = {0};
    if (!resolve_targets()) { write_status("target_verification_failed", MH_ERROR_UNSUPPORTED_FUNCTION); return; }
    MH_STATUS result = MH_Initialize();
    if (result != MH_OK) { write_status("hook_initialize_failed", result); return; }
    result = MH_CreateHook(update_target, (void *)update_detour, (void **)&original_update);
    if (result == MH_OK) result = MH_CreateHook(setup_target, (void *)setup_detour, (void **)&original_setup);
    if (result == MH_OK) result = MH_CreateHook(layout_target, (void *)layout_detour, (void **)&original_layout);
    if (result == MH_OK) result = MH_CreateHook(special_target, (void *)special_detour, (void **)&original_special);
    if (result == MH_OK) result = MH_CreateHook(home_target, (void *)home_detour, (void **)&original_home);
    if (result != MH_OK) { write_status("hook_create_failed", result); return; }
    unsigned long random[4];
    if (BCryptGenRandom(NULL, (PUCHAR)random, sizeof(random), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0 ||
        swprintf(event_base, 112, L"Local\\NMSCourier-FreighterClass180836-%lu-%08lx%08lx%08lx%08lx",
                 (unsigned long)GetCurrentProcessId(), random[0], random[1], random[2], random[3]) < 0) {
        write_status("event_name_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    for (unsigned index = 0; index < EVENT_COUNT; ++index) {
        wchar_t name[128];
        if (swprintf(name, 128, L"%ls-%ls", event_base, tags[index]) < 0) break;
        events[index] = CreateEventW(NULL, TRUE, FALSE, name);
        if (!events[index] || GetLastError() == ERROR_ALREADY_EXISTS) {
            write_status("event_create_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
            for (unsigned close = 0; close <= index; ++close) if (events[close]) CloseHandle(events[close]);
            return;
        }
    }
    int hooks_enabled = 0;
    write_status("awaiting_request", MH_OK);
    for (unsigned waited = 0; waited < ARM_WINDOW_SECONDS; ) {
        DWORD signaled = WaitForMultipleObjects(EVENT_COUNT, events, FALSE, 2000);
        technology_write_result();
        recipe_write_result();
        if (signaled == WAIT_TIMEOUT) { waited += 2; write_status(hooks_enabled ? "armed" : "awaiting_request", MH_OK); continue; }
        if (signaled >= WAIT_OBJECT_0 + EVENT_COUNT) { write_status("event_wait_failed", MH_ERROR_UNSUPPORTED_FUNCTION); break; }
        unsigned index = signaled - WAIT_OBJECT_0;
        ResetEvent(events[index]);
        if (!hooks_enabled) {
            // One thread freeze for all three hooks.
            result = MH_EnableHook(MH_ALL_HOOKS);
            if (result != MH_OK) { write_status("hook_enable_failed", result); break; }
            hooks_enabled = 1;
        }
        if (index < CLASS_COUNT) InterlockedExchange(&requested_class, (LONG)index);
        else if (index == CLASS_COUNT + 1) InterlockedExchange(&slots_armed, 1);
        else if (index == CLASS_COUNT + 2) { InterlockedExchange(&tech_rows_armed, 1); InterlockedExchange(&slots_armed, 1); }
        else if (index == CLASS_COUNT + 3) InterlockedExchange(&super_armed, 1);
        else if (index == CLASS_COUNT + 4) {
            if (read_model_request()) InterlockedExchange(&model_armed, 1);
            else InterlockedIncrement(&request_errors);
        }
        // A dispatch may be requested again only after the previous call returned (state 3);
        // a call that never returned leaves state 2 and blocks further requests in this process.
        // Events "dispatch" and "corvette" both arrive here and differ only in the reward chosen.
        else if (index == CLASS_COUNT + 6 && !read_reward_request()) InterlockedIncrement(&request_errors);
        else if (index == CLASS_COUNT + 7) {
            if (read_owned_request()) InterlockedExchange(&owned_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 8) {
            if (technology_read_request()) InterlockedExchange(&technology_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 9) {
            if (recipe_read_request()) InterlockedExchange(&recipe_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else {
            InterlockedExchange(&dispatch_choice, index == CLASS_COUNT + 6 ? 2 : index == CLASS_COUNT + 5 ? 1 : 0);
            InterlockedExchange(&ship_class_armed, index == CLASS_COUNT + 5 ? 1 : 0);
            if (InterlockedCompareExchange(&dispatch_state, 1, 0) != 0)
                InterlockedCompareExchange(&dispatch_state, 1, 3);
        }
        write_status("armed", MH_OK);
    }
    InterlockedExchange(&requested_class, -1);
    InterlockedExchange(&slots_armed, 0);
    InterlockedExchange(&tech_rows_armed, 0);
    InterlockedExchange(&super_armed, 0);
    InterlockedExchange(&model_armed, 0);
    InterlockedExchange(&home_pending, 0);
    carry_item = 0;
    for (unsigned index = 0; index < EVENT_COUNT; ++index) CloseHandle(events[index]);
    if (hooks_enabled) result = MH_DisableHook(MH_ALL_HOOKS);
    write_status(result == MH_OK ? "window_complete" : "hook_disable_failed", result);
}

#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
__declspec(dllexport) LONG CourierFreighterModelSnapshot(LONG values[4]) {
    values[0] = InterlockedCompareExchange(&model_applied, 0, 0);
    values[1] = InterlockedCompareExchange(&home_applied, 0, 0);
    values[2] = InterlockedCompareExchange(&home_pending, 0, 0);
    values[3] = InterlockedCompareExchange(&request_errors, 0, 0);
    return InterlockedCompareExchange(&model_armed, 0, 0);
}
__declspec(dllexport) LONG CourierFreighterSpecialSnapshot(LONG values[3]) {
    values[0] = InterlockedCompareExchange(&super_added, 0, 0);
    values[1] = InterlockedCompareExchange(&super_errors, 0, 0);
    values[2] = InterlockedCompareExchange(&carry_applied, 0, 0);
    return carry_item != 0;
}
__declspec(dllexport) LONG CourierFreighterSlotsSnapshot(LONG values[3]) {
    values[0] = InterlockedCompareExchange(&slots_armed, 0, 0);
    values[1] = InterlockedCompareExchange(&slots_applied, 0, 0);
    values[2] = InterlockedCompareExchange(&layout_overrides, 0, 0);
    return InterlockedCompareExchange(&grid[2], 0, 0);
}
__declspec(dllexport) LONG CourierFreighterClassSnapshot(LONG values[6]) {
    values[0] = InterlockedCompareExchange(&setup_calls, 0, 0);
    values[1] = InterlockedCompareExchange(&freighter_setups, 0, 0);
    values[2] = InterlockedCompareExchange(&applied_count, 0, 0);
    values[3] = InterlockedCompareExchange(&applied_class, 0, 0);
    values[4] = InterlockedCompareExchange(&dispatch_state, 0, 0);
    values[5] = InterlockedCompareExchange(&rejected_item, 0, 0);
    return InterlockedCompareExchange(&requested_class, 0, 0);
}
#endif
