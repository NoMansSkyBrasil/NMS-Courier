"""Run the direct Python diagnostics bridge or its one-shot Carbon test operation."""

from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
import time
import uuid
from pathlib import Path
from typing import Any

from nms_courier_runtime.host import EVENT_PREFIX, TEST_DELIVERY_DEADLINE_SECONDS, run_config
from nms_courier_runtime.inventory_179666 import (
    BUILD_SHA256,
    CARBON_GAME_ID,
    TEST_DELIVERY_QUANTITY,
)
from nms_courier_runtime.process_discovery import (
    DiagnosticTarget,
    DiscoveryError,
    find_diagnostic_target,
    load_diagnostic_builds,
)


def _emit(event: str, **values: Any) -> None:
    print(EVENT_PREFIX + json.dumps({"event": event, **values}, separators=(",", ":")), flush=True)


def _make_config(
    target: DiagnosticTarget,
    log_directory: Path,
    *,
    test_delivery: bool,
) -> dict[str, Any]:
    token = secrets.token_bytes(32)
    config: dict[str, Any] = {
        "executable_path": target.executable_path,
        "executable_sha256": target.executable_sha256,
        "pid": target.pid,
        "process_started_at": target.process_started_at,
        "pipe_name": f"nms-courier-{target.pid}-{secrets.token_hex(12)}",
        "token_hex": token.hex(),
        "session_id": secrets.token_hex(16),
        "log_directory": str(log_directory),
    }
    if test_delivery:
        config["test_delivery_command"] = {
            "type": "delivery.item",
            "protocol": 1,
            "operation_id": str(uuid.uuid4()),
            "deadline_epoch_ms": int(time.time() * 1000)
            + TEST_DELIVERY_DEADLINE_SECONDS * 1000,
            "target": {"kind": "local_player"},
            "payload": {
                "domain": "substance",
                "game_id": CARBON_GAME_ID,
                "quantity": TEST_DELIVERY_QUANTITY,
                "notification_preference": "default",
            },
        }
    return config


def _default_log_directory() -> Path:
    app_data = os.environ.get("APPDATA")
    if not app_data:
        raise DiscoveryError("APP_DATA_UNAVAILABLE")
    return Path(app_data) / "@nms-courier" / "desktop" / "runtime-diagnostics"


def main(argv: list[str] | None = None) -> int:
    os.environ.setdefault("PYMHF_INTERACTIVE_CONFIGURATION", "0")
    parser = argparse.ArgumentParser(description="Run NMS Courier's direct Python runtime bridge.")
    parser.add_argument(
        "--runtime-root",
        required=True,
        type=Path,
        help="Runtime resource directory containing config/diagnostic-builds.json.",
    )
    parser.add_argument(
        "--test-deliver-carbon",
        action="store_true",
        help="Attempt one Carbon x500 delivery on the exact 179666 test build.",
    )
    args = parser.parse_args(argv)
    runtime_root = args.runtime_root.resolve()

    try:
        builds = load_diagnostic_builds(runtime_root / "config" / "diagnostic-builds.json")
        target = find_diagnostic_target(builds)
        log_directory = _default_log_directory()
    except DiscoveryError as error:
        _emit("discovery_failed", reason=error.reason, candidateCount=error.candidate_count)
        return 2

    if args.test_deliver_carbon and target.executable_sha256.lower() != BUILD_SHA256:
        _emit("delivery_unavailable", reason="UNSUPPORTED_GAME_VERSION")
        return 3

    delivery_config = _make_config(
        target,
        log_directory,
        test_delivery=args.test_deliver_carbon,
    )
    _emit(
        "target_detected",
        pid=target.pid,
        executablePath=target.executable_path,
        gameRoot=target.game_root,
        buildLabel=target.build_label,
        mode="single_test_delivery" if args.test_deliver_carbon else "diagnostics_only",
        operationId=(
            delivery_config["test_delivery_command"]["operation_id"]
            if args.test_deliver_carbon
            else None
        ),
    )
    return run_config(delivery_config)


if __name__ == "__main__":
    raise SystemExit(main())
