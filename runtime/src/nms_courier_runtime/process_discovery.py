"""Discover one exact, diagnostics-allowlisted No Man's Sky process."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import psutil


class DiscoveryError(ValueError):
    def __init__(self, reason: str, candidate_count: int = 0):
        super().__init__(reason)
        self.reason = reason
        self.candidate_count = candidate_count


@dataclass(frozen=True)
class DiagnosticBuild:
    executable_sha256: str
    build_label: str


@dataclass(frozen=True)
class DiagnosticTarget:
    pid: int
    executable_path: str
    executable_sha256: str
    process_started_at: float
    game_root: str
    build_label: str


def load_diagnostic_builds(path: Path) -> dict[str, DiagnosticBuild]:
    """Load only exact hashes explicitly authorized for diagnostics."""
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise DiscoveryError("DIAGNOSTIC_BUILD_REGISTRY_UNAVAILABLE") from error

    if not isinstance(document, dict) or document.get("schemaVersion") != 1:
        raise DiscoveryError("INVALID_DIAGNOSTIC_BUILD_REGISTRY")
    entries = document.get("builds")
    if not isinstance(entries, list):
        raise DiscoveryError("INVALID_DIAGNOSTIC_BUILD_REGISTRY")

    builds: dict[str, DiagnosticBuild] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise DiscoveryError("INVALID_DIAGNOSTIC_BUILD_REGISTRY")
        digest = entry.get("executableSha256")
        label = entry.get("buildLabel")
        if (
            not isinstance(digest, str)
            or len(digest) != 64
            or any(character not in "0123456789abcdefABCDEF" for character in digest)
            or not isinstance(label, str)
            or not label.strip()
            or entry.get("mode") != "diagnostics_only"
        ):
            raise DiscoveryError("INVALID_DIAGNOSTIC_BUILD_REGISTRY")
        normalized_digest = digest.lower()
        if normalized_digest in builds:
            raise DiscoveryError("INVALID_DIAGNOSTIC_BUILD_REGISTRY")
        builds[normalized_digest] = DiagnosticBuild(normalized_digest, label.strip())
    return builds


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as executable:
        for chunk in iter(lambda: executable.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _game_root_for(executable_path: Path) -> Path:
    executable = executable_path.resolve(strict=True)
    if executable.name.casefold() != "nms.exe" or executable.parent.name.casefold() != "binaries":
        raise ValueError("GAME_INSTALLATION_PATH_NOT_RECOGNIZED")
    game_root = executable.parent.parent
    if not game_root.is_dir():
        raise ValueError("GAME_INSTALLATION_PATH_NOT_RECOGNIZED")
    return game_root


def find_diagnostic_target(
    builds: dict[str, DiagnosticBuild],
    processes: Iterable[Any] | None = None,
) -> DiagnosticTarget:
    """Choose a unique running NMS.exe whose exact hash is diagnostics-allowlisted."""
    running = processes if processes is not None else psutil.process_iter(
        attrs=["pid", "name", "exe", "create_time"]
    )
    observed_nms = 0
    supported: list[DiagnosticTarget] = []
    invalid_install_path = False

    for process in running:
        try:
            info = process.info
            process_name = info.get("name")
            executable_text = info.get("exe")
            if not isinstance(process_name, str) or process_name.casefold() != "nms.exe":
                continue
            observed_nms += 1
            if not isinstance(executable_text, str) or not executable_text:
                invalid_install_path = True
                continue

            executable = Path(os.path.realpath(executable_text))
            game_root = _game_root_for(executable)
            process_id = info.get("pid")
            started_at = info.get("create_time")
            if not isinstance(process_id, int) or process_id <= 0 or not isinstance(started_at, (int, float)):
                continue

            fingerprint = _sha256_file(executable)
            build = builds.get(fingerprint)
            if build is not None:
                supported.append(
                    DiagnosticTarget(
                        pid=process_id,
                        executable_path=str(executable),
                        executable_sha256=fingerprint,
                        process_started_at=float(started_at),
                        game_root=str(game_root),
                        build_label=build.build_label,
                    )
                )
        except (psutil.Error, OSError, ValueError):
            invalid_install_path = True
            continue

    if not supported:
        if observed_nms == 0:
            raise DiscoveryError("GAME_NOT_RUNNING")
        if invalid_install_path:
            raise DiscoveryError("GAME_INSTALLATION_PATH_NOT_RECOGNIZED", observed_nms)
        raise DiscoveryError("UNSUPPORTED_GAME_BUILD", observed_nms)
    if len(supported) != 1:
        raise DiscoveryError("MULTIPLE_SUPPORTED_GAME_INSTANCES", len(supported))

    target = supported[0]
    current_digest = _sha256_file(Path(target.executable_path))
    if not hmac.compare_digest(current_digest, target.executable_sha256):
        raise DiscoveryError("GAME_EXECUTABLE_CHANGED_DURING_DISCOVERY", 1)
    return target
