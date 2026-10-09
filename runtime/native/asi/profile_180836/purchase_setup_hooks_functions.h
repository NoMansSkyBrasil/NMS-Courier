// Second part of purchase_setup_hooks.h: the hook functions. They are separate only because they call
// the freighter offer and corvette build files, which must be included between the two parts.

// Large technology height bound of one generation entry, or NULL unless it holds the expected 10 x 6.
static int32_t *technology_height_bound(uintptr_t size_type) {
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
    (void)size_type;
    return NULL;
#else
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = *(const uintptr_t *)(base + MANAGER_POINTER_RVA);
    if (size_type > 0x40 || !writable_range(manager + TABLE_POINTER_OFFSET, sizeof(uintptr_t))) return NULL;
    uintptr_t entry = *(const uintptr_t *)(manager + TABLE_POINTER_OFFSET) + GENERATION_ENTRIES_OFFSET +
                      size_type * GENERATION_ENTRY_SIZE;
    if (!writable_range(entry, GENERATION_ENTRY_SIZE) ||
        *(const int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT) != 6 ||
        *(const int32_t *)(entry + ENTRY_TECH_LARGE_WIDTH) != 10) return NULL;
    return (int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT);
#endif
}

static uintptr_t layout_detour(uintptr_t store, uintptr_t inventory_type, uintptr_t slot_count,
                               uintptr_t layout, uintptr_t a5, uintptr_t size_type, uintptr_t a7,
                               uintptr_t a8, uintptr_t use_slot_count) {
    uintptr_t item = scope_item;
    int32_t *height = NULL;
    if (item && (LONG)GetCurrentThreadId() == InterlockedCompareExchange(&scope_thread, 0, 0)) {
        uint32_t wanted = store == item + MAIN_STORE_OFFSET ? MAX_MAIN_SLOTS :
                          store == item + TECHNOLOGY_STORE_OFFSET ? MAX_TECHNOLOGY_SLOTS : 0;
        if (wanted == MAX_TECHNOLOGY_SLOTS && InterlockedCompareExchange(&scope_rows, 0, 0)) {
            // The shared table is changed only for the duration of this one native call.
            height = technology_height_bound((uint32_t)size_type);
#ifdef COURIER_NATIVE_CALLBACK_FIXTURE
            wanted = 10 * EXTENDED_TECHNOLOGY_ROWS;
#else
            if (height) wanted = 10 * EXTENDED_TECHNOLOGY_ROWS;
            else InterlockedIncrement(&table_rejected);
#endif
        }
        if (wanted) {
            // Native meaning: use the supplied slot count; bounds then follow from that count.
            slot_count = wanted;
            use_slot_count = 1;
            InterlockedIncrement(&layout_overrides);
        }
    }
    // A multi-tool's only grid: both bound blocks of its size type, when they hold 6 and 10.
    int32_t *tool_height[2] = {NULL, NULL};
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    if (item && store == item + MAIN_STORE_OFFSET && InterlockedCompareExchange(&scope_tool_rows, 0, 0) &&
        (LONG)GetCurrentThreadId() == InterlockedCompareExchange(&scope_thread, 0, 0)) {
        uintptr_t manager = *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA);
        InterlockedExchange(&obtain_tool_size_type, (LONG)(uint32_t)size_type);
        if ((uint32_t)size_type <= 0x40 && writable_range(manager + TABLE_POINTER_OFFSET, sizeof(uintptr_t))) {
            uintptr_t entry = *(const uintptr_t *)(manager + TABLE_POINTER_OFFSET) + GENERATION_ENTRIES_OFFSET +
                              (uint32_t)size_type * GENERATION_ENTRY_SIZE;
            if (writable_range(entry, GENERATION_ENTRY_SIZE)) {
                if (*(const int32_t *)(entry + ENTRY_MAIN_LARGE_HEIGHT) == 6 &&
                    *(const int32_t *)(entry + ENTRY_MAIN_LARGE_WIDTH) == 10)
                    tool_height[0] = (int32_t *)(entry + ENTRY_MAIN_LARGE_HEIGHT);
                if (*(const int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT) == 6 &&
                    *(const int32_t *)(entry + ENTRY_TECH_LARGE_WIDTH) == 10)
                    tool_height[1] = (int32_t *)(entry + ENTRY_TECH_LARGE_HEIGHT);
            }
        }
        if (!tool_height[0] && !tool_height[1]) InterlockedIncrement(&table_rejected);
    }
#endif
    if (height) { *height = EXTENDED_TECHNOLOGY_ROWS; InterlockedIncrement(&table_patches); }
    for (int index = 0; index < 2; ++index)
        if (tool_height[index]) { *tool_height[index] = EXTENDED_TECHNOLOGY_ROWS; InterlockedIncrement(&table_patches); }
    uintptr_t result = original_layout(store, inventory_type, slot_count, layout, a5, size_type, a7, a8, use_slot_count);
    if (height) *height = 6;
    for (int index = 0; index < 2; ++index) if (tool_height[index]) *tool_height[index] = 6;
    return result;
}

