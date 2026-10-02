#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static volatile LONG original_calls;
static volatile LONG update_calls;
__declspec(dllexport) __declspec(noinline) void WINAPI CourierTestUpdate(void *application) {
    (void)application;
    InterlockedIncrement(&update_calls);
}
__declspec(dllexport) __declspec(noinline) uint64_t WINAPI CourierTestRewardDispatch(
    uint64_t a, uint64_t b, uint64_t c, uint64_t d, uint64_t e,
    uint64_t f, uint64_t g, uint64_t h, uint64_t i, uint64_t j) {
    InterlockedIncrement(&original_calls);
    return a + 2*b + 3*c + 4*d + 5*e + 6*f + 7*g + 8*h + 9*i + 10*j;
}

int main(void) {
    HMODULE proxy = LoadLibraryW(L"xinput9_1_0.dll");
    if (!proxy) return 2;
    typedef DWORD(WINAPI *get_state_fn)(DWORD, XINPUT_STATE *);
    typedef LONG (*snapshot_fn)(uint64_t arguments[10]);
    get_state_fn get_state = (get_state_fn)GetProcAddress(proxy, "XInputGetState");
    snapshot_fn snapshot = (snapshot_fn)GetProcAddress(proxy, "CourierRewardObserverSnapshot");
    if (!get_state || !snapshot) return 3;
    XINPUT_STATE state = {0};
    get_state(0, &state);
    Sleep(1000);
    uint64_t args[10] = {0x123456789abcdef0ULL, 0x9876543210abcdefULL,
        0x876543210fedcba9ULL, 0xfedcba9876543210ULL,
        0x1111111100000001ULL, 0x2222222200000002ULL,
        0x3333333300000003ULL, 0x4444444400000004ULL,
        0x5555555500000005ULL, 0x6666666600000006ULL};
    uint64_t expected = 0;
    for (unsigned index = 0; index < 10; ++index) expected += (index+1)*args[index];
    for (unsigned index = 0; index < 10; ++index)
        if (CourierTestRewardDispatch(args[0],args[1],args[2],args[3],args[4],
            args[5],args[6],args[7],args[8],args[9]) != expected) return 4;
    if (snapshot(args) != 0) return 5;
    char root[MAX_PATH], path[MAX_PATH], line[512], event_name[128] = {0};
    if (!GetEnvironmentVariableA("LOCALAPPDATA", root, MAX_PATH)) return 6;
    if (snprintf(path, sizeof(path), "%s\\NMSCourier\\diagnostics\\native-observer-180383-%lu.log",
        root, (unsigned long)GetCurrentProcessId()) >= (int)sizeof(path)) return 7;
    FILE *log = fopen(path, "r");
    if (!log) return 8;
    while (fgets(line, sizeof(line), log))
        if (sscanf(line, "reward_start_event=%127s", event_name) == 1) break;
    fclose(log);
    HANDLE start_event = OpenEventA(EVENT_MODIFY_STATE, FALSE, event_name);
    if (!start_event) return 9;
    if (!SetEvent(start_event)) { CloseHandle(start_event); return 10; }
    CloseHandle(start_event);
    Sleep(500);
    for (unsigned index = 0; index < 600; ++index) {
        if (CourierTestRewardDispatch(args[0],args[1],args[2],args[3],args[4],
            args[5],args[6],args[7],args[8],args[9]) != expected) return 11;
        CourierTestUpdate(NULL);
    }
    if (snapshot(args) != 512 || original_calls != 610 || update_calls != 600) return 12;
    args[9] ^= 1;
    if (snapshot(args) != -2) return 13;
    printf("all_ten_arguments_verified=1 return_preserved=1 pre_signal_excluded=1 records=512 calls=%ld overflow_forwarded=1\n", (long)original_calls);
    Sleep(5000);
    log = fopen(path, "r");
    if (!log) return 14;
    int completed = 0;
    while (fgets(line, sizeof(line), log))
        if (strncmp(line, "status=observation_complete", 26) == 0) completed = 1;
    fclose(log);
    if (!completed) return 15;
    // Hook removal must retain the native function and its original return.
    args[9] ^= 1;
    if (CourierTestRewardDispatch(args[0],args[1],args[2],args[3],args[4],
        args[5],args[6],args[7],args[8],args[9]) != expected || original_calls != 611) return 16;
    printf("timed_hook_removal_verified=1 original_function_available=1\n");
    return 0;
}
