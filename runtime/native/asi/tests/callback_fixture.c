#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <stdio.h>

static volatile LONG original_calls = 0;

__declspec(dllexport) __declspec(noinline) void WINAPI CourierTestUpdate(void *application) {
    (void)application;
    InterlockedIncrement(&original_calls);
}

int main(void) {
    HMODULE proxy = LoadLibraryW(L"xinput9_1_0.dll");
    if (!proxy) return 2;
    typedef DWORD(WINAPI *get_state_fn)(DWORD, XINPUT_STATE *);
    get_state_fn get_state = (get_state_fn)GetProcAddress(proxy, "XInputGetState");
    if (!get_state) return 3;
    XINPUT_STATE state = {0};
    DWORD xinput_result = get_state(0, &state);
#ifdef COURIER_LONG_FIXTURE
    const unsigned expected_calls = 5000;
#else
    const unsigned expected_calls = 400;
#endif
    for (unsigned index = 0; index < expected_calls; ++index) {
        CourierTestUpdate(NULL);
        Sleep(10);
    }
    LONG calls = InterlockedCompareExchange(&original_calls, 0, 0);
    printf("xinput_result=%lu original_calls=%ld\n", (unsigned long)xinput_result, (long)calls);
    return calls == (LONG)expected_calls ? 0 : 4;
}
