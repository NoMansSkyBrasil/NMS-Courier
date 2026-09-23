"""Restricted local host for runtime diagnostics and one exact-build test operation."""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import secrets
import sys
import threading
import time
from pathlib import Path
from typing import Any

import psutil
import win32file
import win32pipe

from nms_courier_runtime.authentication import validate_hello
from nms_courier_runtime.framing import MAX_CONTROL_FRAME_BYTES, FrameError, decode_frame, encode_frame
from nms_courier_runtime.secure_pipe import create_user_only_pipe

EVENT_PREFIX = "NMSCOURIER_EVENT "
TEST_BUILD_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
TEST_OPERATION_ID_MAX_LENGTH = 128
TEST_DELIVERY_DEADLINE_SECONDS = 60
TEST_DELIVERY_RESPONSE_SECONDS = 30


def _is_integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _validate_test_delivery_command(value: Any, executable_sha256: str) -> dict[str, Any] | None:
    if value is None:
        return None
    if not isinstance(value, dict) or set(value) != {
        "type",
        "protocol",
        "operation_id",
        "deadline_epoch_ms",
        "target",
        "payload",
    }:
        raise ValueError("Invalid test delivery command.")
    if (
        executable_sha256.lower() != TEST_BUILD_SHA256
        or value.get("type") != "delivery.item"
        or not _is_integer(value.get("protocol"))
        or value["protocol"] != 1
        or not isinstance(value.get("operation_id"), str)
        or not 1 <= len(value["operation_id"]) <= TEST_OPERATION_ID_MAX_LENGTH
        or not _is_integer(value.get("deadline_epoch_ms"))
        or value.get("target") != {"kind": "local_player"}
        or value.get("payload")
        != {
            "domain": "substance",
            "game_id": "FUEL1",
            "quantity": 500,
            "notification_preference": "default",
        }
    ):
        raise ValueError("Test delivery is restricted to the exact local Carbon x500 operation.")
    return value


def _validate_delivery_result(value: Any, command: dict[str, Any]) -> bool:
    required = {
        "type",
        "protocol",
        "operation_id",
        "state",
        "game_id",
        "requested_quantity",
        "applied_quantity",
        "before_quantity",
        "after_quantity",
        "notification",
    }
    if not isinstance(value, dict) or not required.issubset(value) or set(value) - required - {
        "reason",
        "result_index",
    }:
        return False
    if (
        value.get("type") != "delivery_result"
        or not _is_integer(value.get("protocol"))
        or value["protocol"] != 1
        or value.get("operation_id") != command["operation_id"]
        or value.get("game_id") != "FUEL1"
        or not _is_integer(value.get("requested_quantity"))
        or value["requested_quantity"] != 500
        or not _is_integer(value.get("applied_quantity"))
        or not 0 <= value["applied_quantity"] <= 500
        or value.get("notification") != "not_attempted"
    ):
        return False

    before = value.get("before_quantity")
    after = value.get("after_quantity")
    if before is not None and (not _is_integer(before) or before < 0):
        return False
    if after is not None and (not _is_integer(after) or after < 0):
        return False

    state = value.get("state")
    applied = value["applied_quantity"]
    if state == "succeeded":
        if applied != 500 or before is None or after is None or after - before != applied:
            return False
    elif state == "partial":
        if not 0 < applied < 500 or before is None or after is None or after - before != applied:
            return False
    elif state == "rejected":
        if applied != 0 or ((before is None) != (after is None)) or (
            before is not None and before != after
        ):
            return False
    elif state != "unknown":
        return False

    reason = value.get("reason")
    if reason is not None and (not isinstance(reason, str) or len(reason) > 128):
        return False
    result_index = value.get("result_index")
    if result_index is not None and (
        not isinstance(result_index, dict)
        or set(result_index) != {"x", "y"}
        or not _is_integer(result_index.get("x"))
        or not _is_integer(result_index.get("y"))
    ):
        return False
    return True


