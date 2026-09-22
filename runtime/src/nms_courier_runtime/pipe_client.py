"""Blocking byte-mode pipe client used by the injected diagnostics mod."""

from __future__ import annotations

import win32con
import win32file

from .framing import MAX_CONTROL_FRAME_BYTES, FrameError, decode_frame, encode_frame


class PipeClient:
    def __init__(self, name: str):
        self.handle = win32file.CreateFile(
            rf"\\.\pipe\{name}",
            win32file.GENERIC_READ | win32file.GENERIC_WRITE,
            0,
            None,
            win32con.OPEN_EXISTING,
            0,
            None,
        )

    def close(self) -> None:
        if self.handle is not None:
            win32file.CloseHandle(self.handle)
            self.handle = None

    def _read_exact(self, length: int) -> bytes:
        chunks: list[bytes] = []
        remaining = length
        while remaining:
            error, chunk = win32file.ReadFile(self.handle, min(remaining, 65536))
            if error or not chunk:
                raise ConnectionError("Named Pipe closed while reading a frame.")
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)

    def read(self) -> dict:
        size = struct_unpack_length(self._read_exact(4))
        if not size or size > MAX_CONTROL_FRAME_BYTES:
            raise FrameError("Control frame is outside the allowed size.")
        return decode_frame(self._read_exact(size))

    def write(self, message: dict) -> None:
        frame = encode_frame(message)
        error, written = win32file.WriteFile(self.handle, frame)
        if error or written != len(frame):
            raise ConnectionError("Named Pipe did not accept the complete frame.")


def struct_unpack_length(prefix: bytes) -> int:
    return int.from_bytes(prefix, byteorder="little", signed=False)
