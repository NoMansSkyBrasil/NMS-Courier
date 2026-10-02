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
    if (original_calls != 400 || update_calls != 400) return 5;
    for (unsigned index = 0; index < 5; ++index)
        if (counts[index] != 80) return 6;
    return 0;
}
