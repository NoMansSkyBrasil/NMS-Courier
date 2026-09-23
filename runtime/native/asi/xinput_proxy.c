#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xinput.h>
#include <wchar.h>

void courier_startup_probe_start(void);

typedef DWORD(WINAPI *get_capabilities_fn)(DWORD, DWORD, XINPUT_CAPABILITIES *);
typedef DWORD(WINAPI *get_audio_guids_fn)(DWORD, GUID *, GUID *);
typedef DWORD(WINAPI *get_state_fn)(DWORD, XINPUT_STATE *);
typedef DWORD(WINAPI *set_state_fn)(DWORD, XINPUT_VIBRATION *);

static INIT_ONCE original_once = INIT_ONCE_STATIC_INIT;
static HMODULE self_module = NULL;
static HMODULE original_module = NULL;
static get_capabilities_fn original_get_capabilities = NULL;
static get_audio_guids_fn original_get_audio_guids = NULL;
static get_state_fn original_get_state = NULL;
static set_state_fn original_set_state = NULL;

static BOOL CALLBACK load_original(PINIT_ONCE once, PVOID parameter, PVOID *context) {
    (void)once;
    (void)parameter;
    (void)context;
    wchar_t system_directory[MAX_PATH];
    wchar_t path[MAX_PATH];
    UINT length = GetSystemDirectoryW(system_directory, MAX_PATH);
    if (length == 0 || length >= MAX_PATH) return TRUE;
    if (swprintf(path, MAX_PATH, L"%ls\\xinput9_1_0.dll", system_directory) < 0) return TRUE;
    original_module = LoadLibraryW(path);
    if (!original_module || original_module == self_module) {
        original_module = NULL;
        return TRUE;
    }
    original_get_capabilities = (get_capabilities_fn)GetProcAddress(original_module, "XInputGetCapabilities");
    original_get_audio_guids = (get_audio_guids_fn)GetProcAddress(original_module, "XInputGetDSoundAudioDeviceGuids");
    original_get_state = (get_state_fn)GetProcAddress(original_module, "XInputGetState");
    original_set_state = (set_state_fn)GetProcAddress(original_module, "XInputSetState");
    return TRUE;
}

static void ensure_original(void) {
    courier_startup_probe_start();
    InitOnceExecuteOnce(&original_once, load_original, NULL, NULL);
}

DWORD WINAPI XInputGetCapabilities(DWORD user_index, DWORD flags, XINPUT_CAPABILITIES *capabilities) {
    ensure_original();
    return original_get_capabilities
               ? original_get_capabilities(user_index, flags, capabilities)
               : ERROR_DEVICE_NOT_CONNECTED;
}

DWORD WINAPI XInputGetDSoundAudioDeviceGuids(DWORD user_index, GUID *render_guid, GUID *capture_guid) {
    ensure_original();
    return original_get_audio_guids
               ? original_get_audio_guids(user_index, render_guid, capture_guid)
               : ERROR_DEVICE_NOT_CONNECTED;
}

DWORD WINAPI XInputGetState(DWORD user_index, XINPUT_STATE *state) {
    ensure_original();
    return original_get_state
               ? original_get_state(user_index, state)
               : ERROR_DEVICE_NOT_CONNECTED;
}

DWORD WINAPI XInputSetState(DWORD user_index, XINPUT_VIBRATION *vibration) {
    ensure_original();
    return original_set_state
               ? original_set_state(user_index, vibration)
               : ERROR_DEVICE_NOT_CONNECTED;
}

BOOL WINAPI DllMain(HINSTANCE instance, DWORD reason, LPVOID reserved) {
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH) {
        self_module = instance;
        DisableThreadLibraryCalls(instance);
    }
    return TRUE;
}
