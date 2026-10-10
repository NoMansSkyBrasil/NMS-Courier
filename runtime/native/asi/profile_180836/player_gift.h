// Player gift domain of the build 180836 research profile: hand items to another player of the
// session through the game's own remote item transaction, the one its "transfer to player" uses.
// Included once by profile_core.c, after item_give.h.
//
// Read in the executable on 2026-10-10 (docs/PLAYER_GIFT_NOTES.md):
//   - The game state (manager + 0xe70) starts with two transaction objects. The first (virtual table
//     4a5ee00, tag "RRIT") carries cGcGameState::OnReceiveRemoteItems(player, ID, amount); the second
//     carries a creature egg and is not used here.
//   - 48ab80, called by the inventory screen, finds the chosen element and calls 4b43a0(transaction,
//     answer callback, player, ID, amount), which sends the request to that one player and keeps the
//     callback for the answer. The receiving game looks the ID up as a product or substance and adds
//     it with its own routines (48c4e0).
//   - The players are found by user identifier in two tables of pointers: four at
//     manager + 0x93aad0 + 0x58 and thirty-two at manager + 0x9371f0 + 0x58 (322500, 3217f0). A
//     player object holds its user identifier as text at +0x4178 (64 bytes).
//   - The answer is delivered by calling the kept callback (4b36f0) with a status and the accepted
//     flag; a missing callback aborts the game, so one is always supplied here.
//
// This file calls 4b43a0 with a requested ID and amount. Nothing leaves the sender's inventory: the
// item is created by the receiving game. Nothing is written by the bridge. Not exercised in the
// running game when this was written.

#define GIFT_SEND_RVA 0x4b43a0u
#define GIFT_TRANSACTION_VTABLE_RVA 0x4a5ee00u
#define GIFT_TRANSACTION_TAG 0x54495252u      // "RRIT"
#define GIFT_GAME_STATE_OFFSET 0xe70u         // from the manager object
#define GIFT_PARTY_TABLE_OFFSET (0x93aad0u + 0x58u)
#define GIFT_PARTY_SLOTS 4
#define GIFT_SESSION_TABLE_OFFSET (0x9371f0u + 0x58u)
#define GIFT_SESSION_SLOTS 32
#define GIFT_SLOTS (GIFT_PARTY_SLOTS + GIFT_SESSION_SLOTS)
#define GIFT_PLAYER_USER_OFFSET 0x4178u
#define GIFT_USER_SIZE 64
#define GIFT_MAX_AMOUNT 9999

enum {
    GIFT_PENDING = 0,
    GIFT_LISTED,          // the players of the session were listed; nothing was sent
    GIFT_SENT,            // the game's send routine was called; the answer line says what came back
    GIFT_NO_PLAYER,       // the slot holds no player
    GIFT_PLAYER_CHANGED,  // the slot holds another player than the request named
    GIFT_UNKNOWN_ID,      // neither a substance nor a product of the running game
    GIFT_BUSY,            // an earlier gift still waits for its answer
    GIFT_NOT_READY        // no game manager or no transaction object of the expected kind
};
static const char *const gift_result_names[] = {
    "pending", "listed", "sent", "no_player", "player_changed", "unknown_id", "busy", "not_ready"
};
enum { GIFT_ANSWER_NONE = 0, GIFT_ANSWER_WAITING, GIFT_ANSWER_ACCEPTED, GIFT_ANSWER_REFUSED, GIFT_ANSWER_FAILED };
static const char *const gift_answer_names[] = {"none", "waiting", "accepted", "refused", "failed"};

typedef struct { uint8_t storage[0x38]; void *implementation; } gift_function;   // the game's callback holder
typedef void (*gift_send_fn)(void *transaction, gift_function *callback, void *player, const char *id,
                             const int32_t *amount);

static struct {
    int send;
    int32_t slot, amount;
    char user[GIFT_USER_SIZE], id[17];
} gift_request;
static struct { int32_t slot; char user[GIFT_USER_SIZE]; } gift_players[GIFT_SLOTS];
static volatile LONG gift_player_count;
static volatile LONG gift_state;      // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG gift_result;
static volatile LONG gift_answer;
static volatile LONG gift_answer_dirty;
static ULONGLONG gift_sent_at;      // an answer that has not come after a minute no longer blocks

