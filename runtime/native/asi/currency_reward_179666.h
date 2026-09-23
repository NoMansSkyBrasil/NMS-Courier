#ifndef COURIER_CURRENCY_REWARD_179666_H
#define COURIER_CURRENCY_REWARD_179666_H

#include <stdint.h>

enum courier_currency_reward {
    COURIER_CURRENCY_UNITS = 0,
    COURIER_CURRENCY_NANITES = 1,
    COURIER_CURRENCY_QUICKSILVER = 2,
    COURIER_CURRENCY_COUNT = 3
};

typedef uint8_t (*courier_give_generic_reward_fn)(
    void *manager, const char *reward_id, const char *mission_id,
    const void *seed, uint8_t peek, uint8_t force_show_message,
    uint64_t *out_multi_product_count, uint8_t force_silent,
    int32_t inventory_choice_override, uint8_t use_mining_modifier);

int courier_currency_reward_target(uintptr_t executable_base);
int courier_dispatch_currency_reward_with(void *manager,
                                          courier_give_generic_reward_fn give_reward,
                                          enum courier_currency_reward currency);
int courier_dispatch_currency_reward(uintptr_t executable_base,
                                     enum courier_currency_reward currency);

#endif
