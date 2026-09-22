"""Focused protocol tests for the private runtime bridge."""

from __future__ import annotations

import sys
import unittest
import importlib.util
from pathlib import Path

if importlib.util.find_spec("nms_courier_runtime") is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nms_courier_runtime.authentication import handshake_proof, validate_hello  # noqa: E402
from nms_courier_runtime.framing import FrameError, decode_frame, encode_frame  # noqa: E402


class FrameTests(unittest.TestCase):
    def test_frame_round_trip_preserves_unicode_and_nested_values(self) -> None:
        message = {"type": "status", "label": "Jogador local", "values": [1, True, None]}
        encoded = encode_frame(message)
        length = int.from_bytes(encoded[:4], "little")

        self.assertEqual(length, len(encoded) - 4)
        self.assertEqual(decode_frame(encoded[4:]), message)

    def test_frame_rejects_invalid_json_and_non_object_roots(self) -> None:
        with self.assertRaises(FrameError):
            decode_frame(b"{broken")
        with self.assertRaises(FrameError):
            decode_frame(b"[]")

    def test_frame_rejects_payloads_over_the_control_limit(self) -> None:
        from nms_courier_runtime.framing import MAX_CONTROL_FRAME_BYTES

        with self.assertRaises(FrameError):
            decode_frame(b"x" * (MAX_CONTROL_FRAME_BYTES + 1))


class HandshakeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.token = bytes(range(32))
        self.nonce = "ab" * 32
        self.pid = 4242
        self.fingerprint = "cd" * 32
        self.session_id = "diagnostic-session"
        self.hello = {
            "type": "hello",
            "protocol": 1,
            "pid": self.pid,
            "executable_sha256": self.fingerprint,
            "session_id": self.session_id,
            "proof": handshake_proof(
                self.token, self.nonce, self.pid, self.fingerprint, self.session_id
            ),
        }

    def test_accepts_hello_bound_to_the_expected_process_and_session(self) -> None:
        self.assertTrue(
            validate_hello(
                self.hello,
                self.token,
                self.nonce,
                self.pid,
                self.fingerprint,
                self.session_id,
            )
        )

    def test_rejects_tampered_identity_or_proof(self) -> None:
        for field, value in (("pid", self.pid + 1), ("session_id", "other"), ("proof", "00")):
            with self.subTest(field=field):
                tampered = {**self.hello, field: value}
                self.assertFalse(
                    validate_hello(
                        tampered,
                        self.token,
                        self.nonce,
                        self.pid,
                        self.fingerprint,
                        self.session_id,
                    )
                )


if __name__ == "__main__":
    unittest.main()
