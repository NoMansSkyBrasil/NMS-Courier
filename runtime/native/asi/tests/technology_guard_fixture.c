// Checks the technology domain's refusal rules against synthetic definitions. No game is involved.
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>

#define MANAGER_POINTER_RVA 0u
static int writable_range(uintptr_t address, size_t length) { (void)address; (void)length; return 0; }
#include "../technology_learn_180836.h"

static uint8_t definition[TECHNOLOGY_DEFINITION_SIZE];

static const uint8_t *make(const char *id, int32_t category, int broken, int template, int procedural,
                           int repair, int teach, int wiki) {
    memset(definition, 0, sizeof(definition));
    strncpy((char *)definition + TECHNOLOGY_ID_OFFSET, id, 16);
    *(int32_t *)(definition + TECHNOLOGY_CATEGORY_OFFSET) = category;
    definition[TECHNOLOGY_BROKEN_SLOT_OFFSET] = (uint8_t)broken;
    definition[TECHNOLOGY_TEMPLATE_OFFSET] = (uint8_t)template;
    definition[TECHNOLOGY_PROCEDURAL_OFFSET] = (uint8_t)procedural;
    definition[TECHNOLOGY_REPAIR_OFFSET] = (uint8_t)repair;
    definition[TECHNOLOGY_TEACH_OFFSET] = (uint8_t)teach;
    definition[TECHNOLOGY_WIKI_OFFSET] = (uint8_t)wiki;
    return definition;
}

static int failures;
static void expect(const char *label, LONG actual, LONG wanted) {
    if (actual != wanted) {
        printf("FAIL %s: got %ld, wanted %ld\n", label, (long)actual, (long)wanted);
        ++failures;
    }
}

int main(void) {
    // Ordinary learnable entries pass.
    expect("suit upgrade", technology_blocked(make("UT_JET", 2, 0, 0, 0, 0, 1, 1), "UT_JET"), TECHNOLOGY_PENDING);
    expect("exocraft, not taught by flag", technology_blocked(make("VEHICLE_GUN", 8, 0, 0, 0, 0, 0, 1), "VEHICLE_GUN"), TECHNOLOGY_PENDING);
    expect("cosmetic", technology_blocked(make("T_SHIP_GOLD", 14, 0, 0, 0, 0, 0, 0), "T_SHIP_GOLD"), TECHNOLOGY_PENDING);
    // Structural refusals, including for IDs no list has ever seen.
    expect("damaged slot", technology_blocked(make("NEWTHING1", 0, 1, 0, 0, 0, 0, 0), "NEWTHING1"), TECHNOLOGY_BLOCKED_DAMAGED);
    expect("maintenance", technology_blocked(make("NEWTHING2", 7, 0, 0, 0, 0, 0, 0), "NEWTHING2"), TECHNOLOGY_BLOCKED_MAINTENANCE);
    expect("template", technology_blocked(make("NEWTHING3", 1, 0, 1, 0, 0, 0, 0), "NEWTHING3"), TECHNOLOGY_BLOCKED_TEMPLATE);
    expect("procedural", technology_blocked(make("NEWTHING4", 1, 0, 0, 1, 0, 0, 0), "NEWTHING4"), TECHNOLOGY_BLOCKED_TEMPLATE);
    expect("repair", technology_blocked(make("NEWTHING5", 1, 0, 0, 0, 1, 1, 1), "NEWTHING5"), TECHNOLOGY_BLOCKED_REPAIR);
    // Absent from the game catalogue is not a reason to refuse (owner decision, 2026-10-07).
    expect("hidden", technology_blocked(make("FLAME", 1, 0, 0, 0, 0, 1, 0), "FLAME"), TECHNOLOGY_PENDING);
    // A definition that does not look like one is never passed to the game.
    expect("wrong id", technology_blocked(make("UT_JET", 2, 0, 0, 0, 0, 1, 1), "UT_JUMP"), TECHNOLOGY_BLOCKED_LAYOUT);
    expect("bad category", technology_blocked(make("UT_JET", 99, 0, 0, 0, 0, 1, 1), "UT_JET"), TECHNOLOGY_BLOCKED_LAYOUT);
    expect("bad flag", technology_blocked(make("UT_JET", 2, 0, 0, 0, 0, 7, 1), "UT_JET"), TECHNOLOGY_BLOCKED_LAYOUT);
    // Permanent ID rules.
    static const char *const blocked[] = {"SHIPSLOT_DMG1", "SHIPEASY_DMG4", "WEAPSLOT_DMG12", "WEAPSENT_DMG2",
                                          "WEAPEASY_DMG1", "MAINT_TECH25", "MAINT_NEWTHING", "EXOPOD_TECH3",
                                          "SUIT_DMG9", "OBSOLETE", "SPIDERBRAIN", "X_BROKEN_Y"};
    static const char *const allowed[] = {"UT_JET", "HYPERDRIVE", "LAUNCHER", "SHIPJUMP1", "BOLT", "LASER",
                                          "F_HYPERDRIVE", "T_BOBBLE_ATLAS", "MECH_ENGINE", "STRONGLASER",
                                          "DUMMY_SCAN", "PHOTONIX_CORE", "F_LIFESUPP", "LAUNCHER_SPEC",
                                          "SHIPJUMP_SPEC", "HYPERDRIVE_SPEC", "SHIP_LIFESUP", "BOLT_SM",
                                          "LASER_XO", "FLAME"};
    for (unsigned index = 0; index < sizeof(blocked) / sizeof(blocked[0]); ++index)
        expect(blocked[index], technology_blocked_id(blocked[index]), 1);
    for (unsigned index = 0; index < sizeof(allowed) / sizeof(allowed[0]); ++index)
        expect(allowed[index], technology_blocked_id(allowed[index]), 0);
    // With no resolved routines every request is refused without touching a manager.
    memcpy(technology_ids[0], "UT_JET", 7);
    InterlockedExchange(&technology_count, 1);
    technology_apply_request();
    expect("unresolved apply", technology_results[0], TECHNOLOGY_BLOCKED_LAYOUT);
    expect("state after apply", technology_state, 2);
    (void)technology_read_request;
    (void)technology_write_result;
    printf(failures ? "technology guard fixture FAILED\n" : "technology guard fixture passed\n");
    return failures != 0;
}
