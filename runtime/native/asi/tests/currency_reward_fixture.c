#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "currency_reward_179666.h"

static int called = 0;
static const char *expected_id = NULL;

static uint8_t mock_reward(void *manager, const char *reward_id,
                           const char *mission_id, const void *seed,
                           uint8_t peek, uint8_t force_show_message,
                           uint64_t *out_multi_product_count,
                           uint8_t force_silent, int32_t inventory_choice_override,
                           uint8_t use_mining_modifier) {
    if (!manager || strcmp(reward_id, expected_id) != 0 || mission_id[0] != 0 ||
        memcmp(seed, (unsigned char[16]){0}, 16) != 0 || peek != 0 ||
        force_show_message != 1 || !out_multi_product_count ||
        force_silent != 0 || inventory_choice_override != -1 ||
        use_mining_modifier != 0) return 0;
    ++called;
    return 1;
}

int main(void) {
    unsigned char manager = 0;
    static const char *const ids[] = {
        "COURIER_UNITS", "COURIER_NANITE", "COURIER_QS"
    };
    for (int index = 0; index < COURIER_CURRENCY_COUNT; ++index) {
        expected_id = ids[index];
        if (!courier_dispatch_currency_reward_with(
                &manager, mock_reward, (enum courier_currency_reward)index)) return 2;
    }
    if (called != COURIER_CURRENCY_COUNT) return 3;
    if (courier_dispatch_currency_reward_with(&manager, mock_reward,
                                              COURIER_CURRENCY_COUNT)) return 4;
    puts("currency_reward_fixture=passed");
    return 0;
}
