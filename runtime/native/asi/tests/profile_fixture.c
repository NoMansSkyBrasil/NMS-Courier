// Isolated host for the build 180836 freighter class profile. Never a game test.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ITEM_SPAN 0x1070u
typedef struct {
    void *store; uint32_t inventory_type; void *seed; int32_t item_class;
    uint32_t argument_5, argument_6; uint8_t minimum_values;
} stat_call;
static stat_call stat_calls[16];
static volatile LONG stat_count, update_calls, setup_calls, reward_calls, layout_count;
static struct { uintptr_t store, inventory_type, slot_count, use_slot_count; } layout_calls[32];
static unsigned char *reward_item;
static char last_reward_id[16];
static uint64_t last_reward_scalars;
__declspec(dllexport) unsigned char CourierTestRewardManager[64];

__declspec(dllexport) __declspec(noinline) void WINAPI CourierTestUpdate(void *application) {
    (void)application;
    InterlockedIncrement(&update_calls);
}
__declspec(dllexport) __declspec(noinline) void CourierTestStatGenerator(
    void *store, uint32_t inventory_type, void *seed, int32_t item_class,
    uint32_t argument_5, uint32_t argument_6, uint64_t argument_7, uint8_t minimum_values) {
    (void)argument_7;
    LONG index = InterlockedIncrement(&stat_count) - 1;
    if (index < 16) stat_calls[index] = (stat_call){store, inventory_type, seed, item_class,
                                                    argument_5, argument_6, minimum_values};
}
__declspec(dllexport) __declspec(noinline) uintptr_t CourierTestLayoutInitializer(
    uintptr_t store, uintptr_t inventory_type, uintptr_t slot_count, uintptr_t layout, uintptr_t a5,
    uintptr_t size_type, uintptr_t a7, uintptr_t a8, uintptr_t use_slot_count) {
    (void)layout; (void)a5; (void)a7; (void)a8;
    LONG index = InterlockedIncrement(&layout_count) - 1;
    if (index < 32) {
        layout_calls[index].store = store; layout_calls[index].inventory_type = inventory_type;
        layout_calls[index].slot_count = slot_count; layout_calls[index].use_slot_count = use_slot_count;
    }
    // Stand-in for the native header and valid rows: ten columns, every slot valid.
    if (store) {
        int16_t *header = (int16_t *)(store + 0x80);
        header[0] = 10; header[1] = (int16_t)(slot_count / 10); header[2] = (int16_t)slot_count;
        for (int row = 0; row < 16; ++row) ((uint64_t *)store)[row] = row < header[1] ? 0x3ffu : 0;
    }
    return store + size_type;
}
typedef struct { int32_t x, y, type; } test_slot;
typedef struct { uint32_t capacity, count; test_slot *data; } test_vector;
static volatile LONG special_calls, copy_calls, grow_calls, grow_bad;
static void *copy_destination; static const void *copy_source;
static void *volatile special_store, *volatile special_seed; static volatile uint32_t special_type;
__declspec(dllexport) void CourierTestVectorGrowCallback(void) {}
__declspec(dllexport) __declspec(noinline) void *CourierTestVectorGrow(
    void *vector, void *callback, uint32_t new_count, void *data, uint64_t count, const void *element,
    uint64_t one, uint64_t zero_1, uint64_t zero_2, uint64_t element_size, uint64_t alignment,
    uint32_t minus_one, void *data_again, uint64_t zero_3) {
    test_vector *target = vector;
    InterlockedIncrement(&grow_calls);
    if (callback != (void *)CourierTestVectorGrowCallback || new_count != count + 1 || data != target->data ||
        count != target->count || one != 1 || zero_1 || zero_2 || element_size != 12 || alignment != 4 ||
        minus_one != 0xffffffffu || data_again != data || zero_3) InterlockedIncrement(&grow_bad);
    test_slot *grown = realloc(target->data, (size_t)new_count * 12);
    memcpy(&grown[count], element, 12);
    target->capacity = new_count;
    target->count = new_count;
    return grown;
}
__declspec(dllexport) __declspec(noinline) void CourierTestSpecialGenerator(void *store, uint32_t type, void *seed) {
    // Record every argument so the compiler cannot drop them at same-file call sites.
    special_store = store; special_type = type; special_seed = seed;
    InterlockedIncrement(&special_calls);
}
__declspec(dllexport) __declspec(noinline) void CourierTestStoreCopy(void *destination, const void *source) {
    InterlockedIncrement(&copy_calls);
    copy_destination = destination; copy_source = source;
}
// Stand-in for the acceptance block: the only caller whose return address is accepted.
__declspec(dllexport) __declspec(noinline) void CourierTestAccept(void *owned_store, void *seed) {
    CourierTestSpecialGenerator(owned_store, 8, seed);
    InterlockedIncrement(&special_calls);
}
static volatile uint64_t home_value, setup_seed;
static char setup_scene[128];
static void *volatile home_owner;
__declspec(dllexport) __declspec(noinline) void CourierTestHomeSeed(void *ownership, const void *seed) {
    home_owner = ownership;
    home_value = *(const uint64_t *)seed;
}
// Stand-ins for the two callers of the home seed setter; only the first one is the reward acceptance.
__declspec(dllexport) __declspec(noinline) void CourierTestAcceptHome(void *ownership, const void *seed) {
    CourierTestHomeSeed(ownership, seed);
    InterlockedIncrement(&special_calls);
}
__declspec(dllexport) __declspec(noinline) void CourierTestOtherHome(void *ownership, const void *seed) {
    CourierTestHomeSeed(ownership, seed);
    InterlockedIncrement(&special_calls);
}
__declspec(dllexport) __declspec(noinline) uintptr_t CourierTestPurchaseSetup(
    uintptr_t item, uintptr_t a2, uintptr_t a3, uintptr_t a4, uintptr_t a5, uintptr_t a6,
    uintptr_t kind, uintptr_t a8, uintptr_t a9, uintptr_t a10, uintptr_t a11) {
    InterlockedIncrement(&setup_calls);
    setup_seed = a2 ? *(const uint64_t *)a2 : 0;
    memset(setup_scene, 0, sizeof(setup_scene));
    if (a3) strncpy(setup_scene, (const char *)a3, sizeof(setup_scene) - 1);
    // Like the native layout initializer, setup itself leaves class 0 in every store.
    if (item && (uint32_t)kind == 3) {
        CourierTestLayoutInitializer(item + 0x980, 7, 18, 0, 0, 0x1c, 0, 2, 0);
        CourierTestLayoutInitializer(item + 0xe10, 8, 18, 0, 0, 0x1c, 0, 2, 0);
        CourierTestLayoutInitializer(item + 0xbc8, 9, 4, 0, 0, 0x1c, 0, 2, 0);
        *(int32_t *)(item + 0x980 + 0x100) = 0;
        *(int32_t *)(item + 0xe10 + 0x100) = 0;
        *(int32_t *)(item + 0xbc8 + 0x100) = 0;
    }
    return item + 2*a2 + 3*a3 + 4*a4 + 5*a5 + 6*a6 + 7*kind + 8*a8 + 9*a9 + 10*a10 + 11*a11;
}
__declspec(dllexport) __declspec(noinline) uint8_t CourierTestGiveReward(
    void *manager, const char *reward_id, const char *mission_id, const void *seed, uint8_t peek,
    uint8_t force_show_message, uint64_t *out_count, uint8_t force_silent,
    int32_t inventory_choice_override, uint8_t use_mining_modifier) {
    (void)mission_id; (void)seed;
    InterlockedIncrement(&reward_calls);
    memcpy(last_reward_id, reward_id, 16);
    last_reward_scalars = (manager == CourierTestRewardManager) | (peek << 1) | (force_show_message << 2) |
        ((out_count != NULL) << 3) | (force_silent << 4) | ((inventory_choice_override == -1) << 5) |
        (use_mining_modifier << 6);
    CourierTestPurchaseSetup((uintptr_t)reward_item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    return 1;
}

static int classes(const unsigned char *item, int expected) {
    return *(const int32_t *)(item + 0x980 + 0x100) == expected &&
           *(const int32_t *)(item + 0xe10 + 0x100) == expected &&
           *(const int32_t *)(item + 0xbc8 + 0x100) == expected;
}
static int signal_event(const char *base, const char *tag) {
    char name[160];
    snprintf(name, sizeof(name), "%s-%s", base, tag);
    HANDLE event = OpenEventA(EVENT_MODIFY_STATE, FALSE, name);
    if (!event) return 0;
    BOOL ok = SetEvent(event);
    CloseHandle(event);
    Sleep(900);
    return ok != 0;
}
// The way the desktop application sends a request: a file that names it, which the profile takes
// and deletes. Returns 1 when the profile took it.
static int signal_file(const char *tag) {
    char root[MAX_PATH], path[MAX_PATH];
    if (!GetEnvironmentVariableA("LOCALAPPDATA", root, MAX_PATH)) return 0;
    snprintf(path, sizeof(path), "%s\\NMSCourier\\diagnostics\\native-signal-180836-%lu.txt",
             root, (unsigned long)GetCurrentProcessId());
    FILE *file = fopen(path, "w");
    if (!file) return 0;
    fprintf(file, "%s\r\n", tag);
    fclose(file);
    for (int waited = 0; waited < 40; ++waited) {
        Sleep(100);
        if (GetFileAttributesA(path) == INVALID_FILE_ATTRIBUTES) { Sleep(900); return 1; }
    }
    return 0;
}
static int stat_matches(LONG first, const unsigned char *item, int item_class) {
    static const uint32_t offsets[3] = {0x980, 0xe10, 0xbc8}, types[3] = {7, 5, 9};
    for (int index = 0; index < 3; ++index) {
        const stat_call *call = &stat_calls[first + index];
        if (call->store != item + offsets[index] || call->inventory_type != types[index] ||
            call->seed != item + 0x10 || call->item_class != item_class || call->argument_5 != 0 ||
            call->argument_6 != 10 || call->minimum_values != 0) return 0;
    }
    return 1;
}

int main(void) {
    HMODULE proxy = LoadLibraryW(L"xinput9_1_0.dll");
    if (!proxy) return 2;
    typedef DWORD (WINAPI *get_state_fn)(DWORD, XINPUT_STATE *);
    typedef LONG (*snapshot_fn)(LONG values[6]);
    get_state_fn get_state = (get_state_fn)(void *)GetProcAddress(proxy, "XInputGetState");
    snapshot_fn snapshot = (snapshot_fn)(void *)GetProcAddress(proxy, "CourierFreighterClassSnapshot");
    if (!get_state || !snapshot) return 3;
    unsigned char *item = VirtualAlloc(NULL, 0x2000, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
    reward_item = VirtualAlloc(NULL, 0x2000, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
    if (!item || !reward_item) return 4;
    XINPUT_STATE state = {0};
    get_state(0, &state);
    Sleep(1000);
    LONG values[6];
    uintptr_t expected = (uintptr_t)item + 7*3 + 10*1 + 11*0x2d;
    // Unarmed: the hook is not even enabled and nothing is written.
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d) != expected ||
        stat_count != 0 || !classes(item, 0) || snapshot(values) != -1 || values[0] != 0) return 5;

    char root[MAX_PATH], path[MAX_PATH], line[512], base[128] = {0};
    if (!GetEnvironmentVariableA("LOCALAPPDATA", root, MAX_PATH)) return 6;
    snprintf(path, sizeof(path), "%s\\NMSCourier\\diagnostics\\native-profile-180836-%lu.log",
             root, (unsigned long)GetCurrentProcessId());
    FILE *log = fopen(path, "r");
    if (!log) return 7;
    while (fgets(line, sizeof(line), log)) if (sscanf(line, "event_base=%127s", base) == 1) break;
    fclose(log);
    if (!base[0] || !signal_event(base, "s")) return 8;

    // Armed for S: a non-freighter setup neither applies nor consumes the request.
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0x2d) != expected - 21 ||
        stat_count != 0 || snapshot(values) != 3 || values[0] != 1 || values[1] != 0) return 9;
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d) != expected ||
        stat_count != 3 || !classes(item, 3) || !stat_matches(0, item, 3) ||
        snapshot(values) != -1 || values[2] != 1 || values[3] != 3) return 10;
    // One request applies once: the next freighter setup is left native (class 0).
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d) != expected ||
        stat_count != 3 || !classes(item, 0) || snapshot(values) != -1 || values[2] != 1) return 11;

    // Class B plus the one-shot test dispatch on the update callback.
    if (!signal_event(base, "b") || !signal_event(base, "dispatch")) return 12;
    for (int index = 0; index < 5; ++index) CourierTestUpdate(NULL);
    if (reward_calls != 1 || strcmp(last_reward_id, "RS_S13_S4M6") != 0 || last_reward_scalars != 0x2d ||
        stat_count != 6 || !classes(reward_item, 1) || !stat_matches(3, reward_item, 1) ||
        snapshot(values) != -1 || values[2] != 2 || values[4] != 3) return 13;
    if (update_calls != 5) return 15;

    // An unwritable item pointer is rejected without calling the generator.
    // This request arrives by file, as the application sends it.
    if (!signal_file("a")) return 16;
    CourierTestPurchaseSetup(0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    if (stat_count != 6 || snapshot(values) != -1 || values[5] != 1) return 17;
    // Layout arguments were native in every setup so far (slots never armed).
    for (LONG index = 0; index < layout_count; ++index)
        if (layout_calls[index].use_slot_count != 0 ||
            layout_calls[index].slot_count != (layout_calls[index].inventory_type == 9 ? 4u : 18u)) return 21;
    typedef LONG (*slots_snapshot_fn)(LONG values[3]);
    slots_snapshot_fn slots_snapshot = (slots_snapshot_fn)(void *)GetProcAddress(proxy, "CourierFreighterSlotsSnapshot");
    LONG slot_values[3];
    if (!slots_snapshot || !signal_event(base, "slots") || slots_snapshot(slot_values) != -1 || slot_values[0] != 1) return 22;
    // Armed slots: a non-freighter setup and a direct layout call stay native and do not consume it.
    LONG before = layout_count;
    CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0x2d);
    CourierTestLayoutInitializer((uintptr_t)item + 0x980, 7, 18, 0, 0, 0x1c, 0, 2, 0);
    if (layout_count != before + 1 || layout_calls[before].slot_count != 18 || slots_snapshot(slot_values) != -1 ||
        slot_values[0] != 1 || slot_values[2] != 0) return 23;
    before = layout_count;
    CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    if (layout_count != before + 3 ||
        layout_calls[before].store != (uintptr_t)item + 0x980 || layout_calls[before].slot_count != 120 ||
        layout_calls[before].use_slot_count != 1 || layout_calls[before + 1].slot_count != 60 ||
        layout_calls[before + 1].use_slot_count != 1 || layout_calls[before + 2].slot_count != 4 ||
        layout_calls[before + 2].use_slot_count != 0 || slots_snapshot(slot_values) != 120 ||
        slot_values[0] != 0 || slot_values[1] != 1 || slot_values[2] != 2) return 24;
    // One request applies once.
    before = layout_count;
    CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    if (layout_calls[before].slot_count != 18 || layout_calls[before].use_slot_count != 0 ||
        slots_snapshot(slot_values) != 120 || slot_values[2] != 2) return 25;
    // Supercharge every valid technology slot, optionally with the extended row request.
    typedef LONG (*special_snapshot_fn)(LONG values[3]);
    special_snapshot_fn special_snapshot = (special_snapshot_fn)(void *)GetProcAddress(proxy, "CourierFreighterSpecialSnapshot");
    LONG special_values[3];
    unsigned char *owned = VirtualAlloc(NULL, 0x2000, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
    if (!special_snapshot || !owned || !signal_event(base, "techrows") || !signal_event(base, "super")) return 26;
    memset(item, 0, 0x1070);
    memcpy(item + 0x10, "seed-of-the-offer", 16);
    before = layout_count;
    CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    test_vector *vector = (test_vector *)(item + 0xe10 + 0xc0);
    if (layout_calls[before].slot_count != 120 || layout_calls[before + 1].slot_count != 120 ||
        special_snapshot(special_values) != 1 || special_values[0] != 120 || special_values[1] != 0 ||
        vector->count != 120 || grow_calls != 120 || grow_bad != 0 || vector->data[0].type != 4 ||
        vector->data[119].x != 9 || vector->data[119].y != 11) return 27;
    // A call from anywhere but the acceptance stand-in, or after the offer's seed changed, copies nothing.
    unsigned char other_seed[16] = "another-seed-xx";
    CourierTestSpecialGenerator(owned, 8, item + 0x10);
    item[0x10] ^= 1;
    CourierTestAccept(owned, other_seed);
    item[0x10] ^= 1;
    if (copy_calls != 0 || special_snapshot(special_values) != 1) return 28;
    // The seed argument of the acceptance call itself is not required to match.
    CourierTestAccept(owned, other_seed);
    if (copy_calls != 1 || copy_destination != owned || copy_source != item + 0xe10 ||
        special_snapshot(special_values) != 0 || special_values[2] != 1) return 29;
    CourierTestAccept(owned, item + 0x10);
    if (copy_calls != 1) return 30;
    printf("super_all_valid=1 grow_arguments=1 carry_scope=1 carry_once=1\n");
    // Model request: scene, model seed and home seed from the per-process request file.
    typedef LONG (*model_snapshot_fn)(LONG values[4]);
    model_snapshot_fn model_snapshot = (model_snapshot_fn)(void *)GetProcAddress(proxy, "CourierFreighterModelSnapshot");
    LONG model_values[4];
    char request_path[MAX_PATH];
    snprintf(request_path, sizeof(request_path), "%s\\NMSCourier\\diagnostics\\native-freighter-request-180836-%lu.txt",
             root, (unsigned long)GetCurrentProcessId());
    static const struct { const char *text; int accepted; } requests[] = {
        {"scene=models/lowercase.SCENE.MBIN\n", 0}, {"scene=MODELS/A/../B.SCENE.MBINX\n", 0},
        {"model_seed=0x12345678901234567\n", 0}, {"unknown=1\n", 0},
        {"scene=MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN\n"
         "model_seed=0x8C968767B3282F13\nhome_seed=0x175000B001FFD\n", 1}};
    uint64_t native_seed[2] = {0x1111, 1}, system_seed[2] = {0x2222, 1};
    if (!model_snapshot) return 31;
    for (unsigned index = 0; index < sizeof(requests) / sizeof(requests[0]); ++index) {
        FILE *request = fopen(request_path, "w");
        if (!request) return 32;
        fputs(requests[index].text, request);
        fclose(request);
        if (!signal_event(base, "model") || model_snapshot(model_values) != requests[index].accepted ||
            model_values[3] != (LONG)(requests[index].accepted ? 4 : index + 1)) return 33;
    }
    remove(request_path);
    // A non-freighter setup keeps its arguments and the request; the freighter setup consumes it.
    CourierTestPurchaseSetup((uintptr_t)item, (uintptr_t)native_seed, (uintptr_t)"NATIVE.SCENE.MBIN", 0, 0, 0, 0, 0, 0, 1, 0x2d);
    if (setup_seed != 0x1111 || strcmp(setup_scene, "NATIVE.SCENE.MBIN") != 0 || model_snapshot(model_values) != 1) return 34;
    CourierTestPurchaseSetup((uintptr_t)item, (uintptr_t)native_seed, (uintptr_t)"NATIVE.SCENE.MBIN", 0, 0, 0, 3, 0, 0, 1, 0x2d);
    if (setup_seed != 0x8C968767B3282F13ull ||
        strcmp(setup_scene, "MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN") != 0 ||
        model_snapshot(model_values) != 0 || model_values[0] != 1 || model_values[2] != 1) return 35;
    CourierTestOtherHome(owned, system_seed);
    if (home_value != 0x2222 || model_snapshot(model_values) != 0 || model_values[2] != 1) return 36;
    CourierTestAcceptHome(owned, system_seed);
    if (home_value != 0x175000B001FFDull || home_owner != owned || model_snapshot(model_values) != 0 ||
        model_values[1] != 1 || model_values[2] != 0) return 37;
    CourierTestAcceptHome(owned, system_seed);
    if (home_value != 0x2222) return 38;
    // After a returned dispatch another one may be requested explicitly.
    if (!signal_event(base, "dispatch")) return 39;
    for (int index = 0; index < 3; ++index) CourierTestUpdate(NULL);
    if (reward_calls != 2) return 40;
    printf("request_validation=1 model_arguments=1 home_seed_scope=1 home_once=1 repeat_dispatch=1\n");
    printf("pre_arm_excluded=1 kind_filter=1 one_shot_class=1 stat_arguments=1 dispatch_scope=1 bad_item_rejected=1\n");
    printf("slots_scope=1 slots_one_shot=1 main_120=1 technology_60=1 third_store_native=1\n");

    Sleep(9000);
    log = fopen(path, "r");
    if (!log) return 18;
    int completed = 0;
    while (fgets(line, sizeof(line), log)) if (strncmp(line, "status=window_complete", 22) == 0) completed = 1;
    fclose(log);
    if (!completed) return 19;
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d) != expected ||
        stat_count != 6 || setup_calls < 12) return 20;
    printf("timed_hook_removal_verified=1 original_function_available=1\n");
    return 0;
}
