// Starship domain of the build 180836 research profile: get a new starship of a chosen kind, seed
// and class through the game's own specific-ship reward and offer screen (obtain_request.h). The
// in-place changes of an owned ship are in ship_inventory.h. Included once by profile_core.c.
//
// Fields of the game's specific-ship reward, each verified offline against the 78 single-ship
// rewards of the reward table (docs/SHIP_AND_MULTITOOL_OBTAIN_NOTES.md): class at +0x40, seed at
// +0x1e8, the game's ship type at +0x248.

static const obtain_model ship_obtain_models[] = {
    {"fighter", "COURIER_SHIP_FGT", 2},
    {"hauler", "COURIER_SHIP_DRP", 1},
    {"explorer", "COURIER_SHIP_SCI", 3},
    {"shuttle", "COURIER_SHIP_SHT", 4},
    {"solar", "COURIER_SHIP_SAL", 8}
};

static obtain_domain ship_obtain = {
    .file_kind = L"ship",
    .class_hash = 0x8a37c4a2u,
    .size = 0x250,
    .seed_offset = 0x1e8,
    .class_offset = 0x40,
    .type_offset = 0x248,
    .models = ship_obtain_models,
    .model_count = sizeof(ship_obtain_models) / sizeof(ship_obtain_models[0]),
    .model = -1
};
