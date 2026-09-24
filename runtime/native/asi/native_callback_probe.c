#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <bcrypt.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>

#include "MinHook.h"
#include "inventory_snapshot_179666.h"
#ifdef COURIER_TEST_DELIVER_CARBON
#include "carbon_delivery_179666.h"
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
#include "currency_reward_179666.h"
#endif
#ifdef COURIER_TEST_SCOPED_FREIGHTER
#include "scoped_freighter_reward_179666.h"
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
#include "freighter_offer_179666.h"
#endif

#define COURIER_UPDATE_RVA 0x2d7500u
#define COURIER_APPLICATION_DATA_POINTER_RVA 0x06e7aae8u
#if defined(COURIER_TEST_CURRENCY_REWARDS) || defined(COURIER_TEST_FREIGHTER_OFFER)
#define COURIER_OBSERVATION_SECONDS 600u
#else
#define COURIER_OBSERVATION_SECONDS 180u
#endif

typedef void(WINAPI *update_fn)(void *application);

static update_fn original_update = NULL;
static uintptr_t executable_base = 0;
static volatile LONG callback_count = 0;
static volatile LONG callback_thread = 0;
static volatile LONG inventory_ready = 0;
static volatile LONG inventory_width = 0;
static volatile LONG inventory_height = 0;
static volatile LONG inventory_capacity = 0;
static volatile LONG inventory_vector_size = 0;
static volatile LONG carbon_stacks = 0;
static volatile LONG carbon_quantity = 0;
#ifdef COURIER_TEST_DELIVER_CARBON
static volatile LONG delivery_state = 0;
static volatile LONG delivery_before = 0;
static volatile LONG delivery_after = 0;
static char trigger_event_name[128] = "unavailable";
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
static volatile LONG currency_pending = -1;
static volatile LONG currency_state[COURIER_CURRENCY_COUNT] = {0, 0, 0};
static char currency_event_names[COURIER_CURRENCY_COUNT][128];
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
static volatile LONG freighter_offer_state = 0;
static char freighter_offer_event_name[128] = "unavailable";
#endif

static void write_hook_status(const char *status, MH_STATUS hook_status) {
    wchar_t appdata[MAX_PATH];
    wchar_t base[MAX_PATH];
    wchar_t diagnostics[MAX_PATH];
    wchar_t path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", appdata, MAX_PATH);
    if (length == 0 || length >= MAX_PATH) return;
    int written = swprintf(base, MAX_PATH, L"%ls\\NMSCourier", appdata);
    if (written < 0 || written >= MAX_PATH) return;
    written = swprintf(diagnostics, MAX_PATH, L"%ls\\diagnostics", base);
    if (written < 0 || written >= MAX_PATH) return;
    CreateDirectoryW(base, NULL);
    CreateDirectoryW(diagnostics, NULL);
    written = swprintf(path, MAX_PATH, L"%ls\\native-hook-%lu.log", diagnostics,
                       (unsigned long)GetCurrentProcessId());
    if (written < 0 || written >= MAX_PATH) return;

    HANDLE log = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS,
                             FILE_ATTRIBUTE_NORMAL, NULL);
    if (log == INVALID_HANDLE_VALUE) return;
    char line[768];
    int size = snprintf(line, sizeof(line),
                        "status=%s\npid=%lu\ncallback_count=%ld\ncallback_thread=%ld\nhook_status=%d\n"
                        "inventory_ready=%ld\ninventory_width=%ld\ninventory_height=%ld\n"
                        "inventory_capacity=%ld\ninventory_vector_size=%ld\n"
                        "carbon_stacks=%ld\ncarbon_quantity=%ld\n"
#ifdef COURIER_TEST_DELIVER_CARBON
                        "delivery_state=%ld\ndelivery_before=%ld\ndelivery_after=%ld\n"
                        "trigger_event=%s\n"
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
                        "currency_units_state=%ld\ncurrency_nanites_state=%ld\n"
                        "currency_quicksilver_state=%ld\n"
                        "currency_units_event=%s\ncurrency_nanites_event=%s\n"
                        "currency_quicksilver_event=%s\n"
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
                        "freighter_offer_state=%ld\nfreighter_offer_event=%s\n"
#endif
                        ,
                        status, (unsigned long)GetCurrentProcessId(),
                        (long)InterlockedCompareExchange(&callback_count, 0, 0),
                        (long)InterlockedCompareExchange(&callback_thread, 0, 0), (int)hook_status,
                        (long)InterlockedCompareExchange(&inventory_ready, 0, 0),
                        (long)InterlockedCompareExchange(&inventory_width, 0, 0),
                        (long)InterlockedCompareExchange(&inventory_height, 0, 0),
                        (long)InterlockedCompareExchange(&inventory_capacity, 0, 0),
                        (long)InterlockedCompareExchange(&inventory_vector_size, 0, 0),
                        (long)InterlockedCompareExchange(&carbon_stacks, 0, 0),
                        (long)InterlockedCompareExchange(&carbon_quantity, 0, 0)
#ifdef COURIER_TEST_DELIVER_CARBON
                        , (long)InterlockedCompareExchange(&delivery_state, 0, 0),
                        (long)InterlockedCompareExchange(&delivery_before, 0, 0),
                        (long)InterlockedCompareExchange(&delivery_after, 0, 0),
                        trigger_event_name
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
                        , (long)InterlockedCompareExchange(&currency_state[0], 0, 0),
                        (long)InterlockedCompareExchange(&currency_state[1], 0, 0),
                        (long)InterlockedCompareExchange(&currency_state[2], 0, 0),
                        currency_event_names[0], currency_event_names[1],
                        currency_event_names[2]
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
                        , (long)InterlockedCompareExchange(&freighter_offer_state, 0, 0),
                        freighter_offer_event_name
#endif
                        );
    if (size > 0 && size < (int)sizeof(line)) {
        DWORD output = 0;
        WriteFile(log, line, (DWORD)size, &output, NULL);
    }
    CloseHandle(log);
}

