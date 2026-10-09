// Travel domain of the build 180836 research profile: send the player to a star system chosen by
// galaxy and portal address, without a portal or a teleporter. Included once by profile_core.c.
//
// Read in the executable on 2026-10-09 (docs/TELEPORT_NOTES.md). The game's teleport reward
// (GcRewardTeleport, handler f3a910) does not travel by itself: it fills a pending request in the
// manager object and sets its state, and the game then makes the journey. The request is 0xc0 bytes
// at manager +0x72f120 and its state is the integer at +0x72f1e0, which the handler sets to 2:
//   +0x00  the destination packed: int16 X, int16 Z, int16 Y, two bytes, uint16 system, uint16 galaxy
//   +0x10  a position and +0x20 three small values the handler takes from the game
//   +0x30  a GcTeleportEndpoint (0x90 bytes): Facing +0x00, Position +0x10, PlanetIndex +0x20,
//          SolarSystemIndex +0x24, VoxelX +0x28, VoxelY +0x2c, VoxelZ +0x30, RealityIndex +0x34,
//          TeleporterType +0x48 (1 space station, 3 a planet away from the ship), Name +0x4c
// The endpoint layout is the game's own metadata for cGcTeleportEndpoint.
//
// For one request this file calls the handler with the reward type "Atlas" (3), which fills the
// whole request for the system the player is in and has no precondition, and then WRITES the
// destination over the address fields and the teleporter type before the game's update reads the
// request: one native call and a direct write of those fields. Nothing else of the request is
// changed, so positions and the other values stay what the game put there.
// Not exercised in the running game when this was written.

#define TELEPORT_HANDLER_RVA 0xf3a910u
#define TELEPORT_REQUEST_OFFSET 0x72f120u      // from the manager object
#define TELEPORT_STATE_OFFSET 0x72f1e0u
#define TELEPORT_STATE_PENDING 2
#define TELEPORT_ENDPOINT_OFFSET 0x30u         // inside the request
#define TELEPORT_REWARD_ATLAS 3
#define TELEPORT_TYPE_STATION 1
#define TELEPORT_TYPE_PLANET 3

typedef uint8_t (*teleport_handler_fn)(void *unused, const int32_t *reward, uint8_t peek, uint8_t silent);

enum { TELEPORT_NONE = 0, TELEPORT_REQUESTED, TELEPORT_NOT_READY, TELEPORT_NOT_FILLED };
static const char *const teleport_result_names[] = {"none", "requested", "not_ready", "not_filled"};

static teleport_handler_fn teleport_handler;
static volatile LONG teleport_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG teleport_result;
// The destination of the request being handled: voxel coordinates are signed, as the game keeps them.
static volatile LONG teleport_galaxy, teleport_system, teleport_planet, teleport_x, teleport_y, teleport_z;
static volatile LONG teleport_to_planet;

__attribute__((unused)) static int teleport_resolve(uintptr_t base) {
    static const unsigned char handler_entry[32] = {
        0x48, 0x8b, 0xc4, 0x48, 0x89, 0x58, 0x10, 0x48, 0x89, 0x48, 0x08, 0x55, 0x56, 0x57, 0x48, 0x8d,
        0xa8, 0x08, 0xff, 0xff, 0xff, 0x48, 0x81, 0xec, 0xe0, 0x01, 0x00, 0x00, 0x0f, 0x29, 0x70, 0xd8
    };
    teleport_handler = (teleport_handler_fn)(base + TELEPORT_HANDLER_RVA);
    return memcmp((void *)(base + TELEPORT_HANDLER_RVA), handler_entry, sizeof(handler_entry)) == 0;
}

