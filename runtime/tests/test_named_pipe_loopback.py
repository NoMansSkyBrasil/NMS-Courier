"""Exercise the Windows Named Pipe and authenticated protocol in one user session."""

from __future__ import annotations

import hashlib
import importlib.util
import os
import sys
import threading
import time
import uuid
from pathlib import Path

if importlib.util.find_spec("nms_courier_runtime") is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nms_courier_runtime.authentication import handshake_proof  # noqa: E402
from nms_courier_runtime.host import PipeSession  # noqa: E402
from nms_courier_runtime.pipe_client import PipeClient  # noqa: E402


def main() -> None:
    process = __import__("psutil").Process(os.getpid())
    executable_path = process.exe()
    fingerprint = hashlib.sha256(Path(executable_path).read_bytes()).hexdigest()
    token = os.urandom(32)
    session_id = str(uuid.uuid4())
    config = {
        "pid": os.getpid(),
        "executable_path": executable_path,
        "executable_sha256": fingerprint,
        "process_started_at": process.create_time(),
        "pipe_name": f"nms-courier-test-{uuid.uuid4().hex}",
        "token_hex": token.hex(),
        "session_id": session_id,
    }
    stopped = threading.Event()
    ready = threading.Event()
    events: list[dict[str, object]] = []
    session = PipeSession(config, stopped, ready)
    session._emit = lambda event, **values: events.append({"event": event, **values})
    server = threading.Thread(target=session.run, daemon=True)
    server.start()
    if not ready.wait(2):
        raise AssertionError("The Named Pipe server did not become ready.")

    client = PipeClient(config["pipe_name"])
    try:
        challenge = client.read()
        if challenge.get("type") != "challenge":
            raise AssertionError("The server did not issue a challenge.")
        client.write(
            {
                "type": "hello",
                "protocol": 1,
                "pid": os.getpid(),
                "executable_sha256": fingerprint,
                "session_id": session_id,
                "proof": handshake_proof(
                    token,
                    str(challenge["nonce"]),
                    os.getpid(),
                    fingerprint,
                    session_id,
                ),
            }
        )
        acknowledgement = client.read()
        if acknowledgement.get("type") != "hello_ack":
            raise AssertionError("The server did not authenticate the expected client.")
        client.write({"type": "callback_ready", "protocol": 1, "pid": os.getpid()})
        deadline = time.monotonic() + 2
        while time.monotonic() < deadline and not any(
            event.get("event") == "callback_ready" for event in events
        ):
            time.sleep(0.01)
        if not any(event.get("event") == "bridge_authenticated" for event in events):
            raise AssertionError("The host did not report the authenticated session.")
        if not any(event.get("event") == "callback_ready" for event in events):
            raise AssertionError("The host did not receive the diagnostic callback event.")
    except Exception:
        print(f"Observed bridge events: {events}")
        raise
    finally:
        client.close()
        server.join(timeout=2)
        stopped.set()
    if server.is_alive():
        raise AssertionError("The pipe server did not release its resources.")
    print("Restricted Windows Named Pipe loopback passed.")


if __name__ == "__main__":
    main()
