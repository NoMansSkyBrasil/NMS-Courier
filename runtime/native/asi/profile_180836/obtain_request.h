// Shared by the starship and multi-tool domains of the build 180836 research profile: the request
// for getting a new one. A request names a model, a seed and a class; the model selects one of this
// project's own reward table entries (a specific-ship or specific-weapon reward of the data file,
// see reward_carrier.h), the seed and the class are written into that entry for one call of the
// game's reward routine and restored afterwards. The game then shows its own offer screen, where
// the player accepts, trades or declines. What a model is, and where the fields are, is the
// domain's business (ship_obtain.h, multitool_obtain.h). Included once by profile_core.c, after
// reward_carrier.h.
//
// A request may also say "legacy=0" or "legacy=1" for a domain that keeps the legacy colours flag
// in its owned records (multi-tools). The game's reward has no such field, so this part is not a
// native call: after the offer, the game thread watches the owned records and, when one holds the
// requested seed, WRITES the flag byte of that record directly. It gives up after
// OBTAIN_LEGACY_FRAMES frames. The record layout was read in the executable (the game copies the
// saved UseLegacyColours to record +0x2ad and the saved Seed to +0x2b0 at 5517ae); it was not
// exercised in the running game when this was written.
//
// The offer itself (bridge 1.10.0): the game builds the offered multi-tool's model inside the reward
// call and passes a constant "no legacy colours" to its palette builder at two places (8e5b78 and
// 8e5e0d, "mov byte ptr [rsp+0x20], r14b" with r14b zero). For a request with "legacy=1" those five
// bytes are REPLACED by "mov byte ptr [rsp+0x20], 1": a temporary change of the game's code, not a
// native call. Both places must hold the expected bytes or nothing is changed. The result file says
// "offer_colours=legacy" or "standard".
//
// Bridge 1.10.0 put the bytes back right after the reward call and the offer still showed the
// standard colours (live, 2026-10-09): the game builds the offered model again later (8e58e0 is also
// called from 8e6bf0). From 1.12.0 the change stays until the watch for the accepted tool ends: the
// flag was written on the owned record, or OBTAIN_LEGACY_FRAMES frames passed. While it stays, any
// multi-tool the game offers through this routine is built with the legacy colours.
//
// 1.12.0 still showed the standard colours (live, 2026-10-09): the two places are on a branch the
// reward does not take. The reward passes no part description, so 8e58e0 loads the model through the
// scene loader 639be0, whose legacy colours argument is the byte written at 8e5c7e
// ("mov byte ptr [rsp+0x60], r14b"); 639be0 hands it to the texture job (639610, job +0x1c9). From
// 1.13.0 that third place is changed as well.

// A request may also say "slots=1" and/or "super=1" for a domain that can change the accepted item
// in place (multi-tools, bridge 1.14.0): once the owned record holds the requested seed, and after
// OBTAIN_UPGRADE_FRAMES more frames, the domain's upgrade routine makes every position of the grid
// usable and/or every usable technology slot supercharged. These are the same direct writes as the
// "owned" request (owned_inventory_request.h), not native calls.

#define OBTAIN_UPGRADE_FRAMES 120
#define OBTAIN_CLASS_COUNT 4          // C, B, A, S as the game numbers them
#define OBTAIN_CARRIER_SEED 1         // seed and class the data file gives every carrier
#define OBTAIN_CARRIER_CLASS 3
#define OBTAIN_LEGACY_FRAMES 36000   // about ten minutes at sixty frames a second

typedef struct {
    const char *model;      // name used in a request
    const char *carrier;    // reward table entry of the data file
    int32_t type;           // the game's type number the carrier must hold
} obtain_model;

// One place where the game writes "no legacy colours" onto the stack: its address and the stack
// displacement of the instruction.
typedef struct {
    uint32_t rva;
    uint8_t displacement;
} obtain_offer_site;

