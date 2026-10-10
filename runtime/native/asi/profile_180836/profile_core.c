// Research profile for build 180836: the core that every domain file plugs into. This file holds only
// what is common: the build check, the game addresses used by all, the hook on the game's update
// routine, the per-process events and the status file. Everything that belongs to one game domain is
// in that domain's own file, included below; plumbing shared by several domains is in a file named
// for what it is. Nothing is changed in the game unless an event was signaled. This is a research
// profile, not a production delivery adapter.
//
//   inventory_store.h              shared: one inventory store (layout, special slots, full grid)
//   ship_inventory.h               starship: owned ship stores, primary ship, ship rewards
//   multitool_inventory.h          multitool: owned multitool stores, multitool rewards
//   exosuit_inventory.h            exosuit: exosuit stores, exosuit slot reward
//   owned_inventory_request.h      shared: the in-place request over the three files above
//   purchase_setup_hooks*.h        shared: hooks on the purchase setup and layout routines
//   freighter_offer.h              freighter: offer class, scene, seeds, technology carry
//   corvette_build.h               corvette: class at build start, build-mode reward
//   shipped_reward_dispatch.h      shared: one dispatch of a shipped reward
//   technology_learn.h             technology: learn known technologies
//   recipe_learn.h                 recipes: learn refiner and cooking recipes
//   reward_redeem.h                rewards: redeem season, Twitch and platform rewards in the slot
//   fish_record.h                  fish: fill the slot's fishing record
//   teleport_request.h             travel: send the player to a system by galaxy and address
//   word_teach.h                   words: teach alien words of one race
//   rune_discover.h                glyphs: discover portal glyphs in the game's order
//   stat_level.h                   levelled stats: raise journey milestones and standings by levels
//   wiki_topic.h                   guide: unlock topics of the game's guide
//   nexus_access.h                 Nexus: allow the slot to use the Space Anomaly
//   mission_complete.h             missions: ask the game to complete named missions
//   product_learn.h                products: learn product recipes in the slot
//   item_give.h                    items: substances and products into the exosuit cargo
//   account_unlock.h               account: unlock titles, specials and season rewards on the account
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <bcrypt.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>
#include "MinHook.h"

#if !defined(COURIER_BUILD_180836) || defined(COURIER_OBSERVE_180383)
#error The research profile requires the exact build 180836 profile only
#endif

#define UPDATE_RVA 0x2d7580u
#define MANAGER_POINTER_RVA 0x6e8d708u
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
#define ARM_WINDOW_SECONDS 6u
#else
// The profile listens for as long as the game runs; a week is longer than any session.
#define ARM_WINDOW_SECONDS 604800u
#endif

typedef void (WINAPI *update_fn)(void *application);

static update_fn original_update;
static void *update_target;
static wchar_t event_base[112];

static int writable_range(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    if (!address || address > UINTPTR_MAX - length ||
        VirtualQuery((const void *)address, &memory, sizeof(memory)) != sizeof(memory)) return 0;
    uintptr_t end = (uintptr_t)memory.BaseAddress + memory.RegionSize;
    DWORD protection = memory.Protect & 0xff;
    return memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           (protection == PAGE_READWRITE || protection == PAGE_EXECUTE_READWRITE) &&
           length <= end - address;
}

#include "inventory_store.h"
#include "ship_inventory.h"
#include "multitool_inventory.h"
#include "exosuit_inventory.h"
#include "owned_inventory_request.h"
#include "purchase_setup_hooks.h"
#include "freighter_offer.h"
#include "corvette_build.h"
#include "purchase_setup_hooks_functions.h"
#include "bridge_version.h"
#include "file_signal.h"
#include "shipped_reward_dispatch.h"
#include "technology_learn.h"
#include "recipe_learn.h"
#include "reward_redeem.h"
#include "fish_record.h"
#include "product_learn.h"
#include "account_unlock.h"
#include "reward_carrier.h"
#include "obtain_request.h"
#include "ship_obtain.h"
#include "multitool_obtain.h"
#include "item_give.h"
#include "currency_reward.h"
#include "star_system.h"
#include "teleport_request.h"
#include "word_teach.h"
#include "rune_discover.h"
#include "stat_level.h"
#include "wiki_topic.h"
#include "nexus_access.h"
#include "mission_complete.h"

