"""Read-only tests for the exact-build inventory adapter's memory layouts."""

from __future__ import annotations

import ctypes
import sys
import unittest
from pathlib import Path


RUNTIME_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RUNTIME_ROOT / "src"))

from nms_courier_runtime.inventory_179666 import (  # noqa: E402
    APPLICATION_GAME_STATE_OFFSET,
    BUILD_SHA256,
    CARBON_GAME_ID,
    GAME_STATE_PLAYER_STATE_OFFSET,
    INVENTORY_STORE_SIZE,
    INVENTORY_STORE_ELEMENTS_OFFSET,
    PLAYER_INVENTORIES_OFFSET,
    TEST_DELIVERY_QUANTITY,
    InventoryElement,
    InventoryStoreView,
    NativeInventoryStore,
    locate_personal_inventory,
    make_carbon_element,
    pattern_matches,
    snapshot_inventory,
)


class InventoryAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.elements = (InventoryElement * 2)()
        self.elements[0].game_id = CARBON_GAME_ID.encode("ascii")
        self.elements[0].index.x = 1
        self.elements[0].index.y = 2
        self.elements[0].amount = 115
        self.elements[0].damage_factor = 1.0
        self.elements[0].max_amount = 9999
        self.elements[0].item_type = 0
        self.elements[0].added_automatically = False
        self.elements[0].fully_installed = True
        self.elements[1].game_id = b"FUEL2"
        self.elements[1].amount = 2
        self.elements[1].max_amount = 9999
        self.elements[1].item_type = 0

        self.view = InventoryStoreView()
        self.view.width = 10
        self.view.height = 12
        self.view.capacity = 24
        self.view.allocated_size = len(self.elements)
        self.view.vector_size = len(self.elements)
        self.view.elements = ctypes.cast(
            self.elements, ctypes.POINTER(InventoryElement)
        )

    def test_live_layout_sizes_match_the_referenced_game_structures(self) -> None:
        self.assertEqual(ctypes.sizeof(InventoryElement), 0x30)
        self.assertEqual(ctypes.sizeof(NativeInventoryStore), INVENTORY_STORE_SIZE)
        self.assertEqual(INVENTORY_STORE_SIZE, 0x248)
        self.assertEqual(INVENTORY_STORE_ELEMENTS_OFFSET, 0x88)
        self.assertEqual(InventoryStoreView.allocated_size.offset, 0x88)
        self.assertEqual(InventoryStoreView.elements.offset, 0x90)
        self.assertEqual(NativeInventoryStore.Add._offset, 0x4CE130)

    def test_snapshot_reads_only_carbon_and_preserves_inventory_shape(self) -> None:
        snapshot = snapshot_inventory(ctypes.addressof(self.view))

        self.assertEqual((snapshot.width, snapshot.height, snapshot.capacity), (10, 12, 24))
        self.assertEqual((snapshot.vector_size, snapshot.allocated_size), (2, 2))
        self.assertEqual(snapshot.carbon_quantity, 115)
        self.assertEqual(len(snapshot.carbon_stacks), 1)
        self.assertEqual((snapshot.carbon_stacks[0].x, snapshot.carbon_stacks[0].y), (1, 2))

    def test_delivery_element_copies_a_valid_stack_and_uses_auto_slot(self) -> None:
        element = make_carbon_element(ctypes.addressof(self.view), TEST_DELIVERY_QUANTITY)

        self.assertEqual(bytes(element.game_id).split(b"\0", 1)[0], b"FUEL1")
        self.assertEqual(element.amount, 500)
        self.assertEqual(element.max_amount, 9999)
        self.assertEqual(element.index.x, -1)
        self.assertEqual(element.index.y, -1)
        self.assertFalse(element.added_automatically)
        self.assertTrue(element.fully_installed)
        self.assertEqual(self.elements[0].amount, 115)

    def test_delivery_element_rejects_any_other_quantity_or_missing_template(self) -> None:
        with self.assertRaisesRegex(ValueError, "INVALID_QUANTITY"):
            make_carbon_element(ctypes.addressof(self.view), 501)

        self.view.vector_size = 1
        self.elements[0].game_id = b"OXYGEN"
        with self.assertRaisesRegex(ValueError, "CARBON_TEMPLATE_UNAVAILABLE"):
            make_carbon_element(ctypes.addressof(self.view), TEST_DELIVERY_QUANTITY)

    def test_personal_inventory_address_uses_the_verified_constructor_offsets(self) -> None:
        data_address = 0x10000000
        self.assertEqual(
            locate_personal_inventory(data_address),
            data_address
            + APPLICATION_GAME_STATE_OFFSET
            + GAME_STATE_PLAYER_STATE_OFFSET
            + PLAYER_INVENTORIES_OFFSET,
        )

    def test_pattern_matcher_honors_wildcards_and_rejects_wrong_bytes(self) -> None:
        self.assertTrue(pattern_matches(bytes.fromhex("48 89 7f 22"), "48 89 ? 22"))
        self.assertFalse(pattern_matches(bytes.fromhex("48 88 7f 22"), "48 89 ? 22"))
        self.assertFalse(pattern_matches(bytes.fromhex("48 89 7f"), "48 89 ? 22"))
        self.assertEqual(len(BUILD_SHA256), 64)


if __name__ == "__main__":
    unittest.main()