// Runs on the game's update thread.
static void teleport_apply_request(void) {
    LONG result = TELEPORT_NOT_READY;
    // The routine stays unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = teleport_handler
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    if (manager && writable_range(manager + TELEPORT_REQUEST_OFFSET, 0xc4) &&
        *(const int32_t *)(manager + TELEPORT_STATE_OFFSET) != TELEPORT_STATE_PENDING) {
        const int32_t reward = TELEPORT_REWARD_ATLAS;
        teleport_handler(NULL, &reward, 0, 1);
        result = TELEPORT_NOT_FILLED;
        if (*(const int32_t *)(manager + TELEPORT_STATE_OFFSET) == TELEPORT_STATE_PENDING) {
            uint8_t *request = (uint8_t *)(manager + TELEPORT_REQUEST_OFFSET);
            int32_t *endpoint = (int32_t *)(request + TELEPORT_ENDPOINT_OFFSET);
            LONG x = InterlockedCompareExchange(&teleport_x, 0, 0), y = InterlockedCompareExchange(&teleport_y, 0, 0);
            LONG z = InterlockedCompareExchange(&teleport_z, 0, 0);
            LONG system = InterlockedCompareExchange(&teleport_system, 0, 0);
            LONG galaxy = InterlockedCompareExchange(&teleport_galaxy, 0, 0);
            int planet = InterlockedCompareExchange(&teleport_to_planet, 0, 0) != 0;
            *(int16_t *)(request + 0) = (int16_t)x;
            *(int16_t *)(request + 2) = (int16_t)z;
            *(int16_t *)(request + 4) = (int16_t)y;
            *(uint16_t *)(request + 8) = (uint16_t)system;
            *(uint16_t *)(request + 10) = (uint16_t)galaxy;
            endpoint[0x20 / 4] = planet ? (int32_t)InterlockedCompareExchange(&teleport_planet, 0, 0) : 0;
            endpoint[0x24 / 4] = (int32_t)system;
            endpoint[0x28 / 4] = (int32_t)x;
            endpoint[0x2c / 4] = (int32_t)y;
            endpoint[0x30 / 4] = (int32_t)z;
            endpoint[0x34 / 4] = (int32_t)galaxy;
            endpoint[0x48 / 4] = planet ? TELEPORT_TYPE_PLANET : TELEPORT_TYPE_STATION;
            result = TELEPORT_REQUESTED;
        }
    }
    InterlockedExchange(&teleport_result, result);
    InterlockedExchange(&teleport_state, 2);
}

static int teleport_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-teleport-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "galaxy=<0..255>", "system=<0..4095>", "planet=<0..15>",
// "x=<-2048..2047>", "y=<-128..127>", "z=<-2048..2047>" and "to=station|planet", each exactly once.
// Anything else rejects the whole request.
static int teleport_read_request(void) {
    static const char *const names[6] = {"galaxy=", "system=", "planet=", "x=", "y=", "z="};
    static const long low[6] = {0, 0, 0, -2048, -128, -2048}, high[6] = {255, 4095, 15, 2047, 127, 2047};
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&teleport_state, 0, 0) != 0 || !teleport_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[48];
    long values[6] = {0};
    int have[6] = {0}, to = -1, ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "to=station") == 0 && to < 0) { to = 0; continue; }
        if (strcmp(line, "to=planet") == 0 && to < 0) { to = 1; continue; }
        int matched = 0;
        for (int index = 0; index < 6 && !matched; ++index) {
            size_t length = strlen(names[index]);
            if (strncmp(line, names[index], length) != 0 || have[index]) continue;
            char *end = NULL;
            long value = strtol(line + length, &end, 10);
            if (end == line + length || *end || value < low[index] || value > high[index]) { ok = 0; break; }
            values[index] = value;
            have[index] = matched = 1;
        }
        if (!matched) ok = 0;
    }
    fclose(file);
    for (int index = 0; index < 6; ++index) ok = ok && have[index];
    if (!ok || to < 0) return 0;
    InterlockedExchange(&teleport_galaxy, values[0]);
    InterlockedExchange(&teleport_system, values[1]);
    InterlockedExchange(&teleport_planet, values[2]);
    InterlockedExchange(&teleport_x, values[3]);
    InterlockedExchange(&teleport_y, values[4]);
    InterlockedExchange(&teleport_z, values[5]);
    InterlockedExchange(&teleport_to_planet, to);
    InterlockedExchange(&teleport_result, TELEPORT_NONE);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void teleport_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&teleport_state, 0, 0) != 2 || !teleport_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\ngalaxy=%ld\nsystem=%ld\nplanet=%ld\nx=%ld\ny=%ld\nz=%ld\nto=%s\n",
                teleport_result_names[InterlockedCompareExchange(&teleport_result, 0, 0)],
                InterlockedCompareExchange(&teleport_galaxy, 0, 0), InterlockedCompareExchange(&teleport_system, 0, 0),
                InterlockedCompareExchange(&teleport_planet, 0, 0), InterlockedCompareExchange(&teleport_x, 0, 0),
                InterlockedCompareExchange(&teleport_y, 0, 0), InterlockedCompareExchange(&teleport_z, 0, 0),
                InterlockedCompareExchange(&teleport_to_planet, 0, 0) ? "planet" : "station");
        fclose(file);
    }
    InterlockedExchange(&teleport_state, 0);
}
