"""Regression tests for automatic, fail-closed game process discovery."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

if importlib.util.find_spec("nms_courier_runtime") is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nms_courier_runtime.process_discovery import (  # noqa: E402
    DiagnosticBuild,
    DiscoveryError,
    find_diagnostic_target,
    load_diagnostic_builds,
)


class ProcessDiscoveryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.game_root = Path(self.directory.name) / "No Man's Sky"
        self.executable = self.game_root / "Binaries" / "NMS.exe"
        self.executable.parent.mkdir(parents=True)
        self.executable.write_bytes(b"verified game executable")
        self.fingerprint = hashlib.sha256(self.executable.read_bytes()).hexdigest()
        self.process = SimpleNamespace(
            info={
                "pid": 4242,
                "name": "NMS.exe",
                "exe": str(self.executable),
                "create_time": 1_000.5,
            }
        )

    def test_derives_installation_root_and_selects_allowlisted_process(self) -> None:
        target = find_diagnostic_target(
            {self.fingerprint: DiagnosticBuild(self.fingerprint, "Steam test build")},
            [self.process],
        )

        self.assertEqual(target.pid, 4242)
        self.assertEqual(target.game_root, str(self.game_root))
        self.assertEqual(target.process_started_at, 1_000.5)
        self.assertEqual(target.build_label, "Steam test build")

    def test_rejects_a_running_but_non_allowlisted_build(self) -> None:
        with self.assertRaises(DiscoveryError) as raised:
            find_diagnostic_target({}, [self.process])

        self.assertEqual(raised.exception.reason, "UNSUPPORTED_GAME_BUILD")
        self.assertEqual(raised.exception.candidate_count, 1)

    def test_reports_when_the_game_is_not_running(self) -> None:
        with self.assertRaises(DiscoveryError) as raised:
            find_diagnostic_target({}, [])

        self.assertEqual(raised.exception.reason, "GAME_NOT_RUNNING")

    def test_rejects_multiple_allowlisted_game_instances(self) -> None:
        second_root = Path(self.directory.name) / "Second Install"
        second_executable = second_root / "Binaries" / "NMS.exe"
        second_executable.parent.mkdir(parents=True)
        second_executable.write_bytes(self.executable.read_bytes())
        second_process = SimpleNamespace(
            info={
                "pid": 4243,
                "name": "NMS.exe",
                "exe": str(second_executable),
                "create_time": 1_001.0,
            }
        )
        build = DiagnosticBuild(self.fingerprint, "Steam test build")

        with self.assertRaises(DiscoveryError) as raised:
            find_diagnostic_target({self.fingerprint: build}, [self.process, second_process])

        self.assertEqual(raised.exception.reason, "MULTIPLE_SUPPORTED_GAME_INSTANCES")

    def test_loads_only_diagnostics_only_registry_entries(self) -> None:
        registry = Path(self.directory.name) / "diagnostic-builds.json"
        registry.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "builds": [
                        {
                            "executableSha256": self.fingerprint.upper(),
                            "buildLabel": "Steam test build",
                            "mode": "diagnostics_only",
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )

        builds = load_diagnostic_builds(registry)

        self.assertEqual(builds[self.fingerprint].build_label, "Steam test build")

    def test_rejects_registry_entries_that_enable_another_mode(self) -> None:
        registry = Path(self.directory.name) / "diagnostic-builds.json"
        registry.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "builds": [
                        {
                            "executableSha256": self.fingerprint,
                            "buildLabel": "Unexpected delivery build",
                            "mode": "delivery",
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )

        with self.assertRaises(DiscoveryError) as raised:
            load_diagnostic_builds(registry)

        self.assertEqual(raised.exception.reason, "INVALID_DIAGNOSTIC_BUILD_REGISTRY")

    def test_ignores_other_process_names(self) -> None:
        other_process = SimpleNamespace(
            info={
                "pid": 999,
                "name": "not-nms.exe",
                "exe": str(self.executable),
                "create_time": 1_000.5,
            }
        )

        with self.assertRaises(DiscoveryError) as raised:
            find_diagnostic_target(
                {self.fingerprint: DiagnosticBuild(self.fingerprint, "Steam test build")},
                [other_process],
            )

        self.assertEqual(raised.exception.reason, "GAME_NOT_RUNNING")


if __name__ == "__main__":
    unittest.main()
