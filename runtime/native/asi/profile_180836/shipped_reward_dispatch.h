// Shared by the domains of the build 180836 research profile that start a shipped game reward: one
// dispatch of a reward ID through the game's own reward routine, on the game's update thread. The IDs
// themselves are named by the domain files; only IDs on the compiled-in list can be requested by file.
// Included once by profile_core.c.

#define GIVE_REWARD_RVA 0xf140f0u
#define REWARD_MANAGER_RVA 0x7207900u

typedef uint8_t (*give_reward_fn)(void *manager, const char *reward_id, const char *mission_id,
                                  const void *seed, uint8_t peek, uint8_t force_show_message,
                                  uint64_t *out_multi_product_count, uint8_t force_silent,
                                  int32_t inventory_choice_override, uint8_t use_mining_modifier);

static give_reward_fn give_reward;
static void *reward_manager;
static volatile LONG dispatch_state;      // 0 unused, 1 requested, 2 calling, 3 returned
static volatile LONG dispatch_choice;     // 0 freighter offer reward, 1 corvette build reward, 2 listed reward
static volatile LONG request_errors;
// Shipped rewards that change an owned item in place through the game's own flow (class step, added
// slots). Only these IDs can be requested by the "reward" event; the ID comes from a per-process file.
static const char *const listed_rewards[] = {
    MULTITOOL_CLASS_REWARD_ID, SHIP_CLASS_REWARD_ID, "R_ROGUE_CLASS", SHIP_SLOT_REWARD_CASH_ID,
    SHIP_SLOT_REWARD_PRODUCT_ID, MULTITOOL_SLOT_REWARD_CASH_ID, MULTITOOL_SLOT_REWARD_PRODUCT_ID,
    EXOSUIT_SLOT_REWARD_ID, "R_INVBOX", "R_ROGUE_INV", FREIGHTER_SLOT_REWARD_ID,
    CURRENCY_REWARD_IDS
};
static volatile LONG listed_reward_index = -1;

// Read the requested reward ID from the per-process file and accept it only when it is on the list.
static int read_reward_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-reward-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) < 0) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64] = {0};
    char *read = fgets(line, sizeof(line), file);
    fclose(file);
    if (!read) return 0;
    line[strcspn(line, "\r\n")] = 0;
    for (LONG index = 0; index < (LONG)(sizeof(listed_rewards) / sizeof(listed_rewards[0])); ++index)
        if (strcmp(line, listed_rewards[index]) == 0) {
            InterlockedExchange(&listed_reward_index, index);
            return 1;
        }
    return 0;
}

// Runs on the game's update thread: the one requested dispatch.
static void dispatch_requested_reward(void) {
    char reward_id[16] = {0}, mission_id[16] = {0};
    unsigned char seed[16] = {0};
    uint64_t multi_product_count = 0;
    LONG choice = InterlockedCompareExchange(&dispatch_choice, 0, 0);
    LONG listed = InterlockedCompareExchange(&listed_reward_index, 0, 0);
    if (choice == 2 && listed >= 0 && listed < (LONG)(sizeof(listed_rewards) / sizeof(listed_rewards[0])))
        memcpy(reward_id, listed_rewards[listed], strlen(listed_rewards[listed]));
    else if (choice == 1)
        memcpy(reward_id, CORVETTE_BUILD_REWARD_ID, sizeof(CORVETTE_BUILD_REWARD_ID) - 1);
    else
        memcpy(reward_id, FREIGHTER_OFFER_REWARD_ID, sizeof(FREIGHTER_OFFER_REWARD_ID) - 1);
    give_reward(reward_manager, reward_id, mission_id, seed, 0, 1, &multi_product_count, 0, -1, 0);
    InterlockedExchange(&dispatch_state, 3);
}
