#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "freighter_offer_179666.h"

int courier_currency_reward_target(uintptr_t executable_base) {
    (void)executable_base;
    return 0;
}

static int calls = 0;
static uint8_t mock_reward(void *manager, const char *reward_id,
                           const char *mission_id, const void *seed,
                           uint8_t peek, uint8_t force_show_message,
                           uint64_t *out_multi_product_count,
                           uint8_t force_silent, int32_t inventory_choice_override,
                           uint8_t use_mining_modifier) {
    if (!manager || strcmp(reward_id, "FREIGHT_REWARD") != 0 ||
        mission_id[0] != 0 || memcmp(seed, (unsigned char[16]){0}, 16) != 0 ||
        peek != 0 || force_show_message != 1 || !out_multi_product_count ||
        force_silent != 0 || inventory_choice_override != -1 ||
        use_mining_modifier != 0) return 0;
    ++calls;
    return 1;
}

int main(void) {
    unsigned char manager = 0;
    if (courier_dispatch_free_freighter_offer_with(NULL, mock_reward)) return 2;
    if (courier_dispatch_free_freighter_offer_with(&manager, NULL)) return 3;
    if (!courier_dispatch_free_freighter_offer_with(&manager, mock_reward)) return 4;
    if (calls != 1) return 5;
    puts("freighter_offer_fixture=passed");
    return 0;
}