// The answer callback: an object shaped like the game's callback implementation. It is static, so
// copying and moving hand the same object back and deleting does nothing.
static void *gift_callback_same(void *self, void *where) { (void)where; return self; }
static void gift_callback_call(void *self, const int32_t *status, uint8_t **accepted) {
    (void)self;
    LONG answer = GIFT_ANSWER_FAILED;
    if (status && *status == 0 && accepted && *accepted) answer = **accepted ? GIFT_ANSWER_ACCEPTED : GIFT_ANSWER_REFUSED;
    InterlockedExchange(&gift_answer, answer);
    InterlockedExchange(&gift_answer_dirty, 1);
}
static const void *gift_callback_self(void *self) { return self; }
static void gift_callback_delete(void *self, uint8_t release) { (void)self; (void)release; }
static const void *const gift_callback_table[] = {
    (const void *)gift_callback_same, (const void *)gift_callback_same, (const void *)gift_callback_call,
    (const void *)gift_callback_self, (const void *)gift_callback_delete, (const void *)gift_callback_self
};
static const void *const *gift_callback_object = gift_callback_table;

// The player in a slot (0..3 the party table, 4..35 the session table), with its user identifier.
static void *gift_player_at(uintptr_t manager, int32_t slot, char *user) {
    if (slot < 0 || slot >= GIFT_SLOTS) return NULL;
    uintptr_t entry = slot < GIFT_PARTY_SLOTS
        ? manager + GIFT_PARTY_TABLE_OFFSET + (uintptr_t)slot * 8
        : manager + GIFT_SESSION_TABLE_OFFSET + (uintptr_t)(slot - GIFT_PARTY_SLOTS) * 8;
    if (!writable_range(entry, 8)) return NULL;
    uintptr_t player = *(const uintptr_t *)entry;
    if (!writable_range(player + GIFT_PLAYER_USER_OFFSET, GIFT_USER_SIZE)) return NULL;
    const char *text = (const char *)(player + GIFT_PLAYER_USER_OFFSET);
    size_t length = 0;
    while (length < GIFT_USER_SIZE - 1 && text[length] >= 0x21 && text[length] <= 0x7e) { user[length] = text[length]; ++length; }
    user[length] = 0;
    return length && text[length] == 0 ? (void *)player : NULL;
}

// Runs on the game's update thread.
static void gift_apply_request(void) {
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = *(const uintptr_t *)(base + MANAGER_POINTER_RVA);
    LONG result = GIFT_NOT_READY;
    LONG count = 0;
    if (manager) {
        for (int32_t slot = 0; slot < GIFT_SLOTS; ++slot) {
            char user[GIFT_USER_SIZE];
            if (!gift_player_at(manager, slot, user)) continue;
            gift_players[count].slot = slot;
            memcpy(gift_players[count].user, user, GIFT_USER_SIZE);
            ++count;
        }
        result = GIFT_LISTED;
    }
    InterlockedExchange(&gift_player_count, count);
    if (manager && gift_request.send) {
        char user[GIFT_USER_SIZE];
        void *player = gift_player_at(manager, gift_request.slot, user);
        uintptr_t slot_of_transaction = manager + GIFT_GAME_STATE_OFFSET;
        uintptr_t transaction = writable_range(slot_of_transaction, 8) ? *(const uintptr_t *)slot_of_transaction : 0;
        void *table = (void *)(manager + ITEM_TABLE_OFFSET);
        if (!player) result = GIFT_NO_PLAYER;
        else if (strcmp(user, gift_request.user) != 0) result = GIFT_PLAYER_CHANGED;
        else if (!writable_range(transaction, 0x70) ||
                 *(const uintptr_t *)transaction != base + GIFT_TRANSACTION_VTABLE_RVA ||
                 *(const uint32_t *)(transaction + 8) != GIFT_TRANSACTION_TAG) result = GIFT_NOT_READY;
        else if (InterlockedCompareExchange(&gift_answer, 0, 0) == GIFT_ANSWER_WAITING &&
                 GetTickCount64() - gift_sent_at < 60000) result = GIFT_BUSY;
        else {
            char id[16] = {0};
            memcpy(id, gift_request.id, strlen(gift_request.id));
            if (!((item_lookup_fn)(base + ITEM_SUBSTANCE_LOOKUP_RVA))(table, id) &&
                !((item_lookup_fn)(base + ITEM_PRODUCT_LOOKUP_RVA))(table, id)) result = GIFT_UNKNOWN_ID;
            else {
                gift_function callback = {{0}, (void *)&gift_callback_object};
                int32_t amount = gift_request.amount;
                InterlockedExchange(&gift_answer, GIFT_ANSWER_WAITING);
                gift_sent_at = GetTickCount64();
                ((gift_send_fn)(base + GIFT_SEND_RVA))((void *)transaction, &callback, player, id, &amount);
                result = GIFT_SENT;
            }
        }
    }
    InterlockedExchange(&gift_result, result);
    InterlockedExchange(&gift_state, 2);
}

