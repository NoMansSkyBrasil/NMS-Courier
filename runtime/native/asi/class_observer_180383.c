// Exact-build argument observation; no game data is read or modified.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>
#include "MinHook.h"

#if !defined(COURIER_OBSERVE_180383) || !defined(COURIER_CLASS_OBSERVER_180383)
#error Class observer requires the independently verified current-build profile
#endif

volatile LONG courier_class_counts_180383[5];
void *courier_original_class_generator_180383;
void courier_observe_class_argument(void);
static void *class_target;
static MH_STATUS class_status;
static const char *class_state = "uninitialized";

void courier_class_observer_status(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH) return;
    int size = swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-class-observer-180383-%lu.log", root, (unsigned long)GetCurrentProcessId());
    if (size < 0 || size >= MAX_PATH) return;
    HANDLE file = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) return;
    char text[512];
    size = snprintf(text, sizeof(text), "status=%s\npid=%lu\nhook_status=%d\nargument_0=%ld\nargument_1=%ld\nargument_2=%ld\nargument_3=%ld\nargument_other=%ld\nmode=argument_observation_only\n", class_state, (unsigned long)GetCurrentProcessId(), class_status,
        (long)InterlockedCompareExchange(&courier_class_counts_180383[0], 0, 0),
        (long)InterlockedCompareExchange(&courier_class_counts_180383[1], 0, 0),
        (long)InterlockedCompareExchange(&courier_class_counts_180383[2], 0, 0),
        (long)InterlockedCompareExchange(&courier_class_counts_180383[3], 0, 0),
        (long)InterlockedCompareExchange(&courier_class_counts_180383[4], 0, 0));
    if (size > 0 && size < (int)sizeof(text)) {
        DWORD written;
        WriteFile(file, text, (DWORD)size, &written, NULL);
    }
    CloseHandle(file);
}

int courier_class_observer_start(void) {
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    class_target = (void *)GetProcAddress(GetModuleHandleW(NULL), "CourierTestClassGenerator");
#else
    static const unsigned char expected[32] = {
        0x48,0x89,0x5c,0x24,0x10,0x48,0x89,0x6c,
        0x24,0x20,0x56,0x57,0x41,0x56,0x48,0x81,
        0xec,0xa0,0x00,0x00,0x00,0x48,0x8b,0xf1,
        0x49,0x63,0xe9,0x48,0x8d,0x8c,0x24,0xd0
    };
    class_target = (void *)((uintptr_t)GetModuleHandleW(NULL) + 0x4cea20u);
    if (memcmp(class_target, expected, sizeof(expected)) != 0) {
        class_state = "class_prologue_mismatch";
        class_status = MH_ERROR_UNSUPPORTED_FUNCTION;
        courier_class_observer_status();
        return 0;
    }
#endif
    if (!class_target) {
        class_state = "class_target_unavailable";
        class_status = MH_ERROR_UNSUPPORTED_FUNCTION;
        courier_class_observer_status();
        return 0;
    }
    class_status = MH_CreateHook(class_target, (void *)courier_observe_class_argument, &courier_original_class_generator_180383);
    if (class_status == MH_OK) class_status = MH_EnableHook(class_target);
    class_state = class_status == MH_OK ? "observing" : "class_hook_failed";
    courier_class_observer_status();
    return class_status == MH_OK;
}

void courier_class_observer_stop(void) {
    class_status = MH_DisableHook(class_target);
    class_state = class_status == MH_OK ? "observation_complete" : "class_hook_disable_failed";
    courier_class_observer_status();
}

#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
__declspec(dllexport) void CourierClassObserverSnapshot(LONG counts[5]) {
    for (unsigned index = 0; index < 5; ++index)
        counts[index] = InterlockedCompareExchange(&courier_class_counts_180383[index], 0, 0);
}
#endif