class PipeSession:
    def __init__(self, config: dict[str, Any], stop: threading.Event, ready: threading.Event):
        self.config = config
        self.stop = stop
        self.ready = ready
        self.handle = None
        self.command = config.get("test_delivery_command")
        self.delivery_dispatched = False
        self.delivery_reported = False
        self.bridge_authenticated = False
        self.callback_seen = False
        self.response_deadline: float | None = None

    def _emit(self, event: str, **values: Any) -> None:
        print(EVENT_PREFIX + json.dumps({"event": event, **values}, separators=(",", ":")), flush=True)

    def _read_exact(
        self,
        length: int,
        process: psutil.Process,
        deadline_monotonic: float | None = None,
    ) -> bytes:
        chunks: list[bytes] = []
        remaining = length
        while remaining and not self.stop.is_set():
            if deadline_monotonic is not None and time.monotonic() >= deadline_monotonic:
                raise TimeoutError("Timed out waiting for a Named Pipe frame.")
            if not process.is_running():
                raise ConnectionError("Target game process exited.")
            peek_result = win32pipe.PeekNamedPipe(self.handle, min(remaining, 65536))
            if isinstance(peek_result, tuple):
                byte_values = [value for value in peek_result if isinstance(value, (bytes, bytearray))]
                available = len(byte_values[0]) if byte_values else int(peek_result[0])
            else:
                available = len(peek_result) if isinstance(peek_result, (bytes, bytearray)) else int(peek_result)
            if available <= 0:
                time.sleep(0.02 if deadline_monotonic is None else min(0.02, max(0.0, deadline_monotonic - time.monotonic())))
                continue
            error, chunk = win32file.ReadFile(self.handle, min(remaining, available, 65536))
            if error or not chunk:
                raise ConnectionError("Named Pipe closed while reading a frame.")
            chunks.append(chunk)
            remaining -= len(chunk)
        if remaining:
            raise ConnectionError("Pipe session stopped.")
        return b"".join(chunks)

    def _write(self, message: dict[str, Any]) -> None:
        frame = encode_frame(message)
        error, written = win32file.WriteFile(self.handle, frame)
        if error or written != len(frame):
            raise ConnectionError("Named Pipe did not accept the complete frame.")

    def _read_message(self, process: psutil.Process, deadline_monotonic: float | None) -> dict[str, Any]:
        prefix = self._read_exact(4, process, deadline_monotonic)
        size = int.from_bytes(prefix, "little", signed=False)
        if not size or size > MAX_CONTROL_FRAME_BYTES:
            raise FrameError("Control frame is outside the allowed size.")
        return decode_frame(self._read_exact(size, process, deadline_monotonic))

    def _mark_unknown(self, reason: str) -> None:
        if self.delivery_dispatched and not self.delivery_reported and self.command is not None:
            self.delivery_reported = True
            self._emit(
                "delivery_unknown",
                operationId=self.command["operation_id"],
                reason=reason,
                dispatched=True,
            )

    def _report_early_runtime_exit(self) -> bool:
        if self.command is None or self.delivery_reported:
            return False
        if self.delivery_dispatched:
            self._mark_unknown("INJECTED_RUNTIME_EXITED_AFTER_DISPATCH")
        else:
            self._emit(
                "delivery_rejected",
                operationId=self.command["operation_id"],
                reason="INJECTED_RUNTIME_EXITED_BEFORE_DISPATCH",
                phase=(
                    "before_bridge_authentication"
                    if not self.bridge_authenticated
                    else "before_game_callback"
                    if not self.callback_seen
                    else "after_game_callback"
                ),
                dispatched=False,
            )
            self.delivery_reported = True
        return True

    def _handle_callback(self, message: dict[str, Any], peer_pid: int) -> bool:
        phase = message.get("phase", "after")
        if (
            message.get("type") != "callback_ready"
            or message.get("protocol") != 1
            or message.get("pid") != self.config["pid"]
            or not isinstance(phase, str)
            or phase not in {"before", "after"}
        ):
            return False
        self.callback_seen = True
        self._emit("callback_ready", pid=peer_pid, phase=phase)
        if self.command is None or self.delivery_dispatched:
            return True
        if self.command["deadline_epoch_ms"] <= int(time.time() * 1000):
            self._emit(
                "delivery_rejected",
                operationId=self.command["operation_id"],
                reason="CALLBACK_TIMEOUT",
                dispatched=False,
            )
            self.delivery_reported = True
            return False
        self._write(self.command)
        self.delivery_dispatched = True
        self.response_deadline = time.monotonic() + TEST_DELIVERY_RESPONSE_SECONDS
        self._emit("delivery_dispatched", operationId=self.command["operation_id"])
        return True

    def run(self) -> None:
        process = psutil.Process(self.config["pid"])
        server_handle = create_user_only_pipe(self.config["pipe_name"])
        self.handle = server_handle
        self.ready.set()
        try:
            try:
                win32pipe.ConnectNamedPipe(server_handle, None)
            except Exception as error:
                if getattr(error, "winerror", None) != 535:
                    raise

            peer_pid = win32pipe.GetNamedPipeClientProcessId(server_handle)
            if peer_pid != self.config["pid"]:
                self._emit("bridge_rejected", reason="PIPE_PEER_PID_MISMATCH")
                return

            nonce = secrets.token_hex(32)
            self._write({"type": "challenge", "protocol": 1, "nonce": nonce})
            prefix = self._read_exact(4, process)
            size = int.from_bytes(prefix, "little", signed=False)
            if not size or size > MAX_CONTROL_FRAME_BYTES:
                raise FrameError("Control frame is outside the allowed size.")
            hello = decode_frame(self._read_exact(size, process))
            if not validate_hello(
                hello,
                bytes.fromhex(self.config["token_hex"]),
                nonce,
                self.config["pid"],
                self.config["executable_sha256"],
                self.config["session_id"],
            ):
                self._emit("bridge_rejected", reason="HANDSHAKE_VALIDATION_FAILED")
                return

            self._write({"type": "hello_ack", "protocol": 1, "session_id": self.config["session_id"]})
            self.bridge_authenticated = True
            self._emit("bridge_authenticated", pid=peer_pid, sessionId=self.config["session_id"])
            callback_deadline = None
            if self.command is not None:
                callback_deadline = time.monotonic() + max(
                    0.0,
                    (self.command["deadline_epoch_ms"] - int(time.time() * 1000)) / 1000,
                )
            while not self.stop.is_set() and process.is_running():
                deadline = self.response_deadline if self.delivery_dispatched else callback_deadline
                message = self._read_message(process, deadline)
                if self._handle_callback(message, peer_pid):
                    continue
                if self.delivery_reported and not self.delivery_dispatched:
                    return
                if self.delivery_dispatched and self.command is not None:
                    if _validate_delivery_result(message, self.command):
                        self.delivery_reported = True
                        self._emit(
                            "delivery_result",
                            **{key: value for key, value in message.items() if key != "type"},
                        )
                    else:
                        self._mark_unknown("INVALID_OR_UNMATCHED_RESULT")
                    return
                self._emit("bridge_rejected", reason="UNEXPECTED_DIAGNOSTIC_MESSAGE")
                return
        except TimeoutError:
            if self.command is not None and not self.delivery_dispatched:
                self.delivery_reported = True
                self._emit(
                    "delivery_rejected",
                    operationId=self.command["operation_id"],
                    reason="CALLBACK_TIMEOUT",
                    dispatched=False,
                )
            elif self.delivery_dispatched:
                self._mark_unknown("RESPONSE_TIMEOUT")
            else:
                self._emit("pipe_failed", reason="TimeoutError")
        except ConnectionError as error:
            if not process.is_running():
                if self.delivery_dispatched:
                    self._mark_unknown("GAME_EXITED_AFTER_DISPATCH")
                else:
                    self._emit("game_exited")
            else:
                if self.delivery_dispatched:
                    self._mark_unknown("PIPE_LOST_AFTER_DISPATCH")
                else:
                    self._emit("pipe_failed", reason=type(error).__name__)
        except Exception as error:
            if self.delivery_dispatched:
                self._mark_unknown("HOST_ERROR_AFTER_DISPATCH")
            else:
                self._emit("pipe_failed", reason=type(error).__name__)
        finally:
            try:
                win32pipe.DisconnectNamedPipe(server_handle)
            except Exception:
                pass
            win32file.CloseHandle(server_handle)
            self.handle = None


