#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <bcrypt.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>

#define COURIER_EXE_SHA256 "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"

#ifdef COURIER_NATIVE_CALLBACK_PROBE
void courier_probe_after_verified(void);
#endif

static volatile LONG startup_started = 0;

static int sha256_file(const wchar_t *path, char output[65]) {
    BCRYPT_ALG_HANDLE algorithm = NULL;
    BCRYPT_HASH_HANDLE hash = NULL;
    HANDLE file = INVALID_HANDLE_VALUE;
    unsigned char *object = NULL;
    DWORD object_size = 0;
    DWORD property_size = 0;
    unsigned char digest[32];
    unsigned char buffer[65536];
    DWORD bytes_read = 0;
    BOOL read_ok = FALSE;
    static const char hex[] = "0123456789abcdef";
    int ok = 0;

    if (BCryptOpenAlgorithmProvider(&algorithm, BCRYPT_SHA256_ALGORITHM, NULL, 0) < 0) goto done;
    if (BCryptGetProperty(algorithm, BCRYPT_OBJECT_LENGTH, (PUCHAR)&object_size,
                          sizeof(object_size), &property_size, 0) < 0) goto done;
    object = (unsigned char *)HeapAlloc(GetProcessHeap(), 0, object_size);
    if (!object) goto done;
    if (BCryptCreateHash(algorithm, &hash, object, object_size, NULL, 0, 0) < 0) goto done;

    file = CreateFileW(path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                       NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) goto done;
    while ((read_ok = ReadFile(file, buffer, sizeof(buffer), &bytes_read, NULL)) != FALSE) {
        if (bytes_read == 0) break;
        if (BCryptHashData(hash, buffer, bytes_read, 0) < 0) goto done;
    }
    if (!read_ok) goto done;
    if (BCryptFinishHash(hash, digest, sizeof(digest), 0) < 0) goto done;
    for (size_t i = 0; i < sizeof(digest); ++i) {
        output[i * 2] = hex[digest[i] >> 4];
        output[i * 2 + 1] = hex[digest[i] & 15];
    }
    output[64] = '\0';
    ok = 1;

done:
    if (file != INVALID_HANDLE_VALUE) CloseHandle(file);
    if (hash) BCryptDestroyHash(hash);
    if (object) HeapFree(GetProcessHeap(), 0, object);
    if (algorithm) BCryptCloseAlgorithmProvider(algorithm, 0);
    return ok;
}

static void write_diagnostic(const char *status, const char *digest) {
    wchar_t appdata[MAX_PATH];
    wchar_t base[MAX_PATH];
    wchar_t diagnostics[MAX_PATH];
    wchar_t path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", appdata, MAX_PATH);
    if (length == 0 || length >= MAX_PATH) return;
    if (swprintf(base, MAX_PATH, L"%ls\\NMSCourier", appdata) < 0) return;
    if (swprintf(diagnostics, MAX_PATH, L"%ls\\diagnostics", base) < 0) return;
    CreateDirectoryW(base, NULL);
    CreateDirectoryW(diagnostics, NULL);
    if (swprintf(path, MAX_PATH, L"%ls\\asi-startup-%lu.log", diagnostics,
                 (unsigned long)GetCurrentProcessId()) < 0) return;

    HANDLE log = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS,
                             FILE_ATTRIBUTE_NORMAL, NULL);
    if (log == INVALID_HANDLE_VALUE) return;
    char line[256];
    int length_bytes = snprintf(line, sizeof(line), "status=%s\npid=%lu\nexe_sha256=%s\n",
                                status, (unsigned long)GetCurrentProcessId(), digest);
    if (length_bytes > 0 && length_bytes < (int)sizeof(line)) {
        DWORD written = 0;
        WriteFile(log, line, (DWORD)length_bytes, &written, NULL);
    }
    CloseHandle(log);
}

static DWORD WINAPI startup_worker(void *unused) {
    (void)unused;
    wchar_t exe[MAX_PATH];
    char digest[65] = "unavailable";
    DWORD length = GetModuleFileNameW(NULL, exe, MAX_PATH);
    if (length == 0 || length >= MAX_PATH) {
        write_diagnostic("executable_path_unavailable", digest);
        return 0;
    }
    const wchar_t *name = wcsrchr(exe, L'\\');
    name = name ? name + 1 : exe;
    if (_wcsicmp(name, L"NMS.exe") != 0) {
        write_diagnostic("unsupported_executable", digest);
        return 0;
    }
    if (!sha256_file(exe, digest)) {
        write_diagnostic("executable_hash_failed", digest);
        return 0;
    }
    int exact_build = strcmp(digest, COURIER_EXE_SHA256) == 0;
    write_diagnostic(exact_build ? "exact_build_startup_observed" : "unsupported_build", digest);
#ifdef COURIER_NATIVE_CALLBACK_PROBE
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    courier_probe_after_verified();
#else
    if (exact_build) courier_probe_after_verified();
#endif
#endif
    return 0;
}

void courier_startup_probe_start(void) {
    if (InterlockedCompareExchange(&startup_started, 1, 0) != 0) return;
    HANDLE worker = CreateThread(NULL, 0, startup_worker, NULL, 0, NULL);
    if (worker) CloseHandle(worker);
}

#ifndef COURIER_XINPUT_PROXY_BUILD
__declspec(dllexport) void InitializeASI(void) {
    courier_startup_probe_start();
}

BOOL WINAPI DllMain(HINSTANCE instance, DWORD reason, LPVOID reserved) {
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH) DisableThreadLibraryCalls(instance);
    return TRUE;
}
#endif