// One event per kind of request, after the four class events.
#define EVENT_COUNT (CLASS_COUNT + 26)

static void write_status(const char *status, MH_STATUS result) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH) return;
    int size = swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-profile-180836-%lu.log",
                        root, (unsigned long)GetCurrentProcessId());
    if (size < 0 || size >= MAX_PATH) return;
    // The startup verifier already created this diagnostics directory.
    HANDLE file = CreateFileW(path, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) return;
    char text[2048];
#define READ(value) ((long)InterlockedCompareExchange(&(value), 0, 0))
    size = snprintf(text, sizeof(text),
        "status=%s\npid=%lu\nhook_status=%d\nmode=research_profile\nbridge_version=" BRIDGE_VERSION "\nevent_base=%ls\n"
        "requested_class=%ld\ndispatch_state=%ld\nsetup_calls=%ld\nfreighter_setups=%ld\nlast_kind=%ld\n"
        "applied_count=%ld\napplied_class=%ld\nrejected_item=%ld\n"
        "class_before=%ld,%ld,%ld\nclass_after=%ld,%ld,%ld\n"
        "slots_armed=%ld\nslots_applied=%ld\nlayout_overrides=%ld\n"
        "main_grid=%ld,%ld,%ld\ntechnology_grid=%ld,%ld,%ld\n"
        "super_added=%ld\nsuper_errors=%ld\ntable_patches=%ld\ntable_rejected=%ld\n"
        "carry_pending=%d\ncarry_applied=%ld\ncarry_candidates=%ld\ncarry_seed_equal=%ld\n"
        "carry_exact_site=%ld\ncarry_callers=%lx,%lx,%lx,%lx,%lx,%lx\n"
        "model_armed=%ld\nmodel_applied=%ld\nhome_pending=%ld\nhome_applied=%ld\nrequest_errors=%ld\n"
        "owned_index=%ld\nowned_applied=%ld\nowned_rejected=%ld\n",
        status, (unsigned long)GetCurrentProcessId(), result, event_base,
        READ(requested_class), READ(dispatch_state), READ(setup_calls), READ(freighter_setups), READ(last_kind),
        READ(applied_count), READ(applied_class), READ(rejected_item),
        READ(class_before[0]), READ(class_before[1]), READ(class_before[2]),
        READ(class_after[0]), READ(class_after[1]), READ(class_after[2]),
        READ(slots_armed), READ(slots_applied), READ(layout_overrides),
        READ(grid[0]), READ(grid[1]), READ(grid[2]), READ(grid[3]), READ(grid[4]), READ(grid[5]),
        READ(super_added), READ(super_errors), READ(table_patches), READ(table_rejected),
        carry_item != 0, READ(carry_applied), READ(carry_candidates), READ(carry_seed_equal),
        READ(carry_exact_site), (unsigned long)READ(carry_trace[0]), (unsigned long)READ(carry_trace[1]),
        (unsigned long)READ(carry_trace[2]), (unsigned long)READ(carry_trace[3]),
        (unsigned long)READ(carry_trace[4]), (unsigned long)READ(carry_trace[5]),
        READ(model_armed), READ(model_applied), READ(home_pending), READ(home_applied), READ(request_errors),
        READ(owned_index), READ(owned_applied), READ(owned_rejected));
#undef READ
    if (size > 0 && size < (int)sizeof(text)) {
        DWORD written;
        WriteFile(file, text, (DWORD)size, &written, NULL);
    }
    CloseHandle(file);
}