static void record_grid(uintptr_t item) {
    static const uint32_t offsets[2] = {MAIN_STORE_OFFSET, TECHNOLOGY_STORE_OFFSET};
    if (!writable_range(item, ITEM_READ_SPAN)) return;
    for (unsigned index = 0; index < 2; ++index) {
        const int16_t *header = (const int16_t *)(item + offsets[index] + 0x80u);
        InterlockedExchange(&grid[index * 3], header[0]);
        InterlockedExchange(&grid[index * 3 + 1], header[1]);
        InterlockedExchange(&grid[index * 3 + 2], header[2]);
    }
}

static uintptr_t setup_detour(uintptr_t item, uintptr_t a2, uintptr_t a3, uintptr_t a4, uintptr_t a5,
                              uintptr_t a6, uintptr_t kind, uintptr_t a8, uintptr_t a9, uintptr_t a10,
                              uintptr_t a11) {
    // A corvette build start is the ship setup that follows the corvette event. Its size type has the same
    // large bounds as the freighter entry (10 x 12 main, 10 x 6 technology), so the slot scope is shared.
    int corvette = (uint32_t)kind == SHIP_ITEM_KIND && item &&
                   InterlockedCompareExchange(&ship_class_armed, 0, 0) == 1;
    int scoped = ((uint32_t)kind == FREIGHTER_ITEM_KIND || corvette) && item &&
                 InterlockedCompareExchange(&slots_armed, 0, 1) == 1;
    if ((uint32_t)kind == FREIGHTER_ITEM_KIND) {
        carry_item = 0;   // a new offer supersedes any pending carry
        InterlockedExchange(&home_pending, 0);
        if (item && InterlockedCompareExchange(&model_armed, 0, 1) == 1) {
            // Native meaning of arguments 2 and 3: model seed pair and scene filename.
            if (InterlockedCompareExchange(&request_has_model_seed, 0, 0)) a2 = (uintptr_t)&request_model_seed;
            if (InterlockedCompareExchange(&request_has_scene, 0, 0)) a3 = (uintptr_t)request_scene;
            if (InterlockedCompareExchange(&request_has_home_seed, 0, 0)) InterlockedExchange(&home_pending, 1);
            InterlockedIncrement(&model_applied);
        }
    }
    // Native meaning of argument 2: the model seed pair. An offered multi-tool is recognised by it.
    int tool = (uint32_t)kind == WEAPON_ITEM_KIND && item && a2 && obtain_tool_seed &&
               *(const uint64_t *)a2 == (uint64_t)obtain_tool_seed;
    int tool_scoped = tool && InterlockedCompareExchange(&obtain_tool_slots, 0, 0);
    if (tool_scoped) {
        scope_item = item;
        InterlockedExchange(&scope_tool_rows, InterlockedCompareExchange(&obtain_tool_rows, 0, 0));
        InterlockedExchange(&scope_thread, (LONG)GetCurrentThreadId());
    }
    // An offered starship: the corvette build has its own arming and is left alone.
    int ship = (uint32_t)kind == SHIP_ITEM_KIND && item && !corvette &&
               (InterlockedCompareExchange(&obtain_ship_slots, 0, 0) || InterlockedCompareExchange(&obtain_ship_super, 0, 0)) &&
               (InterlockedCompareExchange(&obtain_ship_giving, 0, 0) ||
                (a2 && obtain_ship_seed && *(const uint64_t *)a2 == (uint64_t)obtain_ship_seed));
    int ship_scoped = ship && InterlockedCompareExchange(&obtain_ship_slots, 0, 0);
    if (ship_scoped) {
        // The layout detour gives the cargo grid 120 and the technology grid 60, or 120 with the rows.
        InterlockedExchange(&scope_rows, InterlockedCompareExchange(&obtain_ship_rows, 0, 0));
        scope_item = item;
        InterlockedExchange(&scope_thread, (LONG)GetCurrentThreadId());
    }
    if (scoped) {
        InterlockedExchange(&scope_rows, InterlockedExchange(&tech_rows_armed, 0));
        scope_item = item;
        InterlockedExchange(&scope_thread, (LONG)GetCurrentThreadId());
    }
    uintptr_t result = original_setup(item, a2, a3, a4, a5, a6, kind, a8, a9, a10, a11);
    if (ship) {
        if (ship_scoped) {
            InterlockedExchange(&scope_thread, 0);
            scope_item = 0;
            InterlockedExchange(&scope_rows, 0);
        }
        if (writable_range(item, ITEM_READ_SPAN)) {
            uint8_t *cargo = (uint8_t *)item + MAIN_STORE_OFFSET, *technology = (uint8_t *)item + TECHNOLOGY_STORE_OFFSET;
            // Fallback where the game's bounds for the ship's size type stopped short: the full grid
            // written directly, as the owned request does.
            if (ship_scoped) {
                int16_t width = *(const int16_t *)(cargo + 0x80), rows = *(const int16_t *)(cargo + 0x82);
                if (width >= 1 && width <= 16 && rows >= 1 && rows < EXTENDED_TECHNOLOGY_ROWS) fill_store_grid(cargo);
                width = *(const int16_t *)(technology + 0x80);
                rows = *(const int16_t *)(technology + 0x82);
                if (InterlockedCompareExchange(&obtain_ship_rows, 0, 0) && width >= 1 && width <= 16 && rows >= 1 &&
                    rows < EXTENDED_TECHNOLOGY_ROWS)
                    fill_store_grid(technology);
            }
            if (InterlockedCompareExchange(&obtain_ship_super, 0, 0)) add_special_slots(technology);
            record_grid(item);
            for (int index = 0; index < 3; ++index) {
                InterlockedExchange(&obtain_ship_grid[index], ((const int16_t *)(cargo + 0x80))[index]);
                InterlockedExchange(&obtain_ship_grid[3 + index], ((const int16_t *)(technology + 0x80))[index]);
            }
        }
        InterlockedIncrement(&obtain_ship_setups);
    }
    if (scoped) {
        InterlockedExchange(&scope_thread, 0);
        scope_item = 0;
        InterlockedExchange(&scope_rows, 0);
        InterlockedIncrement(&slots_applied);
    }
    InterlockedIncrement(&setup_calls);
    InterlockedExchange(&last_kind, (LONG)(uint32_t)kind);
    if (tool) {
        if (tool_scoped) {
            InterlockedExchange(&scope_thread, 0);
            InterlockedExchange(&scope_tool_rows, 0);
            scope_item = 0;
        }
        // Fallback when the table bound did not give twelve rows: the full grid written directly.
        if (tool_scoped && InterlockedCompareExchange(&obtain_tool_rows, 0, 0) && writable_range(item, ITEM_READ_SPAN)) {
            uint8_t *tool_store = (uint8_t *)item + MAIN_STORE_OFFSET;
            int16_t tool_width = *(const int16_t *)(tool_store + 0x80), tool_rows = *(const int16_t *)(tool_store + 0x82);
            if (tool_width >= 1 && tool_width <= 16 && tool_rows >= 1 && tool_rows < EXTENDED_TECHNOLOGY_ROWS)
                fill_store_grid(tool_store);
        }
        if (InterlockedCompareExchange(&obtain_tool_super, 0, 0) && writable_range(item, ITEM_READ_SPAN))
            add_special_slots((uint8_t *)item + MAIN_STORE_OFFSET);
        if (writable_range(item, ITEM_READ_SPAN)) {
            const int16_t *tool_header = (const int16_t *)(item + MAIN_STORE_OFFSET + 0x80u);
            record_grid(item);
            for (int index = 0; index < 3; ++index) InterlockedExchange(&obtain_tool_grid[index], tool_header[index]);
        }
        InterlockedIncrement(&obtain_tool_setups);
    }
    if ((uint32_t)kind == SHIP_ITEM_KIND && item && InterlockedCompareExchange(&ship_class_armed, 0, 1) == 1) {
        // Corvette build start: apply the armed class once to the ship item the game just set up.
        LONG ship_class = InterlockedCompareExchange(&requested_class, 0, 0);
        if (ship_class >= 0 && ship_class < CLASS_COUNT &&
            InterlockedCompareExchange(&requested_class, -1, ship_class) == ship_class)
            apply_corvette_build_class(item, (int32_t)ship_class);
        int ship_marked = InterlockedCompareExchange(&super_armed, 0, 1) == 1 && writable_range(item, ITEM_READ_SPAN);
        if (ship_marked) add_special_slots((uint8_t *)item + TECHNOLOGY_STORE_OFFSET);
        if ((scoped || ship_marked) && writable_range(item, ITEM_READ_SPAN)) record_grid(item);
    }
    if ((uint32_t)kind != FREIGHTER_ITEM_KIND) return result;
    InterlockedIncrement(&freighter_setups);
    LONG item_class = InterlockedCompareExchange(&requested_class, 0, 0);
    // Consume the armed request atomically so a second setup never reuses it.
    if (item_class >= 0 && item_class < CLASS_COUNT &&
        InterlockedCompareExchange(&requested_class, -1, item_class) == item_class)
        apply_freighter_offer_class(item, (int32_t)item_class);
    int marked = InterlockedCompareExchange(&super_armed, 0, 1) == 1 && writable_range(item, ITEM_READ_SPAN);
    if (marked) add_special_slots((uint8_t *)item + TECHNOLOGY_STORE_OFFSET);
    if ((scoped || marked) && writable_range(item, ITEM_READ_SPAN)) {
        record_grid(item);
        memcpy(carry_seed, (const void *)(item + ITEM_SEED_OFFSET), sizeof(carry_seed));
        carry_item = item;
    }
    return result;
}