static void WINAPI observe_update(void *application) {
    LONG count = InterlockedIncrement(&callback_count);
    InterlockedExchange(&callback_thread, (LONG)GetCurrentThreadId());
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    (void)count;
#endif
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    if (count % 120 == 0) {
        uintptr_t pointer_address = executable_base + COURIER_APPLICATION_DATA_POINTER_RVA;
        if (courier_readable_range((const void *)pointer_address, sizeof(uintptr_t))) {
            uintptr_t data = *(const uintptr_t *)pointer_address;
            courier_carbon_snapshot snapshot;
            if (courier_snapshot_carbon(data, &snapshot)) {
                InterlockedExchange(&inventory_width, snapshot.width);
                InterlockedExchange(&inventory_height, snapshot.height);
                InterlockedExchange(&inventory_capacity, snapshot.capacity);
                InterlockedExchange(&inventory_vector_size, (LONG)snapshot.vector_size);
                InterlockedExchange(&carbon_stacks, (LONG)snapshot.carbon_stacks);
                InterlockedExchange(&carbon_quantity, (LONG)snapshot.carbon_quantity);
                InterlockedExchange(&inventory_ready, 1);
            }
        }
    }
#endif
#ifdef COURIER_TEST_DELIVER_CARBON
    if (InterlockedCompareExchange(&delivery_state, 2, 1) == 1) {
        uintptr_t pointer_address = executable_base + COURIER_APPLICATION_DATA_POINTER_RVA;
        enum courier_delivery_result outcome = COURIER_DELIVERY_REJECTED;
        uint32_t before = 0;
        uint32_t after = 0;
        if (courier_readable_range((const void *)pointer_address, sizeof(uintptr_t))) {
            uintptr_t data = *(const uintptr_t *)pointer_address;
            outcome = courier_deliver_carbon_500(executable_base, data, &before, &after);
        }
        InterlockedExchange(&delivery_before, (LONG)before);
        InterlockedExchange(&delivery_after, (LONG)after);
        InterlockedExchange(&delivery_state, outcome == COURIER_DELIVERY_CONFIRMED
                                               ? 3
                                               : outcome == COURIER_DELIVERY_UNKNOWN ? 4 : 5);
    }
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
    LONG pending = InterlockedExchange(&currency_pending, -1);
    if (pending >= 0 && pending < COURIER_CURRENCY_COUNT &&
        InterlockedCompareExchange(&currency_state[pending], 2, 1) == 1) {
        int delivered = 0;
#ifdef COURIER_TEST_SCOPED_FREIGHTER
        if (pending == COURIER_CURRENCY_QUICKSILVER) {
            uintptr_t pointer_address = executable_base +
                                        COURIER_APPLICATION_DATA_POINTER_RVA;
            if (courier_readable_range((const void *)pointer_address,
                                       sizeof(uintptr_t))) {
                delivered = courier_dispatch_scoped_freighter_reward(
                    executable_base, *(const uintptr_t *)pointer_address);
            }
        }
#else
        delivered = courier_dispatch_currency_reward(
            executable_base, (enum courier_currency_reward)pending);
#endif
        if (!delivered) {
            InterlockedExchange(&currency_state[pending], 4);
        }
    }
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
    if (InterlockedCompareExchange(&freighter_offer_state, 2, 1) == 1) {
        if (!courier_dispatch_free_freighter_offer(executable_base))
            InterlockedExchange(&freighter_offer_state, 4);
    }
#endif
    original_update(application);
}

