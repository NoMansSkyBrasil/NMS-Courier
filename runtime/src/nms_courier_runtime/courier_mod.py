"""Diagnostics-only NMS.py module. It has no game mutation commands."""

from __future__ import annotations

import os
import queue
import threading
import time
from typing import Any

import pymhf.core._internal as internal
from nmspy.decorators import main_loop
from pymhf import Mod

from nms_courier_runtime.authentication import PROTOCOL_VERSION, handshake_proof
from nms_courier_runtime.pipe_client import PipeClient


class CourierDiagnostics(Mod):
    __author__ = "NMS Courier"
    __description__ = "Read-only local runtime diagnostics"
    __version__ = "0.1.0"

    def __init__(self):
        super().__init__()
        config: dict[str, Any] = internal.CONFIG.get("courier", {})
        self._pipe = PipeClient(config["pipe_name"])
        self._outgoing: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=8)
        self._callback_announced = False
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

    @main_loop.after
    def after_main_loop(self, _this: object) -> None:
        if self._callback_announced or self._stop.is_set():
            return
        self._callback_announced = True
        try:
            self._outgoing.put_nowait(
                {
                    "type": "callback_ready",
                    "protocol": PROTOCOL_VERSION,
                    "pid": os.getpid(),
                    "observed_at": time.time(),
                }
            )
        except queue.Full:
            pass
