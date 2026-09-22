"""Regression tests for exact target-process validation."""

from __future__ import annotations

import hashlib
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

if importlib.util.find_spec("nms_courier_runtime") is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nms_courier_runtime.host import _verify_target  # noqa: E402


class TargetValidationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.executable = Path(self.directory.name) / "NMS.exe"
        self.executable.write_bytes(b"verified test executable")
        self.fingerprint = hashlib.sha256(self.executable.read_bytes()).hexdigest()
        self.process = Mock()
        self.process.exe.return_value = str(self.executable)
        self.process.create_time.return_value = 1_000.0
        self.process_factory = patch(
            "nms_courier_runtime.host.psutil.Process", return_value=self.process
        )
        self.process_factory.start()
        self.addCleanup(self.process_factory.stop)
        self.config = {
            "pid": 4242,
            "executable_path": str(self.executable),
            "executable_sha256": self.fingerprint,
            "process_started_at": 1_000.0,
        }

    def test_accepts_matching_process_path_hash_and_start_time(self) -> None:
        _verify_target(self.config)

    def test_rejects_a_different_process_executable(self) -> None:
        self.process.exe.return_value = str(Path(self.directory.name) / "other.exe")

        with self.assertRaisesRegex(ValueError, "path changed"):
            _verify_target(self.config)

    def test_rejects_a_changed_executable_fingerprint(self) -> None:
        self.config["executable_sha256"] = "0" * 64

        with self.assertRaisesRegex(ValueError, "fingerprint changed"):
            _verify_target(self.config)

    def test_rejects_a_reused_or_changed_process_identity(self) -> None:
        self.process.create_time.return_value = 1_010.0

        with self.assertRaisesRegex(ValueError, "process identity changed"):
            _verify_target(self.config)


if __name__ == "__main__":
    unittest.main()
