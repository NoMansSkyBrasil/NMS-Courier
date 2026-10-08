// Currency domain of the build 180836 research profile: the reward IDs of the currency rewards data
// file (runtime/mods/currency_rewards). The game's own reward routine gives the money and shows its
// notification; shipped_reward_dispatch.h puts these IDs on the list of rewards that may be
// requested. Included once by profile_core.c.

#define CURRENCY_REWARD_IDS \
    "CR_UNITS_1M", "CR_UNITS_10M", "CR_UNITS_100M", "CR_UNITS_1B", \
    "CR_NANITE_1K", "CR_NANITE_10K", "CR_NANITE_100K", "CR_NANITE_1M", \
    "CR_QS_1K", "CR_QS_10K", "CR_QS_100K", "CR_QS_1M"
