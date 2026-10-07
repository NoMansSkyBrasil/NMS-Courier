// Fossil domain of the build 180836 research profile: mark fossil products as seen through the game's
// own routine. Included once by the profile source.
//
// Observed offline on 2026-10-07 (docs/REWARD_REDEMPTION_NOTES.md): the game keeps the individual
// fossil bones only in the account's list of seen products, not in a save slot. One routine adds a
// product to that list: it looks the product up, refuses some product types and IDs already listed,
// inserts the ID and sets the account object's changed flag. This file calls it for requested IDs
// that begin with FOS_. It is an ACCOUNT-LEVEL change, shared by every slot; the project owner
// accepted that for fossils on 2026-10-07.

#define FOSSIL_SEEN_RVA 0x60a720u
#define FOSSIL_ACCOUNT_OFFSET 0x315748u    // from the manager object
#define FOSSIL_REQUEST_CAPACITY 512

enum { FOSSIL_PENDING = 0, FOSSIL_ADDED, FOSSIL_NOT_ADDED, FOSSIL_BLOCKED_ID, FOSSIL_NOT_READY };
static const char *const fossil_result_names[] = {"pending", "added", "not_added", "blocked_id", "not_ready"};

typedef uint8_t (*fossil_seen_fn)(void *account, const char *product_id);

static fossil_seen_fn fossil_seen;
static char fossil_ids[FOSSIL_REQUEST_CAPACITY][16];
static volatile LONG fossil_results[FOSSIL_REQUEST_CAPACITY];
static volatile LONG fossil_count;
static volatile LONG fossil_state;         // 0 idle, 1 requested, 2 applied and waiting for the result file

__attribute__((unused)) static int fossil_resolve(uintptr_t base) {
    static const unsigned char seen_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x74, 0x24, 0x10, 0x57, 0x48,
        0x83, 0xec, 0x40, 0x48, 0x8b, 0xf1, 0x48, 0x8b, 0xfa, 0x48, 0x8b, 0x0d,
        0xcc, 0x2f, 0x88, 0x06, 0x48, 0x83, 0xc1, 0x60
    };
    fossil_seen = (fossil_seen_fn)(base + FOSSIL_SEEN_RVA);
    return memcmp((void *)(base + FOSSIL_SEEN_RVA), seen_entry, sizeof(seen_entry)) == 0;
}

// Runs on the game's update thread: mark each requested fossil product as seen.
static void fossil_apply_request(void) {
    // The routine stays unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = fossil_seen
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    uint8_t *account = (uint8_t *)(manager + FOSSIL_ACCOUNT_OFFSET);
    int ready = manager && writable_range((uintptr_t)account, 0x2c0);
    LONG count = InterlockedCompareExchange(&fossil_count, 0, 0);
    for (LONG index = 0; index < count && index < FOSSIL_REQUEST_CAPACITY; ++index) {
        LONG result;
        // This request is for fossils only; any other product is refused here.
        if (strncmp(fossil_ids[index], "FOS_", 4) != 0) result = FOSSIL_BLOCKED_ID;
        else if (!ready) result = FOSSIL_NOT_READY;
        else result = fossil_seen(account, fossil_ids[index]) ? FOSSIL_ADDED : FOSSIL_NOT_ADDED;
        InterlockedExchange(&fossil_results[index], result);
    }
    InterlockedExchange(&fossil_state, 2);
}

static int fossil_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-fossil-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: one "id=<ID>" per line. Any other content, a malformed ID, a
// duplicate or more than the capacity rejects the whole request.
static int fossil_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&fossil_state, 0, 0) != 0 || !fossil_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        size_t length = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || length < 4 || length > 3 + 15 || count >= FOSSIL_REQUEST_CAPACITY) {
            ok = 0;
            break;
        }
        for (const char *cursor = line + 3; *cursor; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (strcmp(fossil_ids[seen], line + 3) == 0) ok = 0;
        if (!ok) break;
        memset(fossil_ids[count], 0, sizeof(fossil_ids[count]));
        memcpy(fossil_ids[count], line + 3, length - 3);
        InterlockedExchange(&fossil_results[count], FOSSIL_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&fossil_count, count);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void fossil_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&fossil_state, 0, 0) != 2 || !fossil_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&fossil_count, 0, 0);
        fprintf(file, "requested=%ld\n", (long)count);
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "%.16s=%s\n", fossil_ids[index],
                    fossil_result_names[InterlockedCompareExchange(&fossil_results[index], 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&fossil_state, 0);
}