static void WINAPI update_detour(void *application) {
    if (InterlockedCompareExchange(&technology_state, 0, 0) == 1) technology_apply_request();
    if (InterlockedCompareExchange(&recipe_state, 0, 0) == 1) recipe_apply_request();
    if (InterlockedCompareExchange(&reward_state, 0, 0) == 1) reward_apply_request();
    if (InterlockedCompareExchange(&fish_state, 0, 0) == 1) fish_apply_request();
    if (InterlockedCompareExchange(&product_state, 0, 0) == 1) product_apply_request();
    if (InterlockedCompareExchange(&account_state, 0, 0) == 1) account_apply_request();
    if (InterlockedCompareExchange(&item_state, 0, 0) == 1) item_apply_request();
    if (InterlockedCompareExchange(&currency_state, 0, 0) == 1) currency_apply_request();
    if (InterlockedCompareExchange(&teleport_state, 0, 0) == 1) teleport_apply_request();
    if (InterlockedCompareExchange(&word_state, 0, 0) == 1) word_apply_request();
    if (InterlockedCompareExchange(&rune_state, 0, 0) == 1) rune_apply_request();
    if (InterlockedCompareExchange(&stat_state, 0, 0) == 1) stat_apply_request();
    if (InterlockedCompareExchange(&wiki_state, 0, 0) == 1) wiki_apply_request();
    if (InterlockedCompareExchange(&nexus_state, 0, 0) == 1) nexus_apply_request();
    if (InterlockedCompareExchange(&mission_state, 0, 0) == 1) mission_apply_request();
    // Offers wait until the game's window is in front; one offer a turn.
    int ship_waits = InterlockedCompareExchange(&ship_obtain.state, 0, 0) == 1;
    int tool_waits = InterlockedCompareExchange(&multitool_obtain.state, 0, 0) == 1;
    if (obtain_focus_ready(ship_waits || tool_waits)) {
        obtain_focus_frames = 0;
        if (ship_waits) obtain_apply_request(&ship_obtain);
        else obtain_apply_request(&multitool_obtain);
    }
    obtain_legacy_tick(&multitool_obtain);
    item_limits_tick();
    star_system_tick();
    account_keep_tick();
    if (InterlockedCompareExchange(&owned_state, 0, 1) == 1) apply_owned_request();
    if (InterlockedCompareExchange(&dispatch_state, 2, 1) == 1) dispatch_requested_reward();
    original_update(application);
}