def _validate_config(config: Any) -> dict[str, Any]:
    if not isinstance(config, dict):
        raise ValueError("Invalid launcher configuration.")
    required_strings = ("executable_path", "executable_sha256", "pipe_name", "token_hex", "session_id")
    if any(not isinstance(config.get(name), str) for name in required_strings):
        raise ValueError("Invalid launcher configuration.")
    if not isinstance(config.get("pid"), int) or config["pid"] <= 0:
        raise ValueError("Invalid target process identity.")
    if not isinstance(config.get("process_started_at"), (int, float)):
        raise ValueError("Invalid target process start time.")
    if not isinstance(config.get("log_directory"), str):
        raise ValueError("Invalid diagnostic log location.")
    if len(config["executable_sha256"]) != 64 or len(config["token_hex"]) != 64:
        raise ValueError("Invalid launcher credential.")
    bytes.fromhex(config["executable_sha256"])
    bytes.fromhex(config["token_hex"])
    if len(config["pipe_name"]) > 180 or not config["pipe_name"].startswith("nms-courier-"):
        raise ValueError("Invalid private pipe name.")
    if "test_delivery_command" in config:
        command = _validate_test_delivery_command(
            config["test_delivery_command"], config["executable_sha256"]
        )
        if command is None:
            raise ValueError("Invalid test delivery command.")
    return config


