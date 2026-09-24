#include <stdint.h>
#include <string.h>

#include "scoped_freighter_table_179666.h"

#define GENERATION_OFFSET (0x5e0u + 0x1du * 0x54u)
#define PROBABILITIES_OFFSET 0x1a54u

static int32_t read_i32(const unsigned char *bytes, size_t offset) {
    int32_t result;
    memcpy(&result, bytes + offset, sizeof(result));
    return result;
}

static void write_i32(unsigned char *bytes, size_t offset, int32_t value) {
    memcpy(bytes + offset, &value, sizeof(value));
}

int courier_with_scoped_freighter_generation(void *inventory_table,
                                             courier_scoped_reward_fn reward,
                                             void *context) {
    if (!inventory_table || !reward) return 0;
    unsigned char *table = inventory_table;
    unsigned char original_generation[0x54];
    unsigned char original_probabilities[0x40];
    static const float expected_probabilities[4][4] = {
        {60.0f, 30.0f, 10.0f, 0.0f},
        {49.0f, 35.0f, 15.0f, 1.0f},
        {30.0f, 40.0f, 28.0f, 2.0f},
        {5.0f, 5.0f, 5.0f, 5.0f}
    };
    memcpy(original_generation, table + GENERATION_OFFSET, sizeof(original_generation));
    memcpy(original_probabilities, table + PROBABILITIES_OFFSET,
           sizeof(original_probabilities));
    if (read_i32(original_generation, 0x4c) != 35 ||
        read_i32(original_generation, 0x40) != 48 ||
        read_i32(original_generation, 0x50) != 18 ||
        read_i32(original_generation, 0x44) != 30 ||
        memcmp(original_probabilities, expected_probabilities,
               sizeof(original_probabilities)) != 0) return 0;

    unsigned char test_generation[sizeof(original_generation)];
    unsigned char test_probabilities[sizeof(original_probabilities)];
    memcpy(test_generation, original_generation, sizeof(test_generation));
    write_i32(test_generation, 0x40, 120);
    write_i32(test_generation, 0x44, 60);
    write_i32(test_generation, 0x4c, 120);
    write_i32(test_generation, 0x50, 60);
    for (size_t group = 0; group < 4; ++group) {
        const float only_s[4] = {0.0f, 0.0f, 0.0f, 100.0f};
        memcpy(test_probabilities + group * sizeof(only_s), only_s,
               sizeof(only_s));
    }

    memcpy(table + GENERATION_OFFSET, test_generation, sizeof(test_generation));
    memcpy(table + PROBABILITIES_OFFSET, test_probabilities,
           sizeof(test_probabilities));
    int dispatched = reward(context);
    memcpy(table + PROBABILITIES_OFFSET, original_probabilities,
           sizeof(original_probabilities));
    memcpy(table + GENERATION_OFFSET, original_generation,
           sizeof(original_generation));
    return dispatched &&
           memcmp(table + GENERATION_OFFSET, original_generation,
                  sizeof(original_generation)) == 0 &&
           memcmp(table + PROBABILITIES_OFFSET, original_probabilities,
                  sizeof(original_probabilities)) == 0;
}