static int resolve_targets(void) {
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    HMODULE host = (HMODULE)base;
    update_target = (void *)GetProcAddress(host, "CourierTestUpdate");
    setup_target = (void *)GetProcAddress(host, "CourierTestPurchaseSetup");
    layout_target = (void *)GetProcAddress(host, "CourierTestLayoutInitializer");
    special_target = (void *)GetProcAddress(host, "CourierTestSpecialGenerator");
    store_copy = (store_copy_fn)(void *)GetProcAddress(host, "CourierTestStoreCopy");
    vector_grow = (vector_grow_fn)(void *)GetProcAddress(host, "CourierTestVectorGrow");
    vector_grow_callback = (void *)GetProcAddress(host, "CourierTestVectorGrowCallback");
    accept_return = (void *)GetProcAddress(host, "CourierTestAccept");
    home_target = (void *)GetProcAddress(host, "CourierTestHomeSeed");
    home_return = (void *)GetProcAddress(host, "CourierTestAcceptHome");
    if (!home_target || !home_return) return 0;
    if (!accept_return || !special_target || !store_copy || !vector_grow || !vector_grow_callback) return 0;
    stat_generator = (stat_generator_fn)(void *)GetProcAddress(host, "CourierTestStatGenerator");
    give_reward = (give_reward_fn)(void *)GetProcAddress(host, "CourierTestGiveReward");
    reward_manager = (void *)GetProcAddress(host, "CourierTestRewardManager");
    return update_target && setup_target && layout_target && stat_generator && give_reward && reward_manager;
#else
    static const unsigned char update_entry[16] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0xe8, 0xe5, 0x83, 0x92, 0x02, 0x48,
        0x89, 0x05, 0x8e, 0xfd
    };
    static const unsigned char reward_entry[24] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xec, 0x70
    };
    static const unsigned char setup_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x4c, 0x89, 0x44, 0x24, 0x18, 0x55, 0x56,
        0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48, 0x8d, 0xac,
        0x24, 0x10, 0xc2, 0xff, 0xff, 0xb8, 0xf0, 0x3e
    };
    static const unsigned char statgen_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x6c, 0x24, 0x20, 0x56, 0x57,
        0x41, 0x56, 0x48, 0x81, 0xec, 0xa0, 0x00, 0x00, 0x00, 0x48, 0x8b, 0xf1,
        0x49, 0x63, 0xe9, 0x48, 0x8d, 0x8c, 0x24, 0xd0
    };
    static const unsigned char layout_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x4c, 0x89, 0x4c, 0x24, 0x20, 0x44, 0x89,
        0x44, 0x24, 0x18, 0x55, 0x56, 0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56,
        0x41, 0x57, 0x48, 0x8b, 0xec, 0x48, 0x83, 0xec
    };
    static const unsigned char special_entry[32] = {
        0x4c, 0x8b, 0xdc, 0x53, 0x55, 0x48, 0x81, 0xec, 0x98, 0x00, 0x00, 0x00,
        0x4c, 0x63, 0xca, 0x49, 0x8b, 0xd8, 0x48, 0x8b, 0xe9, 0x41, 0x83, 0xf9,
        0x0b, 0x0f, 0x87, 0xb3, 0x02, 0x00, 0x00, 0xb8
    };
    static const unsigned char copy_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x48, 0x83, 0xec, 0x40, 0x0f, 0xb7, 0x82, 0x80,
        0x00, 0x00, 0x00, 0x48, 0x8d, 0xb1, 0x88, 0x00
    };
    static const unsigned char grow_entry[32] = {
        0x40, 0x53, 0x48, 0x81, 0xec, 0xb0, 0x00, 0x00, 0x00, 0x4c, 0x8b, 0x94,
        0x24, 0x08, 0x01, 0x00, 0x00, 0x48, 0x8d, 0x05, 0xa0, 0x3b, 0x92, 0x00,
        0x4c, 0x8b, 0x9c, 0x24, 0xf0, 0x00, 0x00, 0x00
    };
    // Acceptance: special-slot generation for the owned type-8 store, ending in the hooked call.
    static const unsigned char accept_site[36] = {
        0x8d, 0x95, 0xa0, 0x10, 0x00, 0x00, 0x48, 0x8b, 0xc8, 0xe8, 0x1c, 0xfb,
        0x8d, 0xff, 0x4c, 0x8d, 0x45, 0x20, 0x41, 0x8b, 0xd7, 0x48, 0x8b, 0xcb,
        0x0f, 0x10, 0x00, 0x0f, 0x29, 0x45, 0x20, 0xe8, 0x86, 0x40, 0xbe, 0xff
    };
    static const unsigned char home_entry[16] = {
        0x0f, 0x10, 0x02, 0x0f, 0x11, 0x81, 0xb0, 0x02, 0x00, 0x00, 0xc3, 0xcc,
        0xcc, 0xcc, 0xcc, 0xcc
    };
    // Reward acceptance: current solar system seed passed to the home seed setter.
    static const unsigned char home_site[27] = {
        0x48, 0x8b, 0x88, 0x20, 0xe0, 0x25, 0x00, 0xe8, 0xaa, 0xea, 0x8d, 0xff,
        0x48, 0x8b, 0xcb, 0x48, 0x8d, 0x90, 0x80, 0x24, 0x00, 0x00, 0xe8, 0x0b,
        0x86, 0xc5, 0xff
    };
    // The three native class-0 stat calls for stores 0x980, 0xe10 and 0xbc8.
    static const unsigned char freighter_block[127] = {
        0x8b, 0x95, 0x68, 0x3e, 0x00, 0x00, 0x4c, 0x8d, 0x46, 0x10, 0xc6, 0x44,
        0x24, 0x38, 0x01, 0x48, 0x8d, 0x8e, 0x80, 0x09, 0x00, 0x00, 0xc7, 0x44,
        0x24, 0x28, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x33, 0xc9, 0x44, 0x89, 0x74,
        0x24, 0x20, 0xe8, 0x38, 0x82, 0xbe, 0xff, 0xc6, 0x44, 0x24, 0x38, 0x01,
        0x4c, 0x8d, 0x46, 0x10, 0xc7, 0x44, 0x24, 0x28, 0x0a, 0x00, 0x00, 0x00,
        0x48, 0x8d, 0x8e, 0x10, 0x0e, 0x00, 0x00, 0x45, 0x33, 0xc9, 0x44, 0x89,
        0x74, 0x24, 0x20, 0xba, 0x05, 0x00, 0x00, 0x00, 0xe8, 0x0e, 0x82, 0xbe,
        0xff, 0xc6, 0x44, 0x24, 0x38, 0x01, 0x4c, 0x8d, 0x46, 0x10, 0xc7, 0x44,
        0x24, 0x28, 0x0a, 0x00, 0x00, 0x00, 0x48, 0x8d, 0x8e, 0xc8, 0x0b, 0x00,
        0x00, 0x45, 0x33, 0xc9, 0x44, 0x89, 0x74, 0x24, 0x20, 0xba, 0x09, 0x00,
        0x00, 0x00, 0xe8, 0xe4, 0x81, 0xbe, 0xff
    };
    update_target = (void *)(base + UPDATE_RVA);
    setup_target = (void *)(base + SETUP_RVA);
    layout_target = (void *)(base + LAYOUT_RVA);
    special_target = (void *)(base + SPECIAL_GENERATOR_RVA);
    store_copy = (store_copy_fn)(base + STORE_COPY_RVA);
    vector_grow = (vector_grow_fn)(base + VECTOR_GROW_RVA);
    vector_grow_callback = (void *)(base + VECTOR_GROW_CALLBACK_RVA);
    accept_return = (void *)(base + ACCEPT_RETURN_RVA);
    home_target = (void *)(base + HOME_SEED_SETTER_RVA);
    home_return = (void *)(base + HOME_SEED_RETURN_RVA);
    stat_generator = (stat_generator_fn)(base + STAT_GENERATOR_RVA);
    give_reward = (give_reward_fn)(base + GIVE_REWARD_RVA);
    reward_manager = (void *)(base + REWARD_MANAGER_RVA);
    return memcmp(update_target, update_entry, sizeof(update_entry)) == 0 &&
           memcmp((void *)(base + GIVE_REWARD_RVA), reward_entry, sizeof(reward_entry)) == 0 &&
           memcmp(setup_target, setup_entry, sizeof(setup_entry)) == 0 &&
           memcmp(layout_target, layout_entry, sizeof(layout_entry)) == 0 &&
           memcmp(special_target, special_entry, sizeof(special_entry)) == 0 &&
           memcmp((void *)(base + STORE_COPY_RVA), copy_entry, sizeof(copy_entry)) == 0 &&
           memcmp((void *)(base + VECTOR_GROW_RVA), grow_entry, sizeof(grow_entry)) == 0 &&
           memcmp((void *)(base + ACCEPT_SITE_RVA), accept_site, sizeof(accept_site)) == 0 &&
           memcmp(home_target, home_entry, sizeof(home_entry)) == 0 &&
           memcmp((void *)(base + HOME_SEED_SITE_RVA), home_site, sizeof(home_site)) == 0 &&
           writable_range(base + MANAGER_POINTER_RVA, sizeof(uintptr_t)) &&
           memcmp((void *)(base + STAT_GENERATOR_RVA), statgen_entry, sizeof(statgen_entry)) == 0 &&
           memcmp((void *)(base + FREIGHTER_BLOCK_RVA), freighter_block, sizeof(freighter_block)) == 0 &&
           writable_range((uintptr_t)reward_manager, 1) && technology_resolve(base) && recipe_resolve(base) &&
           reward_resolve(base) && fish_resolve(base) && product_resolve(base) && account_resolve(base) &&
           item_resolve(base) && reward_carrier_resolve(base) && teleport_resolve(base) &&
           stat_resolve(base);
