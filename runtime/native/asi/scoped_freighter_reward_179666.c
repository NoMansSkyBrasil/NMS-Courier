#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdint.h>

#include "currency_reward_179666.h"
#include "inventory_snapshot_179666.h"
#include "scoped_freighter_reward_179666.h"
#include "scoped_freighter_table_179666.h"

#define REALITY_MANAGER_OFFSET 0x60u
#define INVENTORY_TABLE_POINTER_OFFSET 0x1b8u
#define GENERATION_OFFSET (0x5e0u + 0x1du * 0x54u)
#define PROBABILITIES_OFFSET 0x1a54u

static int writable_range(uintptr_t address, size_t length) {
    if (!address || !length || address > UINTPTR_MAX - length) return 0;
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery((const void *)address, &memory, sizeof(memory)) !=
        sizeof(memory)) return 0;
    uintptr_t end = (uintptr_t)memory.BaseAddress + memory.RegionSize;
    DWORD protection = memory.Protect & 0xff;
    return memory.State == MEM_COMMIT &&
           !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           (protection == PAGE_READWRITE ||
            protection == PAGE_EXECUTE_READWRITE ||
            protection == PAGE_WRITECOPY ||
            protection == PAGE_EXECUTE_WRITECOPY) &&
           address <= end && length <= end - address;
}

static int dispatch_reward(void *context) {
    uintptr_t executable_base = (uintptr_t)context;
    return courier_dispatch_currency_reward(executable_base,
                                            COURIER_CURRENCY_QUICKSILVER);
}

int courier_dispatch_scoped_freighter_reward(uintptr_t executable_base,
                                             uintptr_t application_data) {
    if (!courier_currency_reward_target(executable_base) ||
        !application_data ||
        application_data > UINTPTR_MAX - REALITY_MANAGER_OFFSET -
                               INVENTORY_TABLE_POINTER_OFFSET) return 0;
    uintptr_t pointer_address = application_data + REALITY_MANAGER_OFFSET +
                                INVENTORY_TABLE_POINTER_OFFSET;
    if (!courier_readable_range((const void *)pointer_address,
                                sizeof(uintptr_t))) return 0;
    uintptr_t table = *(const uintptr_t *)pointer_address;
    if (!table || table > UINTPTR_MAX - PROBABILITIES_OFFSET - 0x40u ||
        !writable_range(table + GENERATION_OFFSET, 0x54u) ||
        !writable_range(table + PROBABILITIES_OFFSET, 0x40u)) return 0;
    return courier_with_scoped_freighter_generation((void *)table,
                                                     dispatch_reward,
                                                     (void *)executable_base);
}
