"""Authentication helpers for the diagnostics-only bridge handshake."""

from __future__ import annotations

import hashlib
import hmac
from typing import Any

PROTOCOL_VERSION = 1


def handshake_proof(token: bytes, nonce: str, pid: int, fingerprint: str, session_id: str) -> str:
    """Return the keyed proof bound to this process, build, and session."""
    content = f"{PROTOCOL_VERSION}|{nonce}|{pid}|{fingerprint.lower()}|{session_id}".encode()
    return hmac.new(token, content, hashlib.sha256).hexdigest()


def validate_hello(
    message: Any,
    token: bytes,
    nonce: str,
    pid: int,
    fingerprint: str,
    session_id: str,
) -> bool:
    """Validate every identity field before authenticating a pipe peer."""
    if not isinstance(message, dict):
        return False
    proof = message.get("proof")
    return (
        message.get("type") == "hello"
        and message.get("protocol") == PROTOCOL_VERSION
        and message.get("pid") == pid
        and message.get("executable_sha256") == fingerprint.lower()
        and message.get("session_id") == session_id
        and isinstance(proof, str)
        and hmac.compare_digest(proof, handshake_proof(token, nonce, pid, fingerprint, session_id))
    )