#endif
}

void courier_probe_after_verified(void) {
    static const wchar_t *const tags[EVENT_COUNT] = {L"c", L"b", L"a", L"s", L"dispatch", L"slots",
                                                     L"techrows", L"super", L"model", L"corvette",
                                                     L"reward", L"owned", L"technology", L"recipes", L"redeem", L"fish", L"product",
                                                     L"account", L"keep", L"item", L"currency", L"ship", L"weapon",
                                                     L"teleport", L"words", L"runes", L"stats", L"wiki", L"nexus", L"missions"};
    HANDLE events[EVENT_COUNT] = {0};
    if (!resolve_targets()) { write_status("target_verification_failed", MH_ERROR_UNSUPPORTED_FUNCTION); return; }
    MH_STATUS result = MH_Initialize();
    if (result != MH_OK) { write_status("hook_initialize_failed", result); return; }
    result = MH_CreateHook(update_target, (void *)update_detour, (void **)&original_update);
    if (result == MH_OK) result = MH_CreateHook(setup_target, (void *)setup_detour, (void **)&original_setup);
    if (result == MH_OK) result = MH_CreateHook(layout_target, (void *)layout_detour, (void **)&original_layout);
    if (result == MH_OK) result = MH_CreateHook(special_target, (void *)special_detour, (void **)&original_special);
    if (result == MH_OK) result = MH_CreateHook(home_target, (void *)home_detour, (void **)&original_home);
    if (result != MH_OK) { write_status("hook_create_failed", result); return; }
    unsigned long random[4];
    if (BCryptGenRandom(NULL, (PUCHAR)random, sizeof(random), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0 ||
        swprintf(event_base, 112, L"Local\\NMSCourier-Profile180836-%lu-%08lx%08lx%08lx%08lx",
                 (unsigned long)GetCurrentProcessId(), random[0], random[1], random[2], random[3]) < 0) {
        write_status("event_name_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
        return;
    }
    for (unsigned index = 0; index < EVENT_COUNT; ++index) {
        wchar_t name[128];
        if (swprintf(name, 128, L"%ls-%ls", event_base, tags[index]) < 0) break;
        events[index] = CreateEventW(NULL, TRUE, FALSE, name);
        if (!events[index] || GetLastError() == ERROR_ALREADY_EXISTS) {
            write_status("event_create_failed", MH_ERROR_UNSUPPORTED_FUNCTION);
            for (unsigned close = 0; close <= index; ++close) if (events[close]) CloseHandle(events[close]);
            return;
        }
    }
    int hooks_enabled = 0;
    // A keep list needs the update hook from the start: the game replaces the Twitch set soon after login.
    if (account_keep_load() > 0) {
        result = MH_EnableHook(MH_ALL_HOOKS);
        if (result != MH_OK) { write_status("hook_enable_failed", result); return; }
        hooks_enabled = 1;
    }
    write_status(hooks_enabled ? "armed" : "awaiting_request", MH_OK);
    // Milliseconds since the last request, and since the status file was last written.
    for (unsigned waited = 0, since_status = 0; waited / 1000u < ARM_WINDOW_SECONDS; ) {
        DWORD signaled = WaitForMultipleObjects(EVENT_COUNT, events, FALSE, FILE_SIGNAL_POLL_MILLISECONDS);
        technology_write_result();
        recipe_write_result();
        reward_write_result();
        fish_write_result();
        product_write_result();
        account_write_result();
        item_write_result();
        item_limits_write();
        star_system_write();
        currency_write_result();
        teleport_write_result();
        word_write_result();
        rune_write_result();
        stat_write_result();
        wiki_write_result();
        nexus_write_result();
        mission_write_result();
        obtain_write_result(&ship_obtain);
        obtain_write_result(&multitool_obtain);
        obtain_write_legacy(&multitool_obtain);
        account_keep_write_status();
        if (signaled == WAIT_TIMEOUT) {
            // A request written by the application is handled as the event of the same name.
            wchar_t tag[FILE_SIGNAL_TAG_CAPACITY];
            if (file_signal_take(tag)) {
                unsigned match = EVENT_COUNT;
                for (unsigned index = 0; index < EVENT_COUNT; ++index)
                    if (wcscmp(tag, tags[index]) == 0) match = index;
                if (match < EVENT_COUNT) SetEvent(events[match]);
                else InterlockedIncrement(&request_errors);
                continue;
            }
            waited += FILE_SIGNAL_POLL_MILLISECONDS;
            since_status += FILE_SIGNAL_POLL_MILLISECONDS;
            if (since_status >= 2000u) {
                since_status = 0;
                write_status(hooks_enabled ? "armed" : "awaiting_request", MH_OK);
            }
            continue;
        }
        if (signaled >= WAIT_OBJECT_0 + EVENT_COUNT) { write_status("event_wait_failed", MH_ERROR_UNSUPPORTED_FUNCTION); break; }
        unsigned index = signaled - WAIT_OBJECT_0;
        ResetEvent(events[index]);
        // The window counts the time since the last request.
        waited = 0;
        if (!hooks_enabled) {
            // One thread freeze for all three hooks.
            result = MH_EnableHook(MH_ALL_HOOKS);
            if (result != MH_OK) { write_status("hook_enable_failed", result); break; }
            hooks_enabled = 1;
        }
        if (index < CLASS_COUNT) InterlockedExchange(&requested_class, (LONG)index);
        else if (index == CLASS_COUNT + 1) InterlockedExchange(&slots_armed, 1);
        else if (index == CLASS_COUNT + 2) { InterlockedExchange(&tech_rows_armed, 1); InterlockedExchange(&slots_armed, 1); }
        else if (index == CLASS_COUNT + 3) InterlockedExchange(&super_armed, 1);
        else if (index == CLASS_COUNT + 4) {
            if (read_model_request()) InterlockedExchange(&model_armed, 1);
            else InterlockedIncrement(&request_errors);
        }
        // A dispatch may be requested again only after the previous call returned (state 3);
        // a call that never returned leaves state 2 and blocks further requests in this process.
        // Events "dispatch" and "corvette" both arrive here and differ only in the reward chosen.
        else if (index == CLASS_COUNT + 6 && !read_reward_request()) InterlockedIncrement(&request_errors);
        else if (index == CLASS_COUNT + 7) {
            if (read_owned_request()) InterlockedExchange(&owned_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 8) {
            if (technology_read_request()) InterlockedExchange(&technology_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 9) {
            if (recipe_read_request()) InterlockedExchange(&recipe_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 10) {
            if (reward_read_request()) InterlockedExchange(&reward_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        // The fish request names fish, or every fish of the game's table (fish_record.h).
        else if (index == CLASS_COUNT + 11) {
            if (InterlockedCompareExchange(&fish_state, 0, 0) == 0 && fish_read_request())
                InterlockedExchange(&fish_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 12) {
            if (product_read_request()) InterlockedExchange(&product_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 13) {
            if (account_read_request()) InterlockedExchange(&account_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        // The keep list was rewritten: load it again. The update thread reads it without a lock, so stop
        // the keeper first and give a running pass time to end.
        else if (index == CLASS_COUNT + 17 || index == CLASS_COUNT + 18) {
            obtain_domain *domain = index == CLASS_COUNT + 17 ? &ship_obtain : &multitool_obtain;
            if (obtain_read_request(domain)) InterlockedExchange(&domain->state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 19) {
            if (teleport_read_request()) InterlockedExchange(&teleport_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 20) {
            if (word_read_request()) InterlockedExchange(&word_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 21) {
            if (rune_read_request()) InterlockedExchange(&rune_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 22) {
            if (stat_read_request()) InterlockedExchange(&stat_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 23) {
            if (wiki_read_request()) InterlockedExchange(&wiki_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 24) {
            if (nexus_read_request()) InterlockedExchange(&nexus_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 25) {
            if (mission_read_request()) InterlockedExchange(&mission_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 16) {
            if (currency_read_request()) InterlockedExchange(&currency_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 15) {
            if (item_read_request()) InterlockedExchange(&item_state, 1);
            else InterlockedIncrement(&request_errors);
        }
        else if (index == CLASS_COUNT + 14) {
            InterlockedExchange(&account_keep_count, 0);
            Sleep(200);
            account_keep_load();
            InterlockedExchange(&account_keep_reported, -1);
        }
        else {
            InterlockedExchange(&dispatch_choice, index == CLASS_COUNT + 6 ? 2 : index == CLASS_COUNT + 5 ? 1 : 0);
            InterlockedExchange(&ship_class_armed, index == CLASS_COUNT + 5 ? 1 : 0);
            if (InterlockedCompareExchange(&dispatch_state, 1, 0) != 0)
                InterlockedCompareExchange(&dispatch_state, 1, 3);
        }
        write_status("armed", MH_OK);
    }
    InterlockedExchange(&requested_class, -1);
    InterlockedExchange(&slots_armed, 0);
    InterlockedExchange(&tech_rows_armed, 0);
    InterlockedExchange(&super_armed, 0);
    InterlockedExchange(&model_armed, 0);
    InterlockedExchange(&home_pending, 0);
    carry_item = 0;
    for (unsigned index = 0; index < EVENT_COUNT; ++index) CloseHandle(events[index]);
    if (hooks_enabled) result = MH_DisableHook(MH_ALL_HOOKS);
    write_status(result == MH_OK ? "window_complete" : "hook_disable_failed", result);
}

#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
__declspec(dllexport) LONG CourierFreighterModelSnapshot(LONG values[4]) {
    values[0] = InterlockedCompareExchange(&model_applied, 0, 0);
    values[1] = InterlockedCompareExchange(&home_applied, 0, 0);
    values[2] = InterlockedCompareExchange(&home_pending, 0, 0);
    values[3] = InterlockedCompareExchange(&request_errors, 0, 0);
    return InterlockedCompareExchange(&model_armed, 0, 0);
}

__declspec(dllexport) LONG CourierFreighterSpecialSnapshot(LONG values[3]) {
    values[0] = InterlockedCompareExchange(&super_added, 0, 0);
    values[1] = InterlockedCompareExchange(&super_errors, 0, 0);
    values[2] = InterlockedCompareExchange(&carry_applied, 0, 0);
    return carry_item != 0;
}

__declspec(dllexport) LONG CourierFreighterSlotsSnapshot(LONG values[3]) {
    values[0] = InterlockedCompareExchange(&slots_armed, 0, 0);
    values[1] = InterlockedCompareExchange(&slots_applied, 0, 0);
    values[2] = InterlockedCompareExchange(&layout_overrides, 0, 0);
    return InterlockedCompareExchange(&grid[2], 0, 0);
}

__declspec(dllexport) LONG CourierFreighterClassSnapshot(LONG values[6]) {
    values[0] = InterlockedCompareExchange(&setup_calls, 0, 0);
    values[1] = InterlockedCompareExchange(&freighter_setups, 0, 0);
    values[2] = InterlockedCompareExchange(&applied_count, 0, 0);
    values[3] = InterlockedCompareExchange(&applied_class, 0, 0);
    values[4] = InterlockedCompareExchange(&dispatch_state, 0, 0);
    values[5] = InterlockedCompareExchange(&rejected_item, 0, 0);
    return InterlockedCompareExchange(&requested_class, 0, 0);
}
#endif
