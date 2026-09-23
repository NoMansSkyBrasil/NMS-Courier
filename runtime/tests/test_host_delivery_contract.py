"""Tests for the one-shot Python test-delivery contract and response evidence."""

from __future__ import annotations

import sys
import threading
import unittest
from pathlib import Path


RUNTIME_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RUNTIME_ROOT / "src"))

from nms_courier_runtime.host import (  # noqa: E402
    PipeSession,
    TEST_BUILD_SHA256,
    _validate_delivery_result,
    _validate_test_delivery_command,
)


def command() -> dict:
    return {
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


def result(state: str = "succeeded", **overrides: object) -> dict:
    message = {
        "type": "delivery_result",
        "protocol": 1,
        "operation_id": "test-operation-1",
        "state": state,
        "game_id": "FUEL1",
        "requested_quantity": 500,
        "applied_quantity": 500,
        "before_quantity": 115,
        "after_quantity": 615,
        "notification": "not_attempted",
    }
    message.update(overrides)
    return message


class HostDeliveryContractTests(unittest.TestCase):
    def test_command_is_limited_to_local_carbon_500_on_the_exact_build(self) -> None:
        parsed = _validate_test_delivery_command(command(), TEST_BUILD_SHA256)
        self.assertEqual(parsed["payload"]["game_id"], "FUEL1")
        self.assertIsNone(_validate_test_delivery_command(None, TEST_BUILD_SHA256))

        for changed in (
            {**command(), "protocol": True},
            {**command(), "deadline_epoch_ms": True},
            {**command(), "target": {"kind": "network_player"}},
            {
                **command(),
                "payload": {
                    "domain": "substance",
                    "game_id": "FUEL1",
                    "quantity": 500,
                    "notification_preference": "default",
                    "extra": True,
                },
            },
        ):
            with self.subTest(changed=changed):
                with self.assertRaises(ValueError):
                    _validate_test_delivery_command(changed, TEST_BUILD_SHA256)

        with self.assertRaises(ValueError):
            _validate_test_delivery_command(command(), "00" * 32)

    def test_success_requires_the_observed_exact_quantity_delta(self) -> None:
        self.assertTrue(_validate_delivery_result(result(), command()))
        self.assertFalse(
            _validate_delivery_result(result(after_quantity=614), command())
        )
        self.assertFalse(
            _validate_delivery_result(result(applied_quantity=499), command())
        )

    def test_partial_rejected_unknown_and_unmatched_results_remain_distinct(self) -> None:
        self.assertTrue(
            _validate_delivery_result(
                result(
                    "partial",
                    applied_quantity=120,
                    after_quantity=235,
                    reason="NATIVE_PARTIAL_INSERTION",
                ),
                command(),
            )
        )
        self.assertTrue(
            _validate_delivery_result(
                result(
                    "rejected",
                    applied_quantity=0,
                    before_quantity=115,
                    after_quantity=115,
                    reason="NATIVE_ADD_REJECTED",
                ),
                command(),
            )
        )
        self.assertTrue(
            _validate_delivery_result(
                result(
                    "unknown",
                    applied_quantity=0,
                    before_quantity=115,
                    after_quantity=None,
                    reason="POSTCONDITION_UNAVAILABLE",
                ),
                command(),
            )
        )
        self.assertFalse(
            _validate_delivery_result(
                result(operation_id="another-operation"), command()
            )
        )
        self.assertFalse(
            _validate_delivery_result(
                result(applied_quantity=True), command()
            )
        )

    def test_pipe_session_dispatches_once_after_the_verified_main_loop_callback(self) -> None:
        session = PipeSession.__new__(PipeSession)
        session.config = {"pid": 4321}
        session.stop = threading.Event()
        session.ready = threading.Event()
        session.handle = object()
        session.command = command()
        session.delivery_dispatched = False
        session.delivery_reported = False
        session.bridge_authenticated = False
        session.callback_seen = False
        session.response_deadline = None
        writes: list[dict] = []
        events: list[tuple[str, dict]] = []
        session._write = writes.append
        session._emit = lambda event, **values: events.append((event, values))
        callback = {
            "type": "callback_ready",
            "protocol": 1,
            "pid": 4321,
            "phase": "before",
            "observed_at": 1.0,
        }

        self.assertTrue(session._handle_callback(callback, 4321))
        self.assertTrue(session._handle_callback(callback, 4321))

        self.assertEqual(writes, [command()])
        self.assertTrue(session.delivery_dispatched)
        self.assertTrue(session.callback_seen)
        self.assertEqual(events[0], ("callback_ready", {"pid": 4321, "phase": "before"}))
        self.assertEqual(sum(event == "delivery_dispatched" for event, _ in events), 1)

    def test_pipe_session_ignores_invalid_callback_phase(self) -> None:
        session = PipeSession.__new__(PipeSession)
        session.config = {"pid": 4321}
        session.command = None
        session.delivery_dispatched = False
        session.callback_seen = False

        self.assertFalse(
            session._handle_callback(
                {"type": "callback_ready", "protocol": 1, "pid": 4321, "phase": []},
                4321,
            )
        )
        self.assertFalse(session.callback_seen)

    def test_early_runtime_exit_is_rejected_before_dispatch_and_unknown_after_dispatch(self) -> None:
        session = PipeSession.__new__(PipeSession)
        session.command = command()
        session.delivery_dispatched = False
        session.delivery_reported = False
        session.bridge_authenticated = False
        session.callback_seen = False
        events: list[tuple[str, dict]] = []
        session._emit = lambda event, **values: events.append((event, values))

        self.assertTrue(session._report_early_runtime_exit())
        self.assertEqual(events[0][0], "delivery_rejected")
        self.assertEqual(events[0][1]["reason"], "INJECTED_RUNTIME_EXITED_BEFORE_DISPATCH")
        self.assertEqual(events[0][1]["phase"], "before_bridge_authentication")
        self.assertFalse(events[0][1]["dispatched"])
        self.assertFalse(session._report_early_runtime_exit())

        session.delivery_reported = False
        session.delivery_dispatched = True
        session._report_early_runtime_exit()
        self.assertEqual(events[1][0], "delivery_unknown")
        self.assertEqual(events[1][1]["reason"], "INJECTED_RUNTIME_EXITED_AFTER_DISPATCH")

    def test_lost_response_is_reported_as_unknown_without_resending(self) -> None:
        session = PipeSession.__new__(PipeSession)
        session.command = command()
        session.delivery_dispatched = True
        session.delivery_reported = False
        events: list[tuple[str, dict]] = []
        session._emit = lambda event, **values: events.append((event, values))

        session._mark_unknown("RESPONSE_TIMEOUT")
        session._mark_unknown("RESPONSE_TIMEOUT")

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0][0], "delivery_unknown")
        self.assertEqual(events[0][1]["reason"], "RESPONSE_TIMEOUT")


if __name__ == "__main__":
    unittest.main()