def _verify_target(config: dict[str, Any]) -> None:
    process = psutil.Process(config["pid"])
    expected_path = os.path.normcase(os.path.realpath(config["executable_path"]))
    actual_path = os.path.normcase(os.path.realpath(process.exe()))
    if actual_path != expected_path:
        raise ValueError("Target executable path changed before runtime start.")
    digest = hashlib.sha256(Path(actual_path).read_bytes()).hexdigest()
    if not hmac.compare_digest(digest, config["executable_sha256"].lower()):
        raise ValueError("Target executable fingerprint changed before runtime start.")
    observed_start = float(config["process_started_at"])
    if abs(process.create_time() - observed_start) > 2.0:
        raise ValueError("Target process identity changed before runtime start.")


def run_config(value: Any) -> int:
    try:
        config = _validate_config(value)
        _verify_target(config)
    except Exception as error:
        print(EVENT_PREFIX + json.dumps({"event": "host_failed", "reason": type(error).__name__}), flush=True)
        return 1

    stop = threading.Event()
    ready = threading.Event()
    session = PipeSession(config, stop, ready)
    server = threading.Thread(target=session.run, name="CourierNamedPipeHost", daemon=True)
    server.start()
    if not ready.wait(timeout=5.0):
        stop.set()
        print(EVENT_PREFIX + json.dumps({"event": "host_failed", "reason": "PIPE_START_TIMEOUT"}), flush=True)
        return 1
    print(EVENT_PREFIX + json.dumps({"event": "host_ready"}), flush=True)

    mod_path = str(Path(__file__).with_name("courier_mod.py"))
    log_path = Path(config["log_directory"])
    log_path.mkdir(parents=True, exist_ok=True)

    runtime_returned = False
    try:
        from pymhf.main import load_mod_file

        load_mod_file(
            mod_path,
            {
                "pid": config["pid"],
                "start_exe": False,
                "interactive_console": False,
                "execution_server": {"enabled": False},
                "gui": {"shown": False},
                "logging": {"shown": False, "log_dir": str(log_path)},
                "mod_save_dir": str(log_path),
                "courier": {
                    "pipe_name": config["pipe_name"],
                    "token_hex": config["token_hex"],
                    "session_id": config["session_id"],
                    "executable_sha256": config["executable_sha256"],
                    "allow_test_delivery": "test_delivery_command" in config,
                },
                "internal_mod_dir": str(Path(__file__).resolve().parent.parent / "nmspy" / "_internal_mods"),
            },
        )
        runtime_returned = True
    except Exception as error:
        print(EVENT_PREFIX + json.dumps({"event": "host_failed", "reason": type(error).__name__}), flush=True)
        return 1
    finally:
        stop.set()
        if session.handle is not None:
            try:
                win32pipe.DisconnectNamedPipe(session.handle)
            except Exception:
                pass
        server.join(timeout=1.0)
    if runtime_returned and session._report_early_runtime_exit():
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-stdin", action="store_true", required=True)
    parser.parse_args()
    try:
        value = json.load(sys.stdin)
    except Exception as error:
        print(EVENT_PREFIX + json.dumps({"event": "host_failed", "reason": type(error).__name__}), flush=True)
        return 1
    return run_config(value)


if __name__ == "__main__":
    raise SystemExit(main())
