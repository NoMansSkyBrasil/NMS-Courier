#ifndef COURIER_FREIGHTER_OFFER_179666_H
#define COURIER_FREIGHTER_OFFER_179666_H

#include <stdint.h>
#include "currency_reward_179666.h"

int courier_dispatch_free_freighter_offer_with(
    void *manager, courier_give_generic_reward_fn give_reward);
int courier_dispatch_free_freighter_offer(uintptr_t executable_base);

#endif
