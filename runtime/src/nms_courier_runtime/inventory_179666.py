"""Narrow inventory adapter for the exact Steam 179666 executable fingerprint."""

from __future__ import annotations

import ctypes
from dataclasses import dataclass
from typing import Final

from pymhf.core.hooking import Structure, function_hook

BUILD_SHA256: Final = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
APPLICATION_DATA_POINTER_RVA: Final = 0x06E7AAE8
APPLICATION_GAME_STATE_OFFSET: Final = 0x0E70
GAME_STATE_PLAYER_STATE_OFFSET: Final = 0xAAD0
PLAYER_INVENTORIES_OFFSET: Final = 0x910
INVENTORY_STORE_SIZE: Final = 0x248
INVENTORY_STORE_COUNT: Final = 0x21
INVENTORY_STORE_ELEMENTS_OFFSET: Final = 0x88
INVENTORY_ADD_RVA: Final = 0x4CE130
INVENTORY_ADD_PATTERN: Final = (
    "48 89 5C 24 ? 48 89 74 24 ? 55 57 41 56 48 8D 6C 24 ? "
    "48 81 EC ? ? ? ? 41 0F 10 00"
)
CARBON_GAME_ID: Final = "FUEL1"
CARBON_TYPE: Final = 0
TEST_DELIVERY_QUANTITY: Final = 500
_MAX_VECTOR_ELEMENTS: Final = 4096


class InventoryIndex(ctypes.Structure):
    _fields_ = [("x", ctypes.c_int32), ("y", ctypes.c_int32)]


class InventoryElement(ctypes.Structure):
    _fields_ = [
        ("game_id", ctypes.c_char * 0x10),
        ("index", InventoryIndex),
        ("amount", ctypes.c_int32),
        ("damage_factor", ctypes.c_float),
        ("max_amount", ctypes.c_int32),
        ("item_type", ctypes.c_int32),
        ("added_automatically", ctypes.c_bool),
        ("fully_installed", ctypes.c_bool),
        ("padding", ctypes.c_ubyte * 6),
    ]


class InventoryStoreView(ctypes.Structure):
    _fields_ = [
        ("valid_slots", ctypes.c_uint64 * 16),
        ("width", ctypes.c_int16),
        ("height", ctypes.c_int16),
        ("capacity", ctypes.c_int16),
        ("padding", ctypes.c_uint16),
        ("allocated_size", ctypes.c_uint32),
        ("vector_size", ctypes.c_uint32),
        ("elements", ctypes.POINTER(InventoryElement)),
    ]


class NativeInventoryStore(Structure):
    _fields_ = [("opaque", ctypes.c_ubyte * INVENTORY_STORE_SIZE)]

    @function_hook(offset=INVENTORY_ADD_RVA)
    def Add(
        self,
        this: ctypes.POINTER(NativeInventoryStore),
        result: ctypes.POINTER(InventoryIndex),
        item: ctypes.POINTER(InventoryElement),
    ) -> None:
        """Invoke the verified native inventory insertion function."""
        ...


@dataclass(frozen=True)
class CarbonStack:
    amount: int
    max_amount: int
    x: int
    y: int
    added_automatically: bool


@dataclass(frozen=True)
class InventorySnapshot:
    width: int
    height: int
    capacity: int
    vector_size: int
    allocated_size: int
    carbon_stacks: tuple[CarbonStack, ...]

    @property
    def carbon_quantity(self) -> int:
        return sum(stack.amount for stack in self.carbon_stacks)


def pattern_matches(candidate: bytes, pattern: str) -> bool:
    tokens = pattern.split()
    return len(candidate) == len(tokens) and all(
        token in ("?", "??") or candidate[index] == int(token, 16)
        for index, token in enumerate(tokens)
    )


def validate_add_entry_point(base_address: int, executable_sha256: str) -> bool:
    if executable_sha256.lower() != BUILD_SHA256 or base_address <= 0:
        return False
    address = base_address + INVENTORY_ADD_RVA
    candidate = ctypes.string_at(address, len(INVENTORY_ADD_PATTERN.split()))
    return pattern_matches(candidate, INVENTORY_ADD_PATTERN)


def locate_personal_inventory(data_address: int) -> int:
    if data_address <= 0:
        raise ValueError("PLAYER_NOT_READY")
    player_state = (
        data_address + APPLICATION_GAME_STATE_OFFSET + GAME_STATE_PLAYER_STATE_OFFSET
    )
    return player_state + PLAYER_INVENTORIES_OFFSET


def snapshot_inventory(store_address: int) -> InventorySnapshot:
    if store_address <= 0:
        raise ValueError("INVENTORY_UNAVAILABLE")
    view = InventoryStoreView.from_address(store_address)
    if (
        view.width <= 0
        or view.height <= 0
        or view.capacity <= 0
        or view.vector_size > _MAX_VECTOR_ELEMENTS
        or view.allocated_size > _MAX_VECTOR_ELEMENTS * 2
        or view.vector_size > view.allocated_size
        or (view.vector_size and not view.elements)
    ):
        raise ValueError("INVENTORY_LAYOUT_UNEXPECTED")

    carbon: list[CarbonStack] = []
    for index in range(view.vector_size):
        item = view.elements[index]
        game_id = bytes(item.game_id).split(b"\0", 1)[0].decode("ascii", "strict")
        if game_id == CARBON_GAME_ID and item.item_type == CARBON_TYPE:
            if item.amount < 0 or item.max_amount <= 0 or item.amount > item.max_amount:
                raise ValueError("CARBON_STACK_INVALID")
            carbon.append(
                CarbonStack(
                    amount=item.amount,
                    max_amount=item.max_amount,
                    x=item.index.x,
                    y=item.index.y,
                    added_automatically=bool(item.added_automatically),
                )
            )
    return InventorySnapshot(
        width=view.width,
        height=view.height,
        capacity=view.capacity,
        vector_size=view.vector_size,
        allocated_size=view.allocated_size,
        carbon_stacks=tuple(carbon),
    )


def make_carbon_element(store_address: int, quantity: int) -> InventoryElement:
    if quantity != TEST_DELIVERY_QUANTITY:
        raise ValueError("INVALID_QUANTITY")
    view = InventoryStoreView.from_address(store_address)
    if (
        view.vector_size == 0
        or view.vector_size > _MAX_VECTOR_ELEMENTS
        or view.vector_size > view.allocated_size
        or not view.elements
    ):
        raise ValueError("CARBON_TEMPLATE_UNAVAILABLE")

    template = next(
        (
            view.elements[index]
            for index in range(view.vector_size)
            if bytes(view.elements[index].game_id).split(b"\0", 1)[0]
            == CARBON_GAME_ID.encode("ascii")
            and view.elements[index].item_type == CARBON_TYPE
        ),
        None,
    )
    if template is None or template.max_amount < quantity:
        raise ValueError("CARBON_TEMPLATE_UNAVAILABLE")

    element = InventoryElement()
    ctypes.memmove(ctypes.byref(element), ctypes.byref(template), ctypes.sizeof(element))
    element.index.x = -1
    element.index.y = -1
    element.amount = quantity
    return element


def call_inventory_add(
    store_address: int, element: InventoryElement
) -> InventoryIndex:
    store = ctypes.cast(
        store_address, ctypes.POINTER(NativeInventoryStore)
    ).contents
    result = InventoryIndex(-1, -1)
    store.Add(ctypes.byref(result), ctypes.byref(element))
    return result


def personal_inventory_snapshot(data_address: int) -> tuple[int, InventorySnapshot]:
    store_address = locate_personal_inventory(data_address)
    return store_address, snapshot_inventory(store_address)
