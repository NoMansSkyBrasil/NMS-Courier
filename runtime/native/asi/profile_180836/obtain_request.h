// Shared by the starship and multi-tool domains of the build 180836 research profile: the request
// for getting a new one. A request names a model, a seed and a class; the model selects one of this
// project's own reward table entries (a specific-ship or specific-weapon reward of the data file,
// see reward_carrier.h), the seed and the class are written into that entry for one call of the
// game's reward routine and restored afterwards. The game then shows its own offer screen, where
// the player accepts, trades or declines. What a model is, and where the fields are, is the
// domain's business (ship_obtain.h, multitool_obtain.h). Included once by profile_core.c, after
// reward_carrier.h.

#define OBTAIN_CLASS_COUNT 4          // C, B, A, S as the game numbers them
#define OBTAIN_CARRIER_SEED 1         // seed and class the data file gives every carrier
#define OBTAIN_CARRIER_CLASS 3

typedef struct {
    const char *model;      // name used in a request
    const char *carrier;    // reward table entry of the data file
    int32_t type;           // the game's type number the carrier must hold
} obtain_model;

typedef struct {
    const wchar_t *file_kind;            // "ship" or "weapon": native-<kind>-request / -result
    uint32_t class_hash;                 // class of the reward structure
    size_t size, seed_offset, class_offset, type_offset;
    const obtain_model *models;
    int model_count;
    volatile LONG state;                 // 0 idle, 1 requested, 2 applied and waiting for the result file
    volatile LONG model, item_class, result;
    uint64_t seed;
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
        reward_carrier_give(domain->models[model].carrier, 0);
        *(uint64_t *)(reward + domain->seed_offset) = OBTAIN_CARRIER_SEED;
        *(int32_t *)(reward + domain->class_offset) = OBTAIN_CARRIER_CLASS;
    }
    InterlockedExchange(&domain->result, reward ? OBTAIN_OFFERED
                                         : found == REWARD_CARRIER_UNKNOWN ? OBTAIN_UNKNOWN_REWARD
                                         : found == REWARD_CARRIER_BAD_LAYOUT ? OBTAIN_BAD_LAYOUT
                                         : OBTAIN_NOT_READY);
    InterlockedExchange(&domain->state, 2);
}

static int obtain_path(const obtain_domain *domain, wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-%ls-%ls-180836-%lu.txt",
                    root, domain->file_kind, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "model=<name>", "seed=0x<1 to 16 hex digits>" and
// "class=<c|b|a|s>", each once. Anything else rejects the whole request.
static int obtain_read_request(obtain_domain *domain) {
    static const char classes[OBTAIN_CLASS_COUNT] = {'c', 'b', 'a', 's'};
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&domain->state, 0, 0) != 0 || !obtain_path(domain, path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG model = -1, item_class = -1;
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
        fprintf(file, "model=%s\nseed=0x%llX\nresult=%s\n",
                model >= 0 && model < domain->model_count ? domain->models[model].model : "?",
                (unsigned long long)domain->seed,
                obtain_result_names[InterlockedCompareExchange(&domain->result, 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&domain->state, 0);
}