static int gift_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-gift-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// The per-process request is "mode=list", or "mode=send" with "slot=<0..35>", "user=<identifier>",
// "item=<ID>" and "amount=<1..9999>". Anything else rejects the whole request.
static int gift_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&gift_state, 0, 0) != 0 || !gift_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[128];
    int ok = 1, mode = 0, seen = 0;
    memset(&gift_request, 0, sizeof(gift_request));
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        char *end = NULL;
        if (strcmp(line, "mode=list") == 0 && !mode) mode = 1;
        else if (strcmp(line, "mode=send") == 0 && !mode) mode = 2;
        else if (strncmp(line, "slot=", 5) == 0 && !(seen & 1)) {
            long value = strtol(line + 5, &end, 10);
            ok = end != line + 5 && !*end && value >= 0 && value < GIFT_SLOTS;
            gift_request.slot = (int32_t)value;
            seen |= 1;
        }
        else if (strncmp(line, "user=", 5) == 0 && !(seen & 2)) {
            size_t length = strlen(line + 5);
            ok = length > 0 && length < GIFT_USER_SIZE;
            if (ok) memcpy(gift_request.user, line + 5, length);
            seen |= 2;
        }
        else if (strncmp(line, "item=", 5) == 0 && !(seen & 4)) {
            size_t length = strlen(line + 5);
            ok = length > 0 && length <= 15;
            for (size_t index = 0; ok && index < length; ++index) {
                char c = line[5 + index];
                ok = (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_';
            }
            if (ok) memcpy(gift_request.id, line + 5, length);
            seen |= 4;
        }
        else if (strncmp(line, "amount=", 7) == 0 && !(seen & 8)) {
            long value = strtol(line + 7, &end, 10);
            ok = end != line + 7 && !*end && value >= 1 && value <= GIFT_MAX_AMOUNT;
            gift_request.amount = (int32_t)value;
            seen |= 8;
        }
        else ok = 0;
    }
    fclose(file);
    if (!ok || !mode || (mode == 1 && seen) || (mode == 2 && seen != 15)) return 0;
    gift_request.send = mode == 2;
    InterlockedExchange(&gift_result, GIFT_PENDING);
    return 1;
}

// Called from the worker thread: after the game thread applied a request, and again when the other
// player's answer arrives.
static void gift_write_result(void) {
    wchar_t path[MAX_PATH];
    int applied = InterlockedCompareExchange(&gift_state, 0, 0) == 2;
    int answered = InterlockedExchange(&gift_answer_dirty, 0);
    if ((!applied && !answered) || !gift_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nanswer=%s\n", gift_result_names[InterlockedCompareExchange(&gift_result, 0, 0)],
                gift_answer_names[InterlockedCompareExchange(&gift_answer, 0, 0)]);
        LONG count = InterlockedCompareExchange(&gift_player_count, 0, 0);
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "player=%d,%s,%s\n", gift_players[index].slot,
                    gift_players[index].slot < GIFT_PARTY_SLOTS ? "party" : "session", gift_players[index].user);
        fclose(file);
    }
    if (applied) InterlockedExchange(&gift_state, 0);
}
