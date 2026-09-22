"""Bounded version 1 control framing shared with the TypeScript protocol package."""

from __future__ import annotations

import json
import struct
from typing import Any

MAX_CONTROL_FRAME_BYTES = 256 * 1024


class FrameError(ValueError):
    """Raised when a control frame is malformed or exceeds its bound."""


def encode_frame(message: dict[str, Any]) -> bytes:
    payload = json.dumps(message, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if not payload or len(payload) > MAX_CONTROL_FRAME_BYTES:
        raise FrameError("Control frame is outside the allowed size.")
    return struct.pack("<I", len(payload)) + payload


def decode_frame(payload: bytes) -> dict[str, Any]:
    if not payload or len(payload) > MAX_CONTROL_FRAME_BYTES:
        raise FrameError("Control frame is outside the allowed size.")
    try:
        value = json.loads(payload.decode("utf-8", errors="strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise FrameError("Control frame is not valid UTF-8 JSON.") from error
    if not isinstance(value, dict):
        raise FrameError("Control frame root must be an object.")
    return value
