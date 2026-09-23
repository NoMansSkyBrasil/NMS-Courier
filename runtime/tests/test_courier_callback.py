from __future__ import annotations

import importlib.util
import queue
import sys
import threading
import unittest
from pathlib import Path


RUNTIME_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RUNTIME_ROOT / "src"))
MODULE_PATH = RUNTIME_ROOT / "src" / "nms_courier_runtime" / "courier_mod.py"
SPEC = importlib.util.spec_from_file_location("courier_mod_source", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Could not load the Courier diagnostics module source.")
COURIER_MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(COURIER_MODULE)
CourierDiagnostics = COURIER_MODULE.CourierDiagnostics


class CourierCallbackTests(unittest.TestCase):
    @staticmethod
    def make_mod() -> CourierDiagnostics:
        mod = CourierDiagnostics.__new__(CourierDiagnostics)
        mod._outgoing = queue.Queue(maxsize=8)
        mod._incoming = queue.Queue(maxsize=8)
        mod._callback_announced = False
        mod._test_delivery_enabled = False
        mod._stop = threading.Event()
        return mod

    def test_main_loop_callback_accepts_nmspy_zero_argument_contract(self) -> None:
        mod = self.make_mod()

        mod.after_main_loop()

        message = mod._outgoing.get_nowait()
        self.assertEqual(message["type"], "callback_ready")
        self.assertEqual(message["phase"], "after")
        self.assertTrue(mod._callback_announced)

    def test_before_and_after_callbacks_share_one_announcement_and_command_drain(self) -> None:
        mod = self.make_mod()
        command = {"operation_id": "test-operation-1"}
        mod._incoming.put_nowait(command)
        mod._test_delivery_enabled = True
        executed: list[dict] = []
        mod._execute_test_delivery = executed.append

        mod.before_main_loop()
        mod.after_main_loop()

        self.assertEqual(mod._outgoing.qsize(), 1)
        self.assertEqual(mod._outgoing.get_nowait()["phase"], "before")
        self.assertEqual(executed, [command])

    def test_main_loop_callback_respects_stop(self) -> None:
        stopped_mod = self.make_mod()
        stopped_mod._stop.set()
        stopped_mod.before_main_loop()
        stopped_mod.after_main_loop()
        self.assertTrue(stopped_mod._outgoing.empty())

    def test_nmspy_discovers_both_zero_argument_main_loop_callbacks(self) -> None:
        mod = self.make_mod()
        callbacks = {
            callback.__name__: callback
            for callback in mod.get_members(lambda value: hasattr(value, "_custom_trigger"))
        }

        self.assertEqual(set(callbacks), {"before_main_loop", "after_main_loop"})
        for callback in callbacks.values():
            self.assertEqual(callback._custom_trigger, "MAIN_LOOP")
        self.assertNotEqual(
            callbacks["before_main_loop"]._hook_time,
            callbacks["after_main_loop"]._hook_time,
        )

    def test_runtime_command_validator_accepts_only_the_fixed_local_test_item(self) -> None:
        valid = {
            "type": "delivery.item",
            "protocol": 1,
            "operation_id": "test-operation-1",
            "deadline_epoch_ms": 1_900_000_000_000,
            "target": {"kind": "local_player"},
            "payload": {
                "domain": "substance",
                "game_id": "FUEL1",
                "quantity": 500,
                "notification_preference": "default",
            },
        }
        self.assertTrue(CourierDiagnostics._is_test_delivery_command(valid))
        self.assertFalse(
            CourierDiagnostics._is_test_delivery_command({**valid, "protocol": True})
        )
        self.assertFalse(
            CourierDiagnostics._is_test_delivery_command({**valid, "deadline_epoch_ms": True})
        )
        self.assertFalse(
            CourierDiagnostics._is_test_delivery_command(
                {**valid, "target": {"kind": "network_player"}}
            )
        )


if __name__ == "__main__":
    unittest.main()
