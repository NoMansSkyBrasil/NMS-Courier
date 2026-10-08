// Currency domain of the build 180836 research profile: give units, nanites or quicksilver of any
// amount through the game's own reward routine, which adds the money to the loaded slot, keeps the
// game's maximum and shows the game's notification. Included once by profile_core.c, after
// reward_carrier.h.
//
// The game has no reward of an arbitrary amount, so this file uses three rewards of the data file
// (runtime/mods/currency_rewards) as carriers, see reward_carrier.h: it checks that the carrier is
// exactly that file's entry (one money reward, the expected currency and the file's amount), writes
// the requested amount, calls the game's reward routine and writes the file's amount back.

#define CURRENCY_MONEY_CLASS_HASH 0xac3b9854u
#define CURRENCY_COUNT 3
// One call of the reward routine carries a signed 32-bit amount.
#define CURRENCY_CALL_MAX 2147483647u

typedef struct { int32_t amount_max, amount_min, currency; uint8_t round_number; } currency_money;

enum {
    CURRENCY_PENDING = 0,
    CURRENCY_GIVEN,           // the game's reward routine was called for the whole amount
    CURRENCY_UNKNOWN_REWARD,  // the carrier is not in the game's reward table: the data file is not loaded
    CURRENCY_BAD_LAYOUT,      // the carrier did not look like the data file's entry; nothing was written
    CURRENCY_NOT_READY
};
static const char *const currency_result_names[] = {
    "pending", "given", "unknown_reward", "bad_layout", "not_ready"
};
static const char *const currency_names[CURRENCY_COUNT] = {"units", "nanites", "quicksilver"};
// Carrier of each currency with the amount the data file gives it, in the game's currency order.
static const char *const currency_carriers[CURRENCY_COUNT] = {"CR_UNITS_1M", "CR_NANITE_1K", "CR_QS_1K"};
static const int32_t currency_carrier_amounts[CURRENCY_COUNT] = {1000000, 1000, 1000};

static volatile LONG currency_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG currency_kind;
static volatile LONG currency_silent;
static uint32_t currency_amount;
static volatile LONG currency_result;
static volatile LONG currency_calls;

static int currency_is_carrier(const void *reward, int kind) {
    const currency_money *money = reward;
    return money->amount_max == currency_carrier_amounts[kind] && money->amount_min == currency_carrier_amounts[kind] &&
           money->currency == kind && money->round_number == 0;
}

// Runs on the game's update thread.
static void currency_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG kind = InterlockedCompareExchange(&currency_kind, 0, 0), found = REWARD_CARRIER_NOT_READY;
    currency_money *money = manager && kind >= 0 && kind < CURRENCY_COUNT
        ? reward_carrier_find(manager, currency_carriers[kind], CURRENCY_MONEY_CLASS_HASH, sizeof(currency_money),
                              currency_is_carrier, (int)kind, &found)
        : NULL;
    LONG calls = 0;
    if (money) {
        uint8_t silent = InterlockedCompareExchange(&currency_silent, 0, 0) != 0;
        for (uint32_t remaining = currency_amount; remaining > 0; ++calls) {
            uint32_t part = remaining > CURRENCY_CALL_MAX ? CURRENCY_CALL_MAX : remaining;
            money->amount_max = (int32_t)part;
            money->amount_min = (int32_t)part;
            reward_carrier_give(currency_carriers[kind], silent);
            remaining -= part;
        }
        money->amount_max = currency_carrier_amounts[kind];
        money->amount_min = currency_carrier_amounts[kind];
    }
    InterlockedExchange(&currency_calls, calls);
    InterlockedExchange(&currency_result, money ? CURRENCY_GIVEN
                                          : found == REWARD_CARRIER_UNKNOWN ? CURRENCY_UNKNOWN_REWARD
                                          : found == REWARD_CARRIER_BAD_LAYOUT ? CURRENCY_BAD_LAYOUT
                                          : CURRENCY_NOT_READY);
    InterlockedExchange(&currency_state, 2);
}

static int currency_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-currency-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "currency=<units|nanites|quicksilver>", "amount=<1..4294967295>" and
// optionally "silent=1". Anything else rejects the whole request.
static int currency_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&currency_state, 0, 0) != 0 || !currency_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG kind = -1, silent = 0;
    uint64_t amount = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "silent=1") == 0) silent = 1;
        else if (strcmp(line, "silent=0") == 0) silent = 0;
        else if (strncmp(line, "currency=", 9) == 0) {
            kind = -1;
            for (int index = 0; index < CURRENCY_COUNT; ++index)
                if (strcmp(line + 9, currency_names[index]) == 0) kind = index;
            if (kind < 0) ok = 0;
        } else if (strncmp(line, "amount=", 7) == 0) {
            const char *digit = line + 7;
            amount = 0;
            if (!*digit || strlen(digit) > 10) ok = 0;
            for (; ok && *digit; ++digit) {
                if (*digit < '0' || *digit > '9') ok = 0;
                else amount = amount * 10 + (uint64_t)(*digit - '0');
            }
        } else ok = 0;
    }
    fclose(file);
    if (!ok || kind < 0 || amount < 1 || amount > 0xffffffffull) return 0;
    currency_amount = (uint32_t)amount;
    InterlockedExchange(&currency_kind, kind);
    InterlockedExchange(&currency_silent, silent);
    InterlockedExchange(&currency_result, CURRENCY_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void currency_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&currency_state, 0, 0) != 2 || !currency_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "currency=%s\namount=%lu\ncalls=%ld\nresult=%s\n",
                currency_names[InterlockedCompareExchange(&currency_kind, 0, 0)], (unsigned long)currency_amount,
                (long)InterlockedCompareExchange(&currency_calls, 0, 0),
                currency_result_names[InterlockedCompareExchange(&currency_result, 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&currency_state, 0);
}
