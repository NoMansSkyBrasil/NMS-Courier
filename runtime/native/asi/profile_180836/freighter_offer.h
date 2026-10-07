// Freighter domain of the build 180836 research profile: the class, scene, seeds and technology carry
// of one freighter purchase offer, and the shipped freighter rewards. Included once by profile_core.c.
// After the native purchase setup returns for item kind 3, an armed request stores the requested class
// in the three temporary offer inventories and regenerates their base stats with the game's own
// generator. A model request read from a per-process file replaces the scene filename and model seed
// arguments of that setup, and a home seed replaces the value the reward acceptance would copy from
// the current solar system. At acceptance the offered technology store is copied into the owned one
// with the native store copy, as the game itself does for a freighter bought from an NPC.

#define SPECIAL_GENERATOR_RVA 0x4d2350u
#define STORE_COPY_RVA 0x4d12d0u
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
#define FREIGHTER_BLOCK_RVA 0x8e684du
#define FREIGHTER_ITEM_KIND 3
// Shipped specific-ship freighter reward; its table entry declares class B.
#define FREIGHTER_OFFER_REWARD_ID "RS_S13_S4M6"
// Shipped reward that opens the game's own window for one more freighter slot.
#define FREIGHTER_SLOT_REWARD_ID "R_FREIGHTSLOT"

typedef void (*special_generator_fn)(void *store, uint32_t inventory_type, void *seed);
typedef void (*store_copy_fn)(void *destination, const void *source);
typedef void (*home_seed_fn)(void *ownership, const void *seed);

// Store offsets and inventory-type arguments exactly as the native freighter branch passes them.
static const struct { uint32_t offset; uint32_t inventory_type; } stores[3] = {
    {0x980u, 7u}, {0xe10u, 5u}, {0xbc8u, 9u}
};
static void *special_target;
static void *accept_return;
static special_generator_fn original_special;
static store_copy_fn store_copy;
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
// Diagnostics while a carry is pending: type-8 calls for stores outside the offer.
static volatile LONG carry_candidates;
static volatile LONG carry_seed_equal = -1;
static volatile LONG carry_exact_site = -1;
static volatile LONG carry_trace_count;
static volatile LONG carry_trace[CARRY_TRACE_CAPACITY];   // caller return RVAs, 0 if outside the executable
// Offer whose technology store is copied at acceptance; identified by item and seed.
static volatile uintptr_t carry_item;
static uint64_t carry_seed[2];
static volatile LONG freighter_setups;

static void apply_freighter_offer_class(uintptr_t item, int32_t item_class) {
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
