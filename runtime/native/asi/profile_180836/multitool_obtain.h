// Multi-tool domain of the build 180836 research profile: get a new multi-tool of a chosen kind,
// seed and class through the game's own specific-weapon reward and offer screen
// (obtain_request.h). The in-place changes of the equipped multi-tool are in
// multitool_inventory.h. Included once by profile_core.c.
//
// Fields of the game's specific-weapon reward, each verified offline against the 41 single-weapon
// rewards of the reward table (docs/SHIP_AND_MULTITOOL_OBTAIN_NOTES.md): class at +0x40,
// generation seed at +0x190, the game's weapon type at +0x1bc.

static const obtain_model multitool_obtain_models[] = {
    {"pistol", "COURIER_TOOL_PST", 0},
    {"rifle", "COURIER_TOOL_RFL", 1},
    {"experimental", "COURIER_TOOL_EXP", 2},
    {"alien", "COURIER_TOOL_ALN", 3},
    {"staff", "COURIER_TOOL_STF", 9}
};

// The places where the game builds the offered multi-tool without the legacy colours flag, all
// inside 8e58e0: before each call of the palette builder 1149f50 (taken when a part description is
// given) and before the scene loader 639be0 (taken by the reward, which gives none).
static const obtain_offer_site multitool_offer_legacy_sites[] = {
    {0x8e5b78u, 0x20}, {0x8e5e0du, 0x20}, {0x8e5c7eu, 0x60}
};

// The accepted multi-tool, in place: every position of its technology grid usable and/or every
// usable slot supercharged, with the routines of the "owned" request. The record is changed, and so
// is the equipped multi-tool's active store when its grid is the record's: the game equips a tool it
// has just handed over and copies the active store over the record, so a change of the record alone
// would be lost. Returns 0 nothing, 1 the record, 3 both.
static LONG multitool_obtain_upgrade(uintptr_t manager, LONG slot, int slots, int supercharge) {
    LONG done = 0;
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    uint8_t *record = multitool_record_store(manager, slot), *active = multitool_equipped_store(manager);
    if (!record || !consistent_store(record, 0)) return 0;
    int same = active && consistent_store(active, 0) && memcmp(record + 0x80, active + 0x80, 3 * sizeof(int16_t)) == 0;
    if (slots) fill_store_grid(record);
    if (supercharge) add_special_slots(record);
    done = 1;
    if (same) {
        if (slots) fill_store_grid(active);
        if (supercharge) add_special_slots(active);
        done = 3;
    }
#else
    (void)manager; (void)slot; (void)slots; (void)supercharge;
#endif
    return done;
}

static obtain_domain multitool_obtain = {
    .file_kind = L"weapon",
    .class_hash = 0x5f82ff34u,
    .size = 0x1c0,
    .seed_offset = 0x190,
    .class_offset = 0x40,
    .type_offset = 0x1bc,
    .models = multitool_obtain_models,
    .model_count = sizeof(multitool_obtain_models) / sizeof(multitool_obtain_models[0]),
    .model = -1,
    // The owned multi-tool records (multitool_inventory.h) keep the seed and the legacy colours
    // flag: the game copies the saved Seed to +0x2b0 and UseLegacyColours to +0x2ad (5517ae).
    .record_offset = OWNED_WEAPON_OFFSET,
    .record_stride = OWNED_WEAPON_STRIDE,
    .record_count = OWNED_WEAPON_SLOTS,
    .record_seed_offset = 0x2b0,
    .record_legacy_offset = 0x2ad,
    .legacy = -1,
    .upgrade = multitool_obtain_upgrade,
    .offer_legacy_sites = multitool_offer_legacy_sites,
    .offer_legacy_site_count = sizeof(multitool_offer_legacy_sites) / sizeof(multitool_offer_legacy_sites[0])
};
