// Research profile for build 180836: request-scoped freighter offer class.
// After the native purchase setup returns for item kind 3, an explicitly armed
// request stores the requested class in the three temporary offer inventories
// and regenerates their base stats with the game's own generator. Nothing is
// written unless a class event was signaled; one armed request applies once.
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
#define FREIGHTER_BLOCK_RVA 0x8e684du
#define FREIGHTER_ITEM_KIND 3
#define ITEM_SEED_OFFSET 0x10u
#define STORE_CLASS_OFFSET 0x100u
#define ITEM_READ_SPAN 0x1070u
#define CLASS_COUNT 4
#define EVENT_COUNT (CLASS_COUNT + 1)
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
#define ARM_WINDOW_SECONDS 6u
#else
#define ARM_WINDOW_SECONDS 1800u
#endif
// Shipped specific-ship freighter reward; its table entry declares class B.
#define TEST_REWARD_ID "RS_S13_S4M6"

typedef void (WINAPI *update_fn)(void *application);
typedef uintptr_t (*setup_fn)(uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t,
                              uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t);
typedef void (*stat_generator_fn)(void *store, uint32_t inventory_type, void *seed, int32_t item_class,
                                  uint32_t argument_5, uint32_t argument_6, uint64_t argument_7,
                                  uint8_t minimum_values);
typedef uint8_t (*give_reward_fn)(void *manager, const char *reward_id, const char *mission_id,
                                  const void *seed, uint8_t peek, uint8_t force_show_message,
                                  uint64_t *out_multi_product_count, uint8_t force_silent,
                                  int32_t inventory_choice_override, uint8_t use_mining_modifier);

// Store offsets and inventory-type arguments exactly as the native freighter branch passes them.
static const struct { uint32_t offset; uint32_t inventory_type; } stores[3] = {
    {0x980u, 7u}, {0xe10u, 5u}, {0xbc8u, 9u}
};

static update_fn original_update;
static setup_fn original_setup;
static stat_generator_fn stat_generator;
static give_reward_fn give_reward;
static void *reward_manager;
static void *update_target;
static void *setup_target;
static volatile LONG requested_class = -1;
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
    char text[1024];
#define READ(value) ((long)InterlockedCompareExchange(&(value), 0, 0))
    size = snprintf(text, sizeof(text),
        "status=%s\npid=%lu\nhook_status=%d\nmode=request_scoped_class_research\nevent_base=%ls\n"
        "requested_class=%ld\ndispatch_state=%ld\nsetup_calls=%ld\nfreighter_setups=%ld\nlast_kind=%ld\n"
        "applied_count=%ld\napplied_class=%ld\nrejected_item=%ld\n"
        "class_before=%ld,%ld,%ld\nclass_after=%ld,%ld,%ld\n",
        status, (unsigned long)GetCurrentProcessId(), result, event_base,
        READ(requested_class), READ(dispatch_state), READ(setup_calls), READ(freighter_setups), READ(last_kind),
        READ(applied_count), READ(applied_class), READ(rejected_item),
        READ(class_before[0]), READ(class_before[1]), READ(class_before[2]),
        READ(class_after[0]), READ(class_after[1]), READ(class_after[2]));
#undef READ
    if (size > 0 && size < (int)sizeof(text)) {
        DWORD written;
        WriteFile(file, text, (DWORD)size, &written, NULL);
    }
    CloseHandle(file);
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

static uintptr_t setup_detour(uintptr_t item, uintptr_t a2, uintptr_t a3, uintptr_t a4, uintptr_t a5,
                              uintptr_t a6, uintptr_t kind, uintptr_t a8, uintptr_t a9, uintptr_t a10,
                              uintptr_t a11) {
    uintptr_t result = original_setup(item, a2, a3, a4, a5, a6, kind, a8, a9, a10, a11);
    InterlockedIncrement(&setup_calls);
    InterlockedExchange(&last_kind, (LONG)(uint32_t)kind);
    if ((uint32_t)kind != FREIGHTER_ITEM_KIND) return result;
    InterlockedIncrement(&freighter_setups);
    LONG item_class = InterlockedCompareExchange(&requested_class, 0, 0);
    // Consume the armed request atomically so a second setup never reuses it.
    if (item_class >= 0 && item_class < CLASS_COUNT &&
        InterlockedCompareExchange(&requested_class, -1, item_class) == item_class)
        apply_class(item, (int32_t)item_class);
    return result;
}