#ifdef COURIER_TEST_DELIVER_CARBON
static HANDLE create_delivery_event(void) {
    unsigned char nonce[16];
    if (BCryptGenRandom(NULL, nonce, sizeof(nonce), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0) {
        return NULL;
    }
    static const char hex[] = "0123456789abcdef";
    char token[33];
    for (size_t index = 0; index < sizeof(nonce); ++index) {
        token[index * 2] = hex[nonce[index] >> 4];
        token[index * 2 + 1] = hex[nonce[index] & 15];
    }
    token[32] = '\0';
    int length = snprintf(trigger_event_name, sizeof(trigger_event_name),
                          "Local\\NMSCourierCarbonTest-%lu-%s",
                          (unsigned long)GetCurrentProcessId(), token);
    if (length < 0 || length >= (int)sizeof(trigger_event_name)) return NULL;
    wchar_t event_name[128];
    length = swprintf(event_name, 128, L"Local\\NMSCourierCarbonTest-%lu-%hs",
                      (unsigned long)GetCurrentProcessId(), token);
    if (length < 0 || length >= 128) return NULL;
    HANDLE event = CreateEventW(NULL, FALSE, FALSE, event_name);
    if (!event) return NULL;
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        CloseHandle(event);
        return NULL;
    }
    return event;
}
#endif

#ifdef COURIER_TEST_FREIGHTER_OFFER
static HANDLE create_freighter_offer_event(void) {
    unsigned char nonce[16];
    if (BCryptGenRandom(NULL, nonce, sizeof(nonce),
                        BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0) return NULL;
    static const char hex[] = "0123456789abcdef";
    char token[33];
    for (size_t index = 0; index < sizeof(nonce); ++index) {
        token[index * 2] = hex[nonce[index] >> 4];
        token[index * 2 + 1] = hex[nonce[index] & 15];
    }
    token[32] = '\0';
    int length = snprintf(freighter_offer_event_name,
                          sizeof(freighter_offer_event_name),
                          "Local\\NMSCourierFreighterOfferTest-%lu-%s",
                          (unsigned long)GetCurrentProcessId(), token);
    if (length < 0 || length >= (int)sizeof(freighter_offer_event_name)) return NULL;
    wchar_t event_name[128];
    length = swprintf(event_name, 128, L"%hs", freighter_offer_event_name);
    if (length < 0 || length >= 128) return NULL;
    HANDLE event = CreateEventW(NULL, FALSE, FALSE, event_name);
    if (!event) return NULL;
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        CloseHandle(event);
        return NULL;
    }
    return event;
}
#endif

#ifdef COURIER_TEST_CURRENCY_REWARDS
static int create_currency_events(HANDLE events[COURIER_CURRENCY_COUNT]) {
    static const char *const names[COURIER_CURRENCY_COUNT] = {
        "Units", "Nanites", "Quicksilver"
    };
    unsigned char nonce[16];
    if (BCryptGenRandom(NULL, nonce, sizeof(nonce), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0)
        return 0;
    static const char hex[] = "0123456789abcdef";
    char token[33];
    for (size_t index = 0; index < sizeof(nonce); ++index) {
        token[index * 2] = hex[nonce[index] >> 4];
        token[index * 2 + 1] = hex[nonce[index] & 15];
    }
    token[32] = '\0';
    for (int index = 0; index < COURIER_CURRENCY_COUNT; ++index) {
        int length = snprintf(currency_event_names[index],
                              sizeof(currency_event_names[index]),
                              "Local\\NMSCourierCurrencyTest-%lu-%s-%s",
                              (unsigned long)GetCurrentProcessId(), token, names[index]);
        if (length < 0 || length >= (int)sizeof(currency_event_names[index])) return 0;
        wchar_t event_name[128];
        length = swprintf(event_name, 128, L"%hs", currency_event_names[index]);
        if (length < 0 || length >= 128) return 0;
        events[index] = CreateEventW(NULL, FALSE, FALSE, event_name);
        if (!events[index] || GetLastError() == ERROR_ALREADY_EXISTS) return 0;
    }
    return 1;
}
#endif

static void *resolve_target(void) {
    HMODULE executable = GetModuleHandleW(NULL);
    if (!executable) return NULL;
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    return (void *)GetProcAddress(executable, "CourierTestUpdate");
#else
    const unsigned char expected[] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0xe8, 0x75,
        0xca, 0x91, 0x02, 0x48, 0x89, 0x05, 0x7e, 0xd1
    };
    unsigned char *target = (unsigned char *)executable + COURIER_UPDATE_RVA;
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery(target, &memory, sizeof(memory)) != sizeof(memory)) return NULL;
    if (memory.State != MEM_COMMIT || (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS))) return NULL;
    if ((uintptr_t)target + sizeof(expected) >
        (uintptr_t)memory.BaseAddress + memory.RegionSize) return NULL;
    if (memcmp(target, expected, sizeof(expected)) != 0) return NULL;
    return target;