typedef struct {
    const wchar_t *file_kind;            // "ship" or "weapon": native-<kind>-request / -result
    uint32_t class_hash;                 // class of the reward structure
    size_t size, seed_offset, class_offset, type_offset;
    const obtain_model *models;
    int model_count;
    volatile LONG state;                 // 0 idle, 1 requested, 2 applied and waiting for the result file
    volatile LONG model, item_class, result;
    uint64_t seed;
    // Owned records that keep the legacy colours flag; record_stride 0 when the domain has none.
    size_t record_offset, record_stride, record_count, record_seed_offset, record_legacy_offset;
    volatile LONG legacy;          // requested flag: -1 not asked, 0 or 1
    // 0 none, 1 watching, 2 done, 3 gave up, 4 found and waiting to upgrade; 2 and 3 await the file
    volatile LONG legacy_state;
    // Upgrade of the accepted item: the routine (NULL when the domain has none), what was asked,
    // the frames left before it runs and what it reported.
    LONG (*upgrade)(uintptr_t manager, LONG slot, int slots, int supercharge);
    volatile LONG want_slots, want_super, upgrade_frames, upgraded;
    volatile LONG legacy_frames, legacy_slot;
    uint64_t legacy_seed;
    // Where the game passes "no legacy colours" when it builds the offered model; count 0 for none.
    const obtain_offer_site *offer_legacy_sites;
    int offer_legacy_site_count;
    volatile LONG offer_legacy;    // 1 when the last offer was built with the legacy colours
    int offer_patched;             // game thread only: the game's code currently holds the change
} obtain_domain;

enum {
    OBTAIN_PENDING = 0,
    OBTAIN_OFFERED,          // the game's reward routine was called; the game shows its offer
    OBTAIN_UNKNOWN_REWARD,   // the carrier is not in the game's reward table: the data file is not loaded
    OBTAIN_BAD_LAYOUT,       // the carrier did not look like the data file's entry; nothing was written
    OBTAIN_NOT_READY
};
static const char *const obtain_result_names[] = {
    "pending", "offered", "unknown_reward", "bad_layout", "not_ready"
};

// The domain being checked; reward_carrier_find passes only an integer to the check.
static const obtain_domain *obtain_checked;

static int obtain_is_carrier(const void *reward, int model) {
    const uint8_t *bytes = reward;
    const obtain_domain *domain = obtain_checked;
    return *(const uint64_t *)(bytes + domain->seed_offset) == OBTAIN_CARRIER_SEED &&
           *(const int32_t *)(bytes + domain->class_offset) == OBTAIN_CARRIER_CLASS &&
           *(const int32_t *)(bytes + domain->type_offset) == domain->models[model].type;
}

// An offer opens a game screen that needs the mouse. A request sent from the application arrives
// while the application's window, not the game's, is in front; an offer opened then was seen without
// a cursor (2026-10-09). So a request waits on the game thread until the game's window has been the
// foreground window for OBTAIN_FOCUS_FRAMES frames in a row (bridge 1.11.0). Confirmed live the
// same day, with one gap the owner found: after switching back, until the first click the system's
// arrow is still shown and the game has not taken the mouse; an offer opened then has no cursor
// either. So from 1.13.0 the system's arrow must also be hidden, which is how the game holds the
// mouse while playing.
#define OBTAIN_FOCUS_FRAMES 45
static LONG obtain_focus_frames;

static int obtain_game_in_front(void) {
    HWND window = GetForegroundWindow();
    DWORD process = 0;
    if (!window) return 0;
    GetWindowThreadProcessId(window, &process);
    if (process != GetCurrentProcessId()) return 0;
    CURSORINFO cursor = {.cbSize = sizeof(cursor)};
    return GetCursorInfo(&cursor) && !(cursor.flags & CURSOR_SHOWING);
}

// Game thread, every frame: true once the game has been in front long enough to open an offer.
static int obtain_focus_ready(int waiting) {
    if (!waiting || !obtain_game_in_front()) {
        obtain_focus_frames = 0;
        return 0;
    }
    return ++obtain_focus_frames >= OBTAIN_FOCUS_FRAMES;
}

#define OBTAIN_OFFER_LEGACY_BYTES 5