static void WINAPI update_detour(void *application) {
    if (InterlockedCompareExchange(&dispatch_state, 2, 1) == 1) {
        char reward_id[16] = {0}, mission_id[16] = {0};
        unsigned char seed[16] = {0};
        uint64_t multi_product_count = 0;
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
    stat_generator = (stat_generator_fn)(void *)GetProcAddress(host, "CourierTestStatGenerator");
    give_reward = (give_reward_fn)(void *)GetProcAddress(host, "CourierTestGiveReward");
    reward_manager = (void *)GetProcAddress(host, "CourierTestRewardManager");
    return update_target && setup_target && stat_generator && give_reward && reward_manager;
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
    stat_generator = (stat_generator_fn)(base + STAT_GENERATOR_RVA);
    give_reward = (give_reward_fn)(base + GIVE_REWARD_RVA);
    reward_manager = (void *)(base + REWARD_MANAGER_RVA);
    return memcmp(update_target, update_entry, sizeof(update_entry)) == 0 &&
           memcmp((void *)(base + GIVE_REWARD_RVA), reward_entry, sizeof(reward_entry)) == 0 &&
           memcmp(setup_target, setup_entry, sizeof(setup_entry)) == 0 &&
           memcmp((void *)(base + STAT_GENERATOR_RVA), statgen_entry, sizeof(statgen_entry)) == 0 &&
           memcmp((void *)(base + FREIGHTER_BLOCK_RVA), freighter_block, sizeof(freighter_block)) == 0 &&
           writable_range((uintptr_t)reward_manager, 1);
#endif
}

void courier_probe_after_verified(void) {
    static const wchar_t *const tags[EVENT_COUNT] = {L"c", L"b", L"a", L"s", L"dispatch"};
    HANDLE events[EVENT_COUNT] = {0};
    if (!resolve_targets()) { write_status("target_verification_failed", MH_ERROR_UNSUPPORTED_FUNCTION); return; }
    MH_STATUS result = MH_Initialize();
    if (result != MH_OK) { write_status("hook_initialize_failed", result); return; }
    result = MH_CreateHook(update_target, (void *)update_detour, (void **)&original_update);
    if (result == MH_OK) result = MH_CreateHook(setup_target, (void *)setup_detour, (void **)&original_setup);
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
        if (signaled == WAIT_TIMEOUT) { waited += 2; write_status(hooks_enabled ? "armed" : "awaiting_request", MH_OK); continue; }
        if (signaled >= WAIT_OBJECT_0 + EVENT_COUNT) { write_status("event_wait_failed", MH_ERROR_UNSUPPORTED_FUNCTION); break; }
        unsigned index = signaled - WAIT_OBJECT_0;
        ResetEvent(events[index]);
        if (!hooks_enabled) {
            result = MH_EnableHook(setup_target);
            if (result == MH_OK) result = MH_EnableHook(update_target);
            if (result != MH_OK) { write_status("hook_enable_failed", result); break; }
            hooks_enabled = 1;
        }
        if (index < CLASS_COUNT) InterlockedExchange(&requested_class, (LONG)index);
        // A consumed or uncertain dispatch is never requested again in this process.
        else InterlockedCompareExchange(&dispatch_state, 1, 0);
        write_status("armed", MH_OK);
    }
    InterlockedExchange(&requested_class, -1);
    for (unsigned index = 0; index < EVENT_COUNT; ++index) CloseHandle(events[index]);
    if (hooks_enabled) {
        MH_STATUS first = MH_DisableHook(setup_target), second = MH_DisableHook(update_target);
        result = first != MH_OK ? first : second;
    }
    write_status(result == MH_OK ? "window_complete" : "hook_disable_failed", result);
}

#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
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
