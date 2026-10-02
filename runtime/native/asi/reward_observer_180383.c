// Record raw call arguments in DLL-owned storage; never dereference game objects.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <stdio.h>
#include <stddef.h>
#include <string.h>
#include <wchar.h>
#include "MinHook.h"

#if !defined(COURIER_OBSERVE_180383) || !defined(COURIER_REWARD_OBSERVER_180383)
#error Reward observer requires the exact current-build observation profile
#endif
#define REWARD_TRACE_CAPACITY 512
typedef struct {
    uintptr_t caller;
    uint64_t arguments[10];
    volatile LONG ready;
    LONG padding[9];
} reward_trace_record;
_Static_assert(sizeof(reward_trace_record) == 128, "Assembly stride mismatch");
_Static_assert(offsetof(reward_trace_record, ready) == 88, "Assembly publication mismatch");
reward_trace_record courier_reward_trace_180383[REWARD_TRACE_CAPACITY];
volatile LONG courier_reward_trace_next_180383;
void *courier_original_reward_dispatch_180383;
void courier_observe_reward_arguments(void);
static void *reward_target;
static MH_STATUS reward_status;
static const char *reward_state = "uninitialized";

void courier_reward_observer_status(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH) return;
    int size = swprintf(path, MAX_PATH,
        L"%ls\\NMSCourier\\diagnostics\\native-reward-contexts-180383-%lu.tsv",
        root, (unsigned long)GetCurrentProcessId());
    if (size < 0 || size >= MAX_PATH) return;
    FILE *file = _wfopen(path, L"w");
    if (!file) return;
    LONG attempted = InterlockedCompareExchange(&courier_reward_trace_next_180383, 0, 0);
    fprintf(file, "# status=%s hook_status=%d capacity=%d attempted=%ld dropped=%ld mode=raw_argument_observation_only image_base=0x%llx\n",
        reward_state, reward_status, REWARD_TRACE_CAPACITY, (long)attempted,
        (long)(attempted > REWARD_TRACE_CAPACITY ? attempted - REWARD_TRACE_CAPACITY : 0),
        (unsigned long long)(uintptr_t)GetModuleHandleW(NULL));
    fprintf(file, "sample\tcaller_address");
    for (unsigned index = 0; index < 10; ++index) fprintf(file, "\targument_%u", index);
    fprintf(file, "\n");
    for (unsigned index = 0; index < REWARD_TRACE_CAPACITY; ++index) {
        const reward_trace_record *record = &courier_reward_trace_180383[index];
        if (!InterlockedCompareExchange((volatile LONG *)&record->ready, 0, 0)) continue;
        fprintf(file, "%u\t0x%llx", index, (unsigned long long)record->caller);
        for (unsigned arg = 0; arg < 10; ++arg)
            fprintf(file, "\t0x%llx", (unsigned long long)record->arguments[arg]);
        fprintf(file, "\n");
    }
    fclose(file);
}

int courier_reward_observer_start(void) {
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    reward_target = (void *)GetProcAddress(GetModuleHandleW(NULL), "CourierTestRewardDispatch");
#else
    static const unsigned char expected[24] = {
        0x48,0x89,0x5c,0x24,0x08,0x48,0x89,0x6c,0x24,0x10,0x48,0x89,
        0x74,0x24,0x18,0x57,0x41,0x56,0x41,0x57,0x48,0x83,0xec,0x70
    };
    reward_target = (void *)((uintptr_t)GetModuleHandleW(NULL) + 0xf12240u);
    if (memcmp(reward_target, expected, sizeof(expected)) != 0) {
        reward_state = "reward_prologue_mismatch";
        reward_status = MH_ERROR_UNSUPPORTED_FUNCTION;
        courier_reward_observer_status();
        return 0;
    }
#endif
    if (!reward_target) {
        reward_state = "reward_target_unavailable";
        courier_reward_observer_status();
        return 0;
    }
    reward_status = MH_CreateHook(reward_target, (void *)courier_observe_reward_arguments,
        &courier_original_reward_dispatch_180383);
    if (reward_status == MH_OK) reward_status = MH_EnableHook(reward_target);
    reward_state = reward_status == MH_OK ? "observing" : "reward_hook_failed";
    courier_reward_observer_status();
    return reward_status == MH_OK;
}

void courier_reward_observer_stop(void) {
    reward_status = MH_DisableHook(reward_target);
    reward_state = reward_status == MH_OK ? "observation_complete" : "reward_hook_disable_failed";
    courier_reward_observer_status();
}

#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
__declspec(dllexport) LONG CourierRewardObserverSnapshot(uint64_t arguments[10]) {
    LONG count = 0;
    for (unsigned index = 0; index < REWARD_TRACE_CAPACITY; ++index) {
        const reward_trace_record *record = &courier_reward_trace_180383[index];
        if (!InterlockedCompareExchange((volatile LONG *)&record->ready, 0, 0)) continue;
        if (!record->caller) return -1;
        for (unsigned arg = 0; arg < 10; ++arg)
            if (record->arguments[arg] != arguments[arg]) return -2;
        ++count;
    }
    return count;
}
#endif
