// Shared by every domain of the build 180836 research profile: how a request reaches the profile
// without any helper program. The desktop application writes the name of one request ("item",
// "currency", "s", "slots", ...) into a per-process file; the worker thread takes the file, deletes
// it and handles the request exactly as if the named event had been set. The deletion tells the
// application that the profile took the request, so several requests arrive in the order they were
// written. Included once by profile_core.c.

#define FILE_SIGNAL_TAG_CAPACITY 32
// How often the worker looks for a request file while no event is set.
#define FILE_SIGNAL_POLL_MILLISECONDS 250u

static int file_signal_path(wchar_t *path) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-signal-180836-%lu.txt",
                    root, (unsigned long)GetCurrentProcessId()) > 0;
}

// Take the pending request name, if any: lower-case letters only. The file is deleted whatever it
// holds, so a malformed one cannot be read twice.
static int file_signal_take(wchar_t tag[FILE_SIGNAL_TAG_CAPACITY]) {
    wchar_t path[MAX_PATH];
    if (!file_signal_path(path)) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[FILE_SIGNAL_TAG_CAPACITY + 8] = {0};
    char *read = fgets(line, sizeof(line), file);
    fclose(file);
    if (!DeleteFileW(path) || !read) return 0;
    line[strcspn(line, "\r\n")] = 0;
    size_t length = strlen(line);
    if (length < 1 || length >= FILE_SIGNAL_TAG_CAPACITY) return 0;
    for (size_t index = 0; index < length; ++index) {
        if (line[index] < 'a' || line[index] > 'z') return 0;
        tag[index] = (wchar_t)line[index];
    }
    tag[length] = 0;
    return 1;
}
