// Shared by the freighter offer and corvette build domains of the build 180836 research profile: the
// two hooks on the game's purchase setup and layout routines. Both domains go through the same game
// routine, told apart by its item kind argument, so the hooks live here and call the domain files for
// everything that is specific to one of them. Included once by profile_core.c.
// An armed slot request changes two arguments of the native layout initializer during one setup so the
// main and technology grids are created at their largest table bounds; a further request raises the
// technology grid height bound for that one layout call.

#define SETUP_RVA 0x8e58e0u
#define LAYOUT_RVA 0x4cd300u
#define TABLE_POINTER_OFFSET 0x218u
#define GENERATION_ENTRIES_OFFSET 0x5e0u
#define GENERATION_ENTRY_SIZE 0x54u
#define ENTRY_TECH_LARGE_HEIGHT 0x18u
#define ENTRY_TECH_LARGE_WIDTH 0x24u
#define EXTENDED_TECHNOLOGY_ROWS 12
#define ITEM_SEED_OFFSET 0x10u
#define ITEM_READ_SPAN 0x1070u
// Largest FreighterLarge bounds in the inventory table: 10 x 12 and 10 x 6.
#define MAX_MAIN_SLOTS 120u
#define MAX_TECHNOLOGY_SLOTS 60u
#define MAIN_STORE_OFFSET 0x980u
#define TECHNOLOGY_STORE_OFFSET 0xe10u

typedef uintptr_t (*setup_fn)(uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t,
                              uintptr_t, uintptr_t, uintptr_t, uintptr_t, uintptr_t);
typedef uintptr_t (*layout_fn)(uintptr_t store, uintptr_t inventory_type, uintptr_t slot_count,
                               uintptr_t layout, uintptr_t a5, uintptr_t size_type, uintptr_t a7,
                               uintptr_t a8, uintptr_t use_slot_count);

static setup_fn original_setup;
static layout_fn original_layout;
static void *setup_target;
static void *layout_target;
static volatile LONG tech_rows_armed;      // raise the technology height bound for the armed setup
static volatile LONG super_armed;
static volatile LONG table_patches;
static volatile LONG table_rejected;
static volatile LONG scope_rows;
static volatile LONG slots_armed;
static volatile LONG slots_applied;
static volatile LONG layout_overrides;
// Scope of one armed setup call on its own thread; read only by the layout detour.
static volatile LONG scope_thread;
static volatile uintptr_t scope_item;
static volatile LONG requested_class = -1;
// A new multi-tool asked with all slots and/or supercharged slots (obtain_request.h, bridge 1.16.0):
// the setup of a multi-tool item whose seed is this one gets its grid at the largest count and/or
// every slot supercharged, while the game builds the offer. Zero seed: nothing asked. The game's
// setup routine takes kind 1 for a multi-tool and lays its only grid out in the store at +0x980.
#define WEAPON_ITEM_KIND 1
static volatile LONG64 obtain_tool_seed;
static volatile LONG obtain_tool_slots;
static volatile LONG obtain_tool_super;
// Twelve rows (bridge 1.17.0): the game's own layout gives a multi-tool at most 10 x 6 (seen live),
// so the full 10 x 12 grid is written after the setup with the routine of the owned request.
static volatile LONG obtain_tool_rows;
// Bridge 1.18.0: the write after the setup did not take (live: the grid stayed 10 x 6), so the rows
// are asked the way a freighter's are: for the one layout call of the offered multi-tool, the height
// bound 6 of its size type in the game's inventory table becomes 12. A size type entry holds two
// bound blocks (read live for the multi-tool size types 0x18 to 0x1a: height 6 at +0x00 and +0x18,
// width 10 at +0x0c and +0x24); both are raised when they hold 6 and 10, and put back after the call.
#define ENTRY_MAIN_LARGE_HEIGHT 0x00u
#define ENTRY_MAIN_LARGE_WIDTH 0x0cu
static volatile LONG scope_tool_rows;      // the scoped setup is a multi-tool that asked for twelve rows
static volatile LONG obtain_tool_size_type = -1;   // size type the layout call of the last such setup had
static volatile LONG obtain_tool_grid[3] = {-1, -1, -1};   // the offered grid after the last such setup
static volatile LONG obtain_tool_setups;    // setups this applied to
static volatile LONG setup_calls;
static volatile LONG last_kind = -1;
