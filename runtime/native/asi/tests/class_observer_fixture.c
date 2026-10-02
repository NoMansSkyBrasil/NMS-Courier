#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <stdint.h>
#include <stdio.h>

static volatile LONG original_calls;
static volatile LONG update_calls;

__declspec(dllexport) __declspec(noinline) void WINAPI CourierTestUpdate(void *application) {
    (void)application;
    InterlockedIncrement(&update_calls);
}

__declspec(dllexport) __declspec(noinline) uint64_t WINAPI CourierTestClassGenerator(
    uint64_t a, uint64_t b, uint64_t c, uint64_t selection,
    uint64_t e, uint64_t f, uint64_t g, uint64_t h) {
    InterlockedIncrement(&original_calls);
    return a + b + c + selection + e + f + g + h;
}

int main(void) {
    HMODULE proxy = LoadLibraryW(L"xinput9_1_0.dll");
    if (!proxy) return 2;
    typedef DWORD(WINAPI *get_state_fn)(DWORD, XINPUT_STATE *);
    typedef void (*snapshot_fn)(LONG counts[5]);
    get_state_fn get_state = (get_state_fn)GetProcAddress(proxy, "XInputGetState");
    snapshot_fn snapshot = (snapshot_fn)GetProcAddress(proxy, "CourierClassObserverSnapshot");
    if (!get_state || !snapshot) return 3;
    XINPUT_STATE state = {0};
    get_state(0, &state);
    Sleep(1000);
    static const uint64_t selections[5] = {0, 1, 2, 3, 99};
#ifdef COURIER_CLASS_ARM_FIXTURE
    for (unsigned index = 0; index < 400; ++index) {
        uint64_t selection = selections[index % 5];
        if (CourierTestClassGenerator(1, 2, 3, selection, 5, 6, 7, 8) != 32 + selection) return 7;
        CourierTestUpdate(NULL);
    }
    LONG before[5];
    snapshot(before);
    for (unsigned index = 0; index < 5; ++index)
        if (before[index] != 0) return 8;
    char root[MAX_PATH], path[MAX_PATH], line[512], event_name[128] = {0};
    if (!GetEnvironmentVariableA("LOCALAPPDATA", root, MAX_PATH)) return 9;
    if (snprintf(path, sizeof(path), "%s\\NMSCourier\\diagnostics\\native-observer-180383-%lu.log", root, (unsigned long)GetCurrentProcessId()) >= (int)sizeof(path)) return 10;
    FILE *log = fopen(path, "r");
    if (!log) return 11;
    while (fgets(line, sizeof(line), log)) {
        if (sscanf(line, "class_start_event=%127s", event_name) == 1) break;
    }
    fclose(log);
    HANDLE start_event = OpenEventA(EVENT_MODIFY_STATE, FALSE, event_name);
    if (!start_event) return 12;
    if (!SetEvent(start_event)) { CloseHandle(start_event); return 13; }
    CloseHandle(start_event);
    Sleep(500);
#endif
    for (unsigned index = 0; index < 400; ++index) {
        uint64_t selection = selections[index % 5];
        uint64_t result = CourierTestClassGenerator(1, 2, 3, selection, 5, 6, 7, 8);
        if (result != 32 + selection) return 4;
        CourierTestUpdate(NULL);
    }
    LONG counts[5];
    snapshot(counts);
    printf("original_calls=%ld counts=%ld,%ld,%ld,%ld,%ld\n", (long)original_calls,
        (long)counts[0], (long)counts[1], (long)counts[2], (long)counts[3], (long)counts[4]);
#ifdef COURIER_CLASS_ARM_FIXTURE
    if (original_calls != 800 || update_calls != 800) return 5;
#else
    if (original_calls != 400 || update_calls != 400) return 5;
#endif
    for (unsigned index = 0; index < 5; ++index)
        if (counts[index] != 80) return 6;
    return 0;
}
