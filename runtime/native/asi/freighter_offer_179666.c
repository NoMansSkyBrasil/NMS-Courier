#include <stdint.h>
#include <string.h>

#include "freighter_offer_179666.h"

#define COURIER_GIVE_REWARD_RVA 0x00f0bd70u
#define COURIER_REWARD_MANAGER_RVA 0x070f4c60u

int courier_dispatch_free_freighter_offer_with(
    void *manager, courier_give_generic_reward_fn give_reward) {
    if (!manager || !give_reward) return 0;
    char reward_id[16] = {0};
    char mission_id[16] = {0};
    unsigned char seed[16] = {0};
    uint64_t multi_product_count = 0;
    memcpy(reward_id, "FREIGHT_REWARD", sizeof("FREIGHT_REWARD") - 1);
    give_reward(manager, reward_id, mission_id, seed, 0, 1,
                &multi_product_count, 0, -1, 0);
    return 1;
}

int courier_dispatch_free_freighter_offer(uintptr_t executable_base) {
    if (!courier_currency_reward_target(executable_base)) return 0;
    return courier_dispatch_free_freighter_offer_with(
        (void *)(executable_base + COURIER_REWARD_MANAGER_RVA),
        (courier_give_generic_reward_fn)(executable_base + COURIER_GIVE_REWARD_RVA));
}
