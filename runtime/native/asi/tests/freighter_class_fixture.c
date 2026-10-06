// Isolated host for the build 180836 freighter class profile. Never a game test.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#define ITEM_SPAN 0x1070u
typedef struct {
    void *store; uint32_t inventory_type; void *seed; int32_t item_class;
    uint32_t argument_5, argument_6; uint8_t minimum_values;
} stat_call;
static stat_call stat_calls[16];
static volatile LONG stat_count, update_calls, setup_calls, reward_calls;
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
__declspec(dllexport) __declspec(noinline) uintptr_t CourierTestPurchaseSetup(
    uintptr_t item, uintptr_t a2, uintptr_t a3, uintptr_t a4, uintptr_t a5, uintptr_t a6,
    uintptr_t kind, uintptr_t a8, uintptr_t a9, uintptr_t a10, uintptr_t a11) {
    InterlockedIncrement(&setup_calls);
    // Like the native layout initializer, setup itself leaves class 0 in every store.
    if (item && (uint32_t)kind == 3) {
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
    Sleep(400);
    return ok != 0;
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
    snprintf(path, sizeof(path), "%s\\NMSCourier\\diagnostics\\native-freighter-class-180836-%lu.log",
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
    if (!signal_event(base, "dispatch")) return 14;
    for (int index = 0; index < 5; ++index) CourierTestUpdate(NULL);
    if (reward_calls != 1 || update_calls != 10) return 15;

    // An unwritable item pointer is rejected without calling the generator.
    if (!signal_event(base, "a")) return 16;
    CourierTestPurchaseSetup(0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d);
    if (stat_count != 6 || snapshot(values) != -1 || values[5] != 1) return 17;
    printf("pre_arm_excluded=1 kind_filter=1 one_shot_class=1 stat_arguments=1 dispatch_once=1 bad_item_rejected=1\n");

    Sleep(9000);
    log = fopen(path, "r");
    if (!log) return 18;
    int completed = 0;
    while (fgets(line, sizeof(line), log)) if (strncmp(line, "status=window_complete", 22) == 0) completed = 1;
    fclose(log);
    if (!completed) return 19;
    if (CourierTestPurchaseSetup((uintptr_t)item, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0x2d) != expected ||
        stat_count != 6 || setup_calls < 6) return 20;
    printf("timed_hook_removal_verified=1 original_function_available=1\n");
    return 0;
}
