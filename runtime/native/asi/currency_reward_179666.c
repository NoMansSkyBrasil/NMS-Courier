#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <string.h>

#include "currency_reward_179666.h"
#include "inventory_snapshot_179666.h"

#define COURIER_GIVE_REWARD_RVA 0x00f0bd70u
#define COURIER_REWARD_MANAGER_RVA 0x070f4c60u

static const char *const reward_ids[COURIER_CURRENCY_COUNT] = {
    "COURIER_UNITS", "COURIER_NANITE", "COURIER_QS"
};

int courier_currency_reward_target(uintptr_t executable_base) {
    static const unsigned char expected[] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c,
        0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x57,
        0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xec, 0x70
    };
    if (!executable_base ||
        executable_base > UINTPTR_MAX - COURIER_REWARD_MANAGER_RVA) return 0;
    const void *target = (const void *)(executable_base + COURIER_GIVE_REWARD_RVA);
    const void *manager = (const void *)(executable_base + COURIER_REWARD_MANAGER_RVA);
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery(manager, &memory, sizeof(memory)) != sizeof(memory) ||
        memory.State != MEM_COMMIT ||
        (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) ||
        ((memory.Protect & 0xff) != PAGE_READWRITE &&
         (memory.Protect & 0xff) != PAGE_EXECUTE_READWRITE)) return 0;
    return courier_readable_range(target, sizeof(expected)) &&
           memcmp(target, expected, sizeof(expected)) == 0 &&
           courier_readable_range(manager, 1);
}

int courier_dispatch_currency_reward_with(void *manager,
                                          courier_give_generic_reward_fn give_reward,
                                          enum courier_currency_reward currency) {
    if (!manager || !give_reward || currency < COURIER_CURRENCY_UNITS ||
        currency >= COURIER_CURRENCY_COUNT) return 0;
    char reward_id[16] = {0};
    char mission_id[16] = {0};
    unsigned char seed[16] = {0};
    uint64_t multi_product_count = 0;
    memcpy(reward_id, reward_ids[currency], strlen(reward_ids[currency]));
    give_reward(manager, reward_id, mission_id, seed, 0, 1,
                &multi_product_count, 0, -1, 0);
    return 1;
}

int courier_dispatch_currency_reward(uintptr_t executable_base,
                                     enum courier_currency_reward currency) {
    if (!courier_currency_reward_target(executable_base)) return 0;
    return courier_dispatch_currency_reward_with(
        (void *)(executable_base + COURIER_REWARD_MANAGER_RVA),
        (courier_give_generic_reward_fn)(executable_base + COURIER_GIVE_REWARD_RVA),
        currency);
}
