// Shared by the item domains of the build 180836 research profile: the layout of one inventory store
// and the helpers that act on a store whatever it belongs to. Included once by profile_core.c.
// Nothing here knows about freighters, ships, multitools or the exosuit.

#define STAT_GENERATOR_RVA 0x4ceab0u
#define VECTOR_GROW_RVA 0x2bf95c0u
#define VECTOR_GROW_CALLBACK_RVA 0x2bf9f00u
#define STORE_SPECIAL_VECTOR 0xc0u
#define SPECIAL_SLOT_TECH_BONUS 4
#define STORE_CLASS_OFFSET 0x100u
#define STORE_SIZE 0x248u
#define CLASS_COUNT 4
#define FULL_GRID_WIDTH 10
#define FULL_GRID_HEIGHT 12

typedef void (*stat_generator_fn)(void *store, uint32_t inventory_type, void *seed, int32_t item_class,
                                  uint32_t argument_5, uint32_t argument_6, uint64_t argument_7,
                                  uint8_t minimum_values);
// Argument list copied from the native append sites of the special-slot vector.
typedef void *(*vector_grow_fn)(void *vector, void *callback, uint32_t new_count, void *data, uint64_t count,
                                const void *element, uint64_t one, uint64_t zero_1, uint64_t zero_2,
                                uint64_t element_size, uint64_t alignment, uint32_t minus_one, void *data_again,
                                uint64_t zero_3);
typedef struct { uint64_t value; uint64_t valid; } seed_pair;
typedef struct { int32_t x, y, type; } special_slot;
typedef struct { uint32_t capacity, count; special_slot *data; } special_vector;

static stat_generator_fn stat_generator;
static vector_grow_fn vector_grow;
static void *vector_grow_callback;
static volatile LONG super_added = -1;
static volatile LONG super_errors;
static volatile LONG grid[6] = {-1, -1, -1, -1, -1, -1};  // main w,h,count then technology w,h,count
// Class results of the last item whose class was set, one value per store.
static volatile LONG applied_count;
static volatile LONG rejected_item;
static volatile LONG applied_class = -1;
static volatile LONG class_before[3] = {-1, -1, -1};
static volatile LONG class_after[3] = {-1, -1, -1};

// Mark every valid slot of a store as a technology-bonus special slot.
static void add_special_slots(uint8_t *store) {
    const uint64_t *rows = (const uint64_t *)store;
    int16_t width = *(const int16_t *)(store + 0x80), height = *(const int16_t *)(store + 0x82);
    special_vector *vector = (special_vector *)(store + STORE_SPECIAL_VECTOR);
    LONG added = 0;
    if (width < 1 || width > 16 || height < 1 || height > 16) { InterlockedIncrement(&super_errors); return; }
    for (int32_t y = 0; y < height; ++y) for (int32_t x = 0; x < width; ++x) {
        if (!(rows[y] >> x & 1)) continue;
        int present = 0;
        for (uint32_t index = 0; index < vector->count && !present; ++index)
            present = vector->data[index].x == x && vector->data[index].y == y &&
                      vector->data[index].type == SPECIAL_SLOT_TECH_BONUS;
        if (present) continue;
        special_slot slot = {x, y, SPECIAL_SLOT_TECH_BONUS};
        uint32_t before = vector->count;
        if (before < vector->capacity) {
            vector->data[before] = slot;
            vector->count = before + 1;
        } else {
            vector->data = vector_grow(vector, vector_grow_callback, before + 1, vector->data, before, &slot,
                                       1, 0, 0, sizeof(slot), 4, 0xffffffffu, vector->data, 0);
        }
        // Stop at the first append that did not behave as the native sites expect.
        if (vector->count != before + 1 || !vector->data) { InterlockedIncrement(&super_errors); break; }
        ++added;
    }
    InterlockedExchange(&super_added, added);
}

// A store is accepted for an in-place change only when its header is self-consistent: grid inside
// sixteen by sixteen, rows inside the width, no rows past the height, slot count equal to the set bits.
__attribute__((unused)) static int consistent_store(const uint8_t *store, int any_count) {
    if (!writable_range((uintptr_t)store, STORE_SIZE)) return 0;
    const uint64_t *rows = (const uint64_t *)store;
    int16_t width = *(const int16_t *)(store + 0x80), height = *(const int16_t *)(store + 0x82);
    int16_t count = *(const int16_t *)(store + 0x84);
    if (width < 1 || width > 16 || height < 1 || height > 16 || *(const uint32_t *)(store + STORE_CLASS_OFFSET) > 3)
        return 0;
    int bits = 0;
    for (int y = 0; y < 16; ++y) {
        if (y >= height ? rows[y] != 0 : (rows[y] >> width) != 0) return 0;
        bits += __builtin_popcountll(rows[y]);
    }
    return any_count || bits == count;
}

// Make every position of a ten by twelve grid valid. Existing elements keep their positions; this writes
// the same header fields the native layout step produces for a full grid, without calling it.
__attribute__((unused)) static void fill_store_grid(uint8_t *store) {
    uint64_t *rows = (uint64_t *)store;
    for (int y = 0; y < 16; ++y) rows[y] = y < FULL_GRID_HEIGHT ? (1ull << FULL_GRID_WIDTH) - 1 : 0;
    *(int16_t *)(store + 0x80) = FULL_GRID_WIDTH;
    *(int16_t *)(store + 0x82) = FULL_GRID_HEIGHT;
    *(int16_t *)(store + 0x84) = FULL_GRID_WIDTH * FULL_GRID_HEIGHT;
}