#endif
}

void courier_probe_after_verified(void) {
    executable_base = (uintptr_t)GetModuleHandleW(NULL);
    void *target = resolve_target();
    if (!target) {
        write_hook_status("target_rejected", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    MH_STATUS status = MH_Initialize();
    if (status != MH_OK) {
        write_hook_status("hook_initialize_failed", status);
        return;
    }
    status = MH_CreateHook(target, (void *)observe_update, (void **)&original_update);
    if (status != MH_OK) {
        write_hook_status("hook_create_failed", status);
        return;
    }
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    if (!resolve_target()) {
        write_hook_status("target_changed_before_enable", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
    HANDLE freighter_offer_event = NULL;
    if (!courier_currency_reward_target(executable_base) ||
        !(freighter_offer_event = create_freighter_offer_event())) {
        MH_DisableHook(target);
        write_hook_status("freighter_offer_target_or_event_failed",
                          MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
#endif
    status = MH_EnableHook(target);
    if (status != MH_OK) {
        write_hook_status("hook_enable_failed", status);
        return;
    }
#ifdef COURIER_TEST_DELIVER_CARBON
    HANDLE delivery_event = create_delivery_event();
    if (!delivery_event) {
        MH_DisableHook(target);
        write_hook_status("trigger_event_failed", MH_ERROR_MEMORY_ALLOC);
        return;
    }
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
    HANDLE currency_events[COURIER_CURRENCY_COUNT] = {NULL, NULL, NULL};
    if (!courier_currency_reward_target(executable_base) ||
        !create_currency_events(currency_events)) {
        for (int index = 0; index < COURIER_CURRENCY_COUNT; ++index)
            if (currency_events[index]) CloseHandle(currency_events[index]);
        MH_DisableHook(target);
        write_hook_status("currency_target_or_event_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
#endif
    write_hook_status("observing", MH_OK);
    for (unsigned elapsed = 0; elapsed < COURIER_OBSERVATION_SECONDS; elapsed += 2) {
        Sleep(2000);
#ifdef COURIER_TEST_DELIVER_CARBON
        if (WaitForSingleObject(delivery_event, 0) == WAIT_OBJECT_0 &&
            InterlockedCompareExchange(&delivery_state, 0, 0) == 0) {
            if (InterlockedCompareExchange(&inventory_ready, 0, 0) == 1 &&
                InterlockedCompareExchange(&carbon_stacks, 0, 0) > 0) {
                InterlockedCompareExchange(&delivery_state, 1, 0);
            } else {
                InterlockedCompareExchange(&delivery_state, 5, 0);
            }
        }
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
        for (int index = 0; index < COURIER_CURRENCY_COUNT; ++index) {
            if (WaitForSingleObject(currency_events[index], 0) == WAIT_OBJECT_0 &&
                InterlockedCompareExchange(&currency_state[index], 1, 0) == 0) {
                if (InterlockedCompareExchange(&inventory_ready, 0, 0) == 1 &&
                    InterlockedCompareExchange(&currency_pending, index, -1) == -1) {
                    continue;
                }
                InterlockedExchange(&currency_state[index], 4);
            }
        }
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
        if (WaitForSingleObject(freighter_offer_event, 0) == WAIT_OBJECT_0 &&
            InterlockedCompareExchange(&freighter_offer_state, 0, 0) == 0) {
            InterlockedExchange(&freighter_offer_state,
                                InterlockedCompareExchange(&inventory_ready, 0, 0) == 1
                                    ? 1 : 4);
        }
#endif
        write_hook_status("observing", MH_OK);
    }
    status = MH_DisableHook(target);
    write_hook_status(status == MH_OK ? "observation_complete" : "hook_disable_failed", status);
#ifdef COURIER_TEST_DELIVER_CARBON
    CloseHandle(delivery_event);
#endif
#ifdef COURIER_TEST_CURRENCY_REWARDS
    for (int index = 0; index < COURIER_CURRENCY_COUNT; ++index)
        CloseHandle(currency_events[index]);
#endif
#ifdef COURIER_TEST_FREIGHTER_OFFER
    CloseHandle(freighter_offer_event);
#endif
}