// The instruction of one site: "mov byte ptr [rsp+disp], r14b" as the game has it, or
// "mov byte ptr [rsp+disp], 1".
static void obtain_offer_instruction(uint8_t *bytes, uint8_t displacement, int legacy) {
    const uint8_t standard[OBTAIN_OFFER_LEGACY_BYTES] = {0x44, 0x88, 0x74, 0x24, displacement};
    const uint8_t changed[OBTAIN_OFFER_LEGACY_BYTES] = {0xc6, 0x44, 0x24, displacement, 0x01};
    memcpy(bytes, legacy ? changed : standard, OBTAIN_OFFER_LEGACY_BYTES);
}

static int obtain_offer_write(void *site, const uint8_t *bytes) {
    DWORD old = 0;
    if (!VirtualProtect(site, OBTAIN_OFFER_LEGACY_BYTES, PAGE_EXECUTE_READWRITE, &old)) return 0;
    memcpy(site, bytes, OBTAIN_OFFER_LEGACY_BYTES);
    VirtualProtect(site, OBTAIN_OFFER_LEGACY_BYTES, old, &old);
    FlushInstructionCache(GetCurrentProcess(), site, OBTAIN_OFFER_LEGACY_BYTES);
    return 1;
}

// Writes one of the two instructions at every site of the domain; all or none. Game thread only.
static int obtain_offer_colours(const obtain_domain *domain, int legacy) {
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uint8_t bytes[OBTAIN_OFFER_LEGACY_BYTES];
    if (domain->offer_legacy_site_count <= 0) return 0;
    for (int index = 0; index < domain->offer_legacy_site_count; ++index) {
        obtain_offer_instruction(bytes, domain->offer_legacy_sites[index].displacement, !legacy);
        if (memcmp((const void *)(base + domain->offer_legacy_sites[index].rva), bytes, sizeof(bytes)) != 0) return 0;
    }
    for (int index = 0; index < domain->offer_legacy_site_count; ++index) {
        obtain_offer_instruction(bytes, domain->offer_legacy_sites[index].displacement, legacy);
        if (obtain_offer_write((void *)(base + domain->offer_legacy_sites[index].rva), bytes)) continue;
        // Undo what was written so far.
        while (--index >= 0) {
            obtain_offer_instruction(bytes, domain->offer_legacy_sites[index].displacement, !legacy);
            obtain_offer_write((void *)(base + domain->offer_legacy_sites[index].rva), bytes);
        }
        return 0;
    }
    return 1;
}

// Runs on the game's update thread.
static void obtain_apply_request(obtain_domain *domain) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG model = InterlockedCompareExchange(&domain->model, 0, 0), found = REWARD_CARRIER_NOT_READY;
    uint8_t *reward = NULL;
    if (manager && model >= 0 && model < domain->model_count) {
        obtain_checked = domain;
        reward = reward_carrier_find(manager, domain->models[model].carrier, domain->class_hash, domain->size,
                                     obtain_is_carrier, (int)model, &found);
    }
    if (reward) {
        *(uint64_t *)(reward + domain->seed_offset) = domain->seed;
        *(int32_t *)(reward + domain->class_offset) = (int32_t)InterlockedCompareExchange(&domain->item_class, 0, 0);
        int wanted = InterlockedCompareExchange(&domain->legacy, 0, 0) == 1;
        if (wanted && !domain->offer_patched) domain->offer_patched = obtain_offer_colours(domain, 1);
        else if (!wanted && domain->offer_patched) domain->offer_patched = !obtain_offer_colours(domain, 0);
        reward_carrier_give(domain->models[model].carrier, 0);
        InterlockedExchange(&domain->offer_legacy, wanted && domain->offer_patched);
        *(uint64_t *)(reward + domain->seed_offset) = OBTAIN_CARRIER_SEED;
        *(int32_t *)(reward + domain->class_offset) = OBTAIN_CARRIER_CLASS;
    }
    LONG legacy = InterlockedCompareExchange(&domain->legacy, 0, 0);
    int upgrade = domain->upgrade && (InterlockedCompareExchange(&domain->want_slots, 0, 0) ||
                                      InterlockedCompareExchange(&domain->want_super, 0, 0));
    InterlockedExchange(&domain->upgraded, 0);
    if (reward && (legacy >= 0 || upgrade) && domain->record_stride) {
        domain->legacy_seed = domain->seed;
        InterlockedExchange(&domain->legacy_frames, OBTAIN_LEGACY_FRAMES);
        InterlockedExchange(&domain->legacy_state, 1);
    }
    InterlockedExchange(&domain->result, reward ? OBTAIN_OFFERED
                                         : found == REWARD_CARRIER_UNKNOWN ? OBTAIN_UNKNOWN_REWARD
                                         : found == REWARD_CARRIER_BAD_LAYOUT ? OBTAIN_BAD_LAYOUT
                                         : OBTAIN_NOT_READY);
    InterlockedExchange(&domain->state, 2);
}

