#ifndef COURIER_SCOPED_FREIGHTER_TABLE_179666_H
#define COURIER_SCOPED_FREIGHTER_TABLE_179666_H

typedef int (*courier_scoped_reward_fn)(void *context);

int courier_with_scoped_freighter_generation(void *inventory_table,
                                             courier_scoped_reward_fn reward,
                                             void *context);

#endif
