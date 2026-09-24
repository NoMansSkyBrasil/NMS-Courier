#include <assert.h>
#include <stdint.h>
#include <string.h>

#include "../scoped_freighter_table_179666.h"

#define GENERATION_OFFSET (0x5e0u + 0x1du * 0x54u)
#define PROBABILITIES_OFFSET 0x1a54u

static unsigned char table[0x1aa0];
static int callback_count;

static void set_i32(size_t offset, int32_t value) {
    memcpy(table + offset, &value, sizeof(value));
}

static int32_t get_i32(size_t offset) {
    int32_t value;
    memcpy(&value, table + offset, sizeof(value));
    return value;
}

static int observe_scoped_values(void *context) {
    assert(context == table);
    callback_count++;
    assert(get_i32(GENERATION_OFFSET + 0x40) == 120);
    assert(get_i32(GENERATION_OFFSET + 0x44) == 60);
    assert(get_i32(GENERATION_OFFSET + 0x4c) == 120);
    assert(get_i32(GENERATION_OFFSET + 0x50) == 60);
    for (size_t group = 0; group < 4; group++) {
        float chances[4];
        memcpy(chances, table + PROBABILITIES_OFFSET + group * sizeof(chances),
               sizeof(chances));
        assert(chances[0] == 0.0f && chances[1] == 0.0f &&
               chances[2] == 0.0f && chances[3] == 100.0f);
    }
    return 1;
}

int main(void) {
    static const float original_probabilities[4][4] = {
        {60.0f, 30.0f, 10.0f, 0.0f},
        {49.0f, 35.0f, 15.0f, 1.0f},
        {30.0f, 40.0f, 28.0f, 2.0f},
        {5.0f, 5.0f, 5.0f, 5.0f}
    };
    set_i32(GENERATION_OFFSET + 0x40, 48);
    set_i32(GENERATION_OFFSET + 0x44, 30);
    set_i32(GENERATION_OFFSET + 0x4c, 35);
    set_i32(GENERATION_OFFSET + 0x50, 18);
    memcpy(table + PROBABILITIES_OFFSET, original_probabilities,
           sizeof(original_probabilities));
    unsigned char original[sizeof(table)];
    memcpy(original, table, sizeof(original));

    assert(courier_with_scoped_freighter_generation(table,
                                                    observe_scoped_values,
                                                    table) == 1);
    assert(callback_count == 1);
    assert(memcmp(table, original, sizeof(table)) == 0);

    set_i32(GENERATION_OFFSET + 0x4c, 36);
    memcpy(original, table, sizeof(original));
    assert(courier_with_scoped_freighter_generation(table,
                                                    observe_scoped_values,
                                                    table) == 0);
    assert(callback_count == 1);
    assert(memcmp(table, original, sizeof(table)) == 0);
    return 0;
}