static int obtain_path(const obtain_domain *domain, wchar_t *path, const wchar_t *kind);

// Runs on the game's update thread every frame while a legacy colours flag is waited for: a direct
// write of one byte of the owned record that holds the requested seed.
static void obtain_legacy_tick(obtain_domain *domain) {
    if (InterlockedCompareExchange(&domain->legacy_state, 0, 0) == 4) {
        // The accepted item was found; the game is given some frames to finish taking it over.
        if (InterlockedDecrement(&domain->upgrade_frames) > 0) return;
        uintptr_t manager = *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA);
        if (manager && domain->upgrade)
            InterlockedExchange(&domain->upgraded,
                                domain->upgrade(manager, InterlockedCompareExchange(&domain->legacy_slot, 0, 0),
                                                InterlockedCompareExchange(&domain->want_slots, 0, 0) != 0,
                                                InterlockedCompareExchange(&domain->want_super, 0, 0) != 0));
        InterlockedExchange(&domain->legacy_state, 2);
        return;
    }
    if (InterlockedCompareExchange(&domain->legacy_state, 0, 0) != 1) {
        // The watch ended (or never started): the game's code goes back to what it was.
        if (domain->offer_patched && InterlockedCompareExchange(&domain->state, 0, 0) != 1)
            domain->offer_patched = !obtain_offer_colours(domain, 0);
        return;
    }
    uintptr_t manager = *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA);
    LONG asked = InterlockedCompareExchange(&domain->legacy, 0, 0);
    uint8_t wanted = asked == 1;
    int upgrade = domain->upgrade && (InterlockedCompareExchange(&domain->want_slots, 0, 0) ||
                                      InterlockedCompareExchange(&domain->want_super, 0, 0));
    for (size_t slot = 0; manager && slot < domain->record_count; ++slot) {
        uint8_t *record = (uint8_t *)(manager + domain->record_offset + slot * domain->record_stride);
        if (!writable_range((uintptr_t)record, domain->record_stride)) break;
        // The seed and its in-use byte, as the game stores every seed.
        if (*(const uint64_t *)(record + domain->record_seed_offset) != domain->legacy_seed ||
            record[domain->record_seed_offset + 8] != 1) continue;
        if (record[domain->record_legacy_offset] > 1) continue;
        if (asked >= 0) record[domain->record_legacy_offset] = wanted;
        InterlockedExchange(&domain->legacy_slot, (LONG)slot);
        InterlockedExchange(&domain->upgrade_frames, OBTAIN_UPGRADE_FRAMES);
        InterlockedExchange(&domain->legacy_state, upgrade ? 4 : 2);
        return;
    }
    if (InterlockedDecrement(&domain->legacy_frames) <= 0) InterlockedExchange(&domain->legacy_state, 3);
}

// Called from the worker thread: says in a file of its own what became of the flag.
static void obtain_write_legacy(obtain_domain *domain) {
    LONG state = InterlockedCompareExchange(&domain->legacy_state, 0, 0);
    wchar_t path[MAX_PATH];
    if (state != 2 && state != 3) return;
    if (obtain_path(domain, path, L"legacy")) {
        FILE *file = _wfopen(path, L"w");
        if (file) {
            // "upgrade": 0 nothing, 1 the owned record, 3 the record and the equipped item's store.
            fprintf(file, "seed=0x%llX\nlegacy=%ld\nresult=%s\nslot=%ld\nupgrade=%ld\n",
                    (unsigned long long)domain->legacy_seed, InterlockedCompareExchange(&domain->legacy, 0, 0),
                    state == 2 ? "written" : "not_found",
                    state == 2 ? InterlockedCompareExchange(&domain->legacy_slot, 0, 0) : -1L,
                    InterlockedCompareExchange(&domain->upgraded, 0, 0));
            fclose(file);
        }
    }
    InterlockedExchange(&domain->legacy_state, 0);
}

