"""Authenticated bridge module with one exact-build Carbon test operation."""

from __future__ import annotations

import os
import queue
import threading
import time
from typing import Any

import ctypes
import pymhf.core._internal as internal
from nmspy.decorators import main_loop
from pymhf import Mod

from nms_courier_runtime.authentication import PROTOCOL_VERSION, handshake_proof
from nms_courier_runtime.inventory_179666 import (
    BUILD_SHA256,
    CARBON_GAME_ID,
    APPLICATION_DATA_POINTER_RVA,
    TEST_DELIVERY_QUANTITY,
    call_inventory_add,
    make_carbon_element,
    personal_inventory_snapshot,
    validate_add_entry_point,
)
from nms_courier_runtime.pipe_client import PipeClient


class CourierDiagnostics(Mod):
    __author__ = "NMS Courier"
    __description__ = "Local runtime diagnostics and exact-build Carbon test delivery"
    __version__ = "0.1.0"

    def __init__(self):
        super().__init__()
        config: dict[str, Any] = internal.CONFIG.get("courier", {})
        self._pipe = PipeClient(config["pipe_name"])
        self._outgoing: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=8)
        self._incoming: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=8)
        self._callback_announced = False
        self._seen_operations: set[str] = set()
        self._executable_sha256 = str(config["executable_sha256"]).lower()
        self._test_delivery_enabled = (
            config.get("allow_test_delivery") is True
            and self._executable_sha256 == BUILD_SHA256
        )
        self._stop = threading.Event()

        challenge = self._pipe.read()
        if challenge.get("type") != "challenge" or challenge.get("protocol") != PROTOCOL_VERSION:
            self._pipe.close()
            raise RuntimeError("Courier bridge protocol challenge was rejected.")

        pid = os.getpid()
        fingerprint = str(config["executable_sha256"]).lower()
        session_id = str(config["session_id"])
        token = bytes.fromhex(str(config["token_hex"]))
        self._pipe.write(
            {
                "type": "hello",
                "protocol": PROTOCOL_VERSION,
                "pid": pid,
                "executable_sha256": fingerprint,
                "session_id": session_id,
                "proof": handshake_proof(token, str(challenge["nonce"]), pid, fingerprint, session_id),
            }
        )
        acknowledgement = self._pipe.read()
        if (
            acknowledgement.get("type") != "hello_ack"
            or acknowledgement.get("session_id") != session_id
            or acknowledgement.get("protocol") != PROTOCOL_VERSION
        ):
            self._pipe.close()
            raise RuntimeError("Courier bridge rejected the diagnostic handshake.")

        self._writer = threading.Thread(target=self._write_events, name="CourierPipeWriter", daemon=True)
        self._writer.start()
        self._reader = threading.Thread(target=self._read_commands, name="CourierPipeReader", daemon=True)
        self._reader.start()

    def _read_commands(self) -> None:
        while not self._stop.is_set():
            try:
                message = self._pipe.read()
            except Exception:
                self._stop.set()
                self._pipe.close()
                return
            if not self._is_test_delivery_command(message):
                self._queue_result(
                    {
                        "type": "delivery_result",
                        "protocol": PROTOCOL_VERSION,
                        "operation_id": str(message.get("operation_id", "invalid"))[:128],
                        "state": "rejected",
                        "game_id": CARBON_GAME_ID,
                        "requested_quantity": TEST_DELIVERY_QUANTITY,
                        "applied_quantity": 0,
                        "before_quantity": None,
                        "after_quantity": None,
                        "reason": "ACTION_NOT_IMPLEMENTED",
                    }
                )
                continue
            try:
                self._incoming.put_nowait(message)
            except queue.Full:
                self._queue_result(
                    self._result(
                        message["operation_id"],
                        "rejected",
                        reason="QUEUE_FULL",
                    )
                )

    @staticmethod
    def _is_test_delivery_command(message: Any) -> bool:
        if not isinstance(message, dict) or set(message) != {
            "type",
            "protocol",
            "operation_id",
            "deadline_epoch_ms",
            "target",
            "payload",
        }:
            return False
        target = message.get("target")
        payload = message.get("payload")
        return (
            message.get("type") == "delivery.item"
            and type(message.get("protocol")) is int
            and message["protocol"] == PROTOCOL_VERSION
            and isinstance(message.get("operation_id"), str)
            and 1 <= len(message["operation_id"]) <= 128
            and type(message.get("deadline_epoch_ms")) is int
            and isinstance(target, dict)
            and target == {"kind": "local_player"}
            and isinstance(payload, dict)
            and payload
            == {
                "domain": "substance",
                "game_id": CARBON_GAME_ID,
                "quantity": TEST_DELIVERY_QUANTITY,
                "notification_preference": "default",
            }
        )

    def _result(
        self,
        operation_id: str,
        state: str,
        *,
        before: int | None = None,
        after: int | None = None,
        applied: int = 0,
        reason: str | None = None,
        index: tuple[int, int] | None = None,
    ) -> dict[str, Any]:
        result: dict[str, Any] = {
            "type": "delivery_result",
            "protocol": PROTOCOL_VERSION,
            "operation_id": operation_id,
            "state": state,
            "game_id": CARBON_GAME_ID,
            "requested_quantity": TEST_DELIVERY_QUANTITY,
            "applied_quantity": applied,
            "before_quantity": before,
            "after_quantity": after,
            "notification": "not_attempted",
        }
        if reason:
            result["reason"] = reason
        if index is not None:
            result["result_index"] = {"x": index[0], "y": index[1]}
        return result

    def _queue_result(self, result: dict[str, Any]) -> None:
        try:
            self._outgoing.put_nowait(result)
        except queue.Full:
            self._stop.set()
            self._pipe.close()

    def _execute_test_delivery(self, command: dict[str, Any]) -> None:
        operation_id = command["operation_id"]
        if operation_id in self._seen_operations:
            self._queue_result(self._result(operation_id, "rejected", reason="DUPLICATE_REQUEST"))
            return
        self._seen_operations.add(operation_id)

        if command["deadline_epoch_ms"] <= int(time.time() * 1000):
            self._queue_result(self._result(operation_id, "rejected", reason="REQUEST_EXPIRED"))
            return
        if not self._test_delivery_enabled:
            self._queue_result(
                self._result(operation_id, "rejected", reason="UNSUPPORTED_GAME_VERSION")
            )
            return

        data_address = ctypes.c_void_p.from_address(
            int(internal.BASE_ADDRESS) + APPLICATION_DATA_POINTER_RVA
        ).value
        if not data_address:
            self._queue_result(self._result(operation_id, "rejected", reason="PLAYER_NOT_READY"))
            return
        if not validate_add_entry_point(internal.BASE_ADDRESS, self._executable_sha256):
            self._queue_result(
                self._result(operation_id, "rejected", reason="SIGNATURE_NOT_FOUND")
            )
            return

        store_address: int | None = None
        before_quantity: int | None = None
        dispatched = False
        try:
            store_address, before = personal_inventory_snapshot(int(data_address))
            before_quantity = before.carbon_quantity
            if (
                store_address <= 0
                or before.width <= 0
                or before.height <= 0
                or before.capacity <= 0
                or not before.carbon_stacks
                or any(stack.max_amount < TEST_DELIVERY_QUANTITY for stack in before.carbon_stacks)
            ):
                self._queue_result(
                    self._result(
                        operation_id,
                        "rejected",
                        before=before_quantity,
                        after=before_quantity,
                        reason="CARBON_TEMPLATE_UNAVAILABLE",
                    )
                )
                return
            element = make_carbon_element(store_address, TEST_DELIVERY_QUANTITY)
            dispatched = True
            result_index = call_inventory_add(store_address, element)
        except Exception:
            if not dispatched:
                self._queue_result(
                    self._result(
                        operation_id,
                        "rejected",
                        before=before_quantity,
                        after=before_quantity,
                        reason="INVENTORY_UNAVAILABLE",
                    )
                )
                return
            self._queue_result(
                self._result(
                    operation_id,
                    "unknown",
                    before=before_quantity,
                    reason="NATIVE_CALL_OUTCOME_UNKNOWN",
                )
            )
            return

        try:
            after = personal_inventory_snapshot(int(data_address))[1]
        except Exception:
            self._queue_result(
                self._result(
                    operation_id,
                    "unknown",
                    before=before_quantity,
                    reason="POSTCONDITION_UNAVAILABLE",
                )
            )
            return

        after_quantity = after.carbon_quantity
        applied = after_quantity - (before_quantity or 0)
        index = (result_index.x, result_index.y)
        if applied == TEST_DELIVERY_QUANTITY:
            state = "succeeded"
            reason = None
        elif 0 < applied < TEST_DELIVERY_QUANTITY:
            state = "partial"
            reason = "NATIVE_PARTIAL_INSERTION"
        elif applied == 0 and index == (-1, -1):
            state = "rejected"
            reason = "NATIVE_ADD_REJECTED"
        else:
            state = "unknown"
            reason = "POSTCONDITION_MISMATCH"
        self._queue_result(
            self._result(
                operation_id,
                state,
                before=before_quantity,
                after=after_quantity,
                applied=max(0, applied),
                reason=reason,
                index=index,
            )
        )

    def _write_events(self) -> None:
        while not self._stop.is_set():
            try:
                message = self._outgoing.get(timeout=0.5)
            except queue.Empty:
                continue
            try:
                self._pipe.write(message)
            except Exception:
                self._stop.set()
                self._pipe.close()
                return

    def _on_main_loop(self, phase: str) -> None:
        if self._stop.is_set():
            return
        if not self._callback_announced:
            self._callback_announced = True
            try:
                self._outgoing.put_nowait(
                    {
                        "type": "callback_ready",
                        "protocol": PROTOCOL_VERSION,
                        "pid": os.getpid(),
                        "phase": phase,
                        "observed_at": time.time(),
                    }
                )
            except queue.Full:
                pass
        try:
            command = self._incoming.get_nowait()
        except queue.Empty:
            return
        if not self._test_delivery_enabled:
            self._queue_result(
                self._result(
                    str(command.get("operation_id", "invalid"))[:128],
                    "rejected",
                    reason="UNSUPPORTED_GAME_VERSION",
                )
            )
            return
        self._execute_test_delivery(command)

    @main_loop.before
    def before_main_loop(self) -> None:
        self._on_main_loop("before")

    @main_loop.after
    def after_main_loop(self) -> None:
        self._on_main_loop("after")
