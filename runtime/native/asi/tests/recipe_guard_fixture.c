// Checks the recipe domain's guards against synthetic data. No game is involved.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>

#define MANAGER_POINTER_RVA 0u
static int writable_range(uintptr_t address, size_t length) { (void)address; (void)length; return 0; }
#include "../profile_180836/recipe_learn.h"

static int failures;
static void expect(const char *label, long actual, long wanted) {
    if (actual != wanted) {
        printf("FAIL %s: got %ld, wanted %ld\n", label, actual, wanted);
        ++failures;
    }
}

static int valid(const char *text) {
    char id[RECIPE_ID_SIZE] = {0};
    strncpy(id, text, RECIPE_ID_SIZE);
    return recipe_valid_id(id);
}

// A stand-in manager and player state holding one side list and one known vector.
static uint8_t manager[0x4c6000];
static uint8_t player_state[0x18800];
static char side_list[3][16];
static char known_list[4][16];

static int settled(int listed, int known) {
    *(const void **)(manager + RECIPE_DEFAULT_TECH_LIST_OFFSET) = side_list;
    *(int32_t *)(manager + RECIPE_DEFAULT_TECH_LIST_OFFSET + 8) = listed;
    *(uint32_t *)(player_state + RECIPE_KNOWN_TECH_VECTOR_OFFSET + 4) = (uint32_t)known;
    *(const void **)(player_state + RECIPE_KNOWN_TECH_VECTOR_OFFSET + 8) = known_list;
    return recipe_side_list_settled((uintptr_t)manager, RECIPE_DEFAULT_TECH_LIST_OFFSET, player_state,
                                    RECIPE_KNOWN_TECH_VECTOR_OFFSET);
}

int main(void) {
    expect("refiner id", valid("REFINERECIPE_402"), 1);
    expect("cooking id", valid("RECIPE_1"), 1);
    expect("empty id", valid(""), 0);
    expect("lower case", valid("recipe_1"), 0);
    expect("space", valid("RECIPE 1"), 0);
    char full[RECIPE_ID_SIZE];
    memset(full, 'A', sizeof(full));
    expect("no terminator", recipe_valid_id(full), 0);
    char dirty[RECIPE_ID_SIZE] = "RECIPE_1";
    dirty[20] = 'X';
    expect("text after terminator", recipe_valid_id(dirty), 0);

    strcpy(side_list[0], "LAUNCHER"); strcpy(side_list[1], "SCAN1"); strcpy(side_list[2], "BOLT");
    strcpy(known_list[0], "BOLT"); strcpy(known_list[1], "SCAN1"); strcpy(known_list[2], "LAUNCHER");
    strcpy(known_list[3], "LASER");
    expect("empty side list", settled(0, 0), 1);
    expect("all listed are known", settled(3, 4), 1);
    expect("one listed is unknown", settled(3, 2), 0);
    expect("nothing known", settled(1, 0), 0);
    expect("negative count", settled(-1, 4), 0);
    expect("implausible count", settled(RECIPE_SIDE_LIST_LIMIT + 1, 4), 0);

    // With no resolved routines a request changes nothing and reports that no table was read.
    InterlockedExchange(&recipe_all, 1);
    recipe_apply_request();
    expect("unresolved table count", recipe_result[0], -1);
    expect("unresolved sent", recipe_result[1], 0);
    expect("state after apply", recipe_state, 2);
    (void)recipe_read_request;
    (void)recipe_write_result;
    printf(failures ? "recipe guard fixture FAILED\n" : "recipe guard fixture passed\n");
    return failures != 0;
}