static int obtain_path(const obtain_domain *domain, wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-%ls-%ls-180836-%lu.txt",
                    root, domain->file_kind, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "model=<name>", "seed=0x<1 to 16 hex digits>" and
// "class=<c|b|a|s>", each once, and "legacy=<0|1>" at most once where the domain has the flag.
// Anything else rejects the whole request.
static int obtain_read_request(obtain_domain *domain) {
    static const char classes[OBTAIN_CLASS_COUNT] = {'c', 'b', 'a', 's'};
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&domain->state, 0, 0) != 0 || !obtain_path(domain, path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG model = -1, item_class = -1, legacy = -1, slots = 0, supercharge = 0;
    uint64_t seed = 0;
    int ok = 1, have_seed = 0;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strncmp(line, "model=", 6) == 0 && model < 0) {
            for (int index = 0; index < domain->model_count; ++index)
                if (strcmp(line + 6, domain->models[index].model) == 0) model = index;
            if (model < 0) ok = 0;
        } else if (strncmp(line, "class=", 6) == 0 && item_class < 0 && line[6] && !line[7]) {
            for (int index = 0; index < OBTAIN_CLASS_COUNT; ++index)
                if (line[6] == classes[index]) item_class = index;
            if (item_class < 0) ok = 0;
        } else if (strncmp(line, "legacy=", 7) == 0 && legacy < 0 && domain->record_stride &&
                   (line[7] == '0' || line[7] == '1') && !line[8]) {
            legacy = line[7] - '0';
        } else if (strcmp(line, "slots=1") == 0 && !slots && domain->upgrade) {
            slots = 1;
        } else if (strcmp(line, "super=1") == 0 && !supercharge && domain->upgrade) {
            supercharge = 1;
        } else if (strncmp(line, "seed=0x", 7) == 0 && !have_seed) {
            const char *digit = line + 7;
            size_t length = strlen(digit);
            if (length < 1 || length > 16) ok = 0;
            for (; ok && *digit; ++digit) {
                int value = *digit >= '0' && *digit <= '9' ? *digit - '0'
                          : *digit >= 'A' && *digit <= 'F' ? *digit - 'A' + 10 : -1;
                if (value < 0) ok = 0;
                else seed = seed << 4 | (uint64_t)value;
            }
            have_seed = 1;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || model < 0 || item_class < 0 || !have_seed || seed == 0) return 0;
    domain->seed = seed;
    InterlockedExchange(&domain->model, model);
    InterlockedExchange(&domain->item_class, item_class);
    InterlockedExchange(&domain->legacy, legacy);
    InterlockedExchange(&domain->want_slots, slots);
    InterlockedExchange(&domain->want_super, supercharge);
    InterlockedExchange(&domain->result, OBTAIN_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void obtain_write_result(obtain_domain *domain) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&domain->state, 0, 0) != 2 || !obtain_path(domain, path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG model = InterlockedCompareExchange(&domain->model, 0, 0);
        LONG legacy = InterlockedCompareExchange(&domain->legacy, 0, 0);
        fprintf(file, "model=%s\nseed=0x%llX\nresult=%s\nlegacy=%s\noffer_colours=%s\n",
                model >= 0 && model < domain->model_count ? domain->models[model].model : "?",
                (unsigned long long)domain->seed,
                obtain_result_names[InterlockedCompareExchange(&domain->result, 0, 0)],
                legacy < 0 ? "not_asked" : legacy ? "1" : "0",
                InterlockedCompareExchange(&domain->result, 0, 0) == OBTAIN_OFFERED &&
                    InterlockedCompareExchange(&domain->offer_legacy, 0, 0) ? "legacy" : "standard");
        fclose(file);
    }
    InterlockedExchange(&domain->state, 0);
}
