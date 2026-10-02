// Observation only: no inventory layouts, commands, rewards, or save access.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <bcrypt.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>
#include "MinHook.h"

#if !defined(COURIER_OBSERVE_180383) || defined(COURIER_TEST_DELIVER_CARBON) || defined(COURIER_TEST_CURRENCY_REWARDS) || defined(COURIER_TEST_FREIGHTER_OFFER) || defined(COURIER_TEST_SCOPED_FREIGHTER)
#error Observer must be built independently of delivery adapters
#endif

// Pinned public Update signature matched uniquely in the exact-hash PE.
// Public mangled name: ?Update@cGcApplication@@QEAAXXZ (void method, no arguments).
typedef void (WINAPI *update_fn)(void *application);
static update_fn original_update;
static volatile LONG count;
static volatile LONG callback_thread;
#ifdef COURIER_CLASS_OBSERVER_180383
static wchar_t class_start_event_name[128];
int courier_class_observer_start(void);
void courier_class_observer_status(void);
void courier_class_observer_stop(void);
#endif

static void WINAPI observe_update(void *application) {
    InterlockedIncrement(&count);
    InterlockedExchange(&callback_thread, (LONG)GetCurrentThreadId());
    original_update(application);
}

static void write_status(const char *status, MH_STATUS result) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH) return;
    int size = swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-observer-180383-%lu.log", root, (unsigned long)GetCurrentProcessId());
    if (size < 0 || size >= MAX_PATH) return;
    // The startup verifier already created this diagnostics directory.
    HANDLE file = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) return;
    char text[512];
#ifdef COURIER_CLASS_OBSERVER_180383
    size = snprintf(text, sizeof(text), "status=%s\npid=%lu\nhook_status=%d\ncallback_count=%ld\ncallback_thread=%ld\nmode=observation_only\nclass_start_event=%ls\n", status, (unsigned long)GetCurrentProcessId(), result, (long)InterlockedCompareExchange(&count, 0, 0), (long)InterlockedCompareExchange(&callback_thread, 0, 0), class_start_event_name);
#else
    size = snprintf(text, sizeof(text), "status=%s\npid=%lu\nhook_status=%d\ncallback_count=%ld\ncallback_thread=%ld\nmode=observation_only\n", status, (unsigned long)GetCurrentProcessId(), result, (long)InterlockedCompareExchange(&count, 0, 0), (long)InterlockedCompareExchange(&callback_thread, 0, 0));
#endif
    if (size > 0 && size < (int)sizeof(text)) {
        DWORD written;
        WriteFile(file, text, (DWORD)size, &written, NULL);
    }
    CloseHandle(file);
}

void courier_probe_after_verified(void) {
    void *target;
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    target = (void *)GetProcAddress(GetModuleHandleW(NULL), "CourierTestUpdate");
#else
    static const unsigned char expected[16] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0xe8, 0xa5,
        0x47, 0x92, 0x02, 0x48, 0x89, 0x05, 0x6e, 0xbd
    };
    target = (void *)((uintptr_t)GetModuleHandleW(NULL) + 0x2d7530u);
    if (memcmp(target, expected, sizeof(expected)) != 0) {
        write_status("update_prologue_mismatch", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
#endif
    if (!target) { write_status("update_target_unavailable", MH_ERROR_UNSUPPORTED_FUNCTION); return; }
    MH_STATUS result = MH_Initialize();
    if (result != MH_OK) { write_status("hook_initialize_failed", result); return; }
    result = MH_CreateHook(target, (void *)observe_update, (void **)&original_update);
    if (result != MH_OK) { write_status("hook_create_failed", result); return; }
    result = MH_EnableHook(target);
    if (result != MH_OK) { write_status("hook_enable_failed", result); return; }
    write_status("observing", MH_OK);
#ifdef COURIER_CLASS_OBSERVER_180383
#if !defined(COURIER_NATIVE_CALLBACK_FIXTURE) || defined(COURIER_CLASS_ARM_FIXTURE)
    unsigned long random[4];
    if (BCryptGenRandom(NULL, (PUCHAR)random, sizeof(random), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0) {
        MH_DisableHook(target);
        write_status("class_event_random_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    int name_size = swprintf(class_start_event_name, 128,
        L"Local\\NMSCourier-ClassObserver-%lu-%08lx%08lx%08lx%08lx",
        (unsigned long)GetCurrentProcessId(), random[0], random[1], random[2], random[3]);
    if (name_size < 0 || name_size >= 128) {
        MH_DisableHook(target);
        write_status("class_event_name_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    HANDLE start_event = CreateEventW(NULL, TRUE, FALSE, class_start_event_name);
    DWORD event_error = GetLastError();
    if (!start_event || event_error == ERROR_ALREADY_EXISTS) {
        if (start_event) CloseHandle(start_event);
        MH_DisableHook(target);
        write_status("class_event_create_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    DWORD wait_result = WAIT_TIMEOUT;
    write_status("awaiting_class_start", MH_OK);
    for (unsigned seconds = 0; seconds < 1800; seconds += 2) {
        wait_result = WaitForSingleObject(start_event, 2000);
        if (wait_result != WAIT_TIMEOUT) break;
        write_status("awaiting_class_start", MH_OK);
    }
    CloseHandle(start_event);
    if (wait_result != WAIT_OBJECT_0) {
        MH_DisableHook(target);
        write_status(wait_result == WAIT_TIMEOUT ? "class_arm_expired" : "class_arm_wait_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
#endif
    if (!courier_class_observer_start()) {
        MH_DisableHook(target);
        write_status("class_observer_start_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    const unsigned duration = 600;
#else
    const unsigned duration = 180;
#endif
    for (unsigned seconds = 0; seconds < duration; seconds += 2) {
        Sleep(2000);
        write_status("observing", MH_OK);
#ifdef COURIER_CLASS_OBSERVER_180383
        courier_class_observer_status();
#endif
    }
#ifdef COURIER_CLASS_OBSERVER_180383
    courier_class_observer_stop();
#endif
    result = MH_DisableHook(target);
    write_status(result == MH_OK ? "observation_complete" : "hook_disable_failed", result);
}
