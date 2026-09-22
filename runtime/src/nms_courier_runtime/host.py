"""Restricted local host for a diagnostics-only in-process runtime module."""

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


class PipeSession:
    def __init__(self, config: dict[str, Any], stop: threading.Event, ready: threading.Event):
        self.config = config
        self.stop = stop
        self.ready = ready
        self.handle = None

    def _emit(self, event: str, **values: Any) -> None:
        print(EVENT_PREFIX + json.dumps({"event": event, **values}, separators=(",", ":")), flush=True)

    def _read_exact(self, length: int, process: psutil.Process) -> bytes:
        chunks: list[bytes] = []
        remaining = length
        while remaining and not self.stop.is_set():
            if not process.is_running():
                raise ConnectionError("Target game process exited.")
            peek_result = win32pipe.PeekNamedPipe(self.handle, min(remaining, 65536))
            if isinstance(peek_result, tuple):
                byte_values = [value for value in peek_result if isinstance(value, (bytes, bytearray))]
                available = len(byte_values[0]) if byte_values else int(peek_result[0])
            else:
                available = len(peek_result) if isinstance(peek_result, (bytes, bytearray)) else int(peek_result)
            if available <= 0:
                time.sleep(0.02)
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
            self._emit("bridge_authenticated", pid=peer_pid, sessionId=self.config["session_id"])
            while not self.stop.is_set() and process.is_running():
                prefix = self._read_exact(4, process)
                size = int.from_bytes(prefix, "little", signed=False)
                if not size or size > MAX_CONTROL_FRAME_BYTES:
                    raise FrameError("Control frame is outside the allowed size.")
                message = decode_frame(self._read_exact(size, process))
                if (
                    message.get("type") == "callback_ready"
                    and message.get("protocol") == 1
                    and message.get("pid") == self.config["pid"]
                ):
                    self._emit("callback_ready", pid=peer_pid)
                else:
                    self._emit("bridge_rejected", reason="UNEXPECTED_DIAGNOSTIC_MESSAGE")
                    return
        except ConnectionError as error:
            if not process.is_running():
                self._emit("game_exited")
            else:
                self._emit("pipe_failed", reason=type(error).__name__)
        except Exception as error:
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-stdin", action="store_true", required=True)
    parser.parse_args()
    try:
        config = _validate_config(json.load(sys.stdin))
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
                },
                "internal_mod_dir": str(Path(__file__).resolve().parent.parent / "nmspy" / "_internal_mods"),
            },
        )
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
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
