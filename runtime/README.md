# Private runtime staging

This directory contains the reproducible source configuration for the private runtime shipped with NMS Courier. It does not contain a Python installation, third-party wheels, extracted payload, game bindings, or user data.

The initial B0 candidate is the official Windows x64 embeddable CPython 3.11.9 archive. Build automation must download it by the URL recorded in `runtime-manifest.template.json`, verify its SHA-256 digest before extraction, and stage it outside the repository's tracked source tree.

The final package will place the verified runtime in Electron resources, outside `app.asar`. End users must never need a global Python installation, `pip`, `uv`, or a PATH change.

After `pnpm stage:runtime` and `pnpm stage:runtime:dependencies`, run `pnpm generate:runtime-manifest`. The generator uses the staged interpreter's standard library to read the closed wheel cache, extracts included upstream license notices to ignored staging output, hashes every shipped wheel and staged runtime file, and writes `runtime/staging/runtime-manifest.json`. `pip` is locked by `build-tool-lock.json`, used only to assemble dependencies, then removed before the manifest is generated. The generated manifest and notices are package inputs, not tracked source files.

This candidate matches the currently documented NMSpy 3.9–3.11 support range, but it is not evidence that the game runtime, pyMHF, NMS.py, or native dependencies work together. Those compatibility proofs remain B0 acceptance gates.

## Direct Python runtime entry point

The private Python runtime includes `nms_courier_runtime.diagnostics_cli` for a live run without opening Electron. It finds running `NMS.exe` processes, derives the game root from the executable under `Binaries`, hashes the executable, and continues only when exactly one instance matches `config/diagnostic-builds.json`. The host rechecks PID, executable path, hash, and process start time before loading the runtime module. Ambiguous instances and unlisted builds fail closed.

From the repository root after staging the private runtime and dependencies, run:

```powershell
$env:PYMHF_INTERACTIVE_CONFIGURATION = '0'
& .\runtime\staging\cpython\python.exe -I -B -u -m nms_courier_runtime.diagnostics_cli --runtime-root .\runtime
```

For the exact Steam build 179666 fingerprint in the diagnostics allowlist, the explicit `--test-deliver-carbon` option enables one local Carbon ×500 test operation:

```powershell
$env:PYMHF_INTERACTIVE_CONFIGURATION = '0'
& .\runtime\staging\cpython\python.exe -I -B -u -m nms_courier_runtime.diagnostics_cli --runtime-root .\runtime --test-deliver-carbon
```

This test calls the native inventory-store insertion method from the game's main-loop callback. It does not require the inventory screen to be open or another player. The runtime listens at both the before-update and after-update phases, shares one command queue, and reports which phase fired; a command can be drained only once. The command is restricted to the local player, substance `FUEL1`, and quantity 500; the host sends it once and never retries. It reports success only after the live Carbon quantity increases by exactly 500. If the response is lost after dispatch, the result is unknown and must be checked in the game before any new attempt. Notification is not attempted yet. This is an experimental one-off test, not general delivery support, and it does not read or edit save files.

The test needs a fresh game process after changes to the injected module. A module already loaded into a running game remains the version it started with. For a packaged build, use its bundled `resources/runtime/python/python.exe` and pass that bundle's `resources/runtime` directory as `--runtime-root`. The process prints `NMSCOURIER_EVENT` JSON lines for discovery and bridge states; a successful host remains active while the game process runs. If the injected runtime exits before dispatch, the host reports a rejection and the attached game process is preserved. Two live tests authenticated but timed out before either main-loop callback reached the host; both were rejected before dispatch and did not change Carbon. The next live run must use a fresh process and inspect the reported callback phase.

pyMHF 0.2.4 creates terminal prompts during import and an unauthenticated execution listener after injection. `stage-runtime-dependencies.mjs` applies hash-pinned, minimal patches after installation and before verification. It also adds the narrowly scoped NMSpy struct import compatibility module after checking both pinned package versions and the expected exports. The startup patch requires `PYMHF_INTERACTIVE_CONFIGURATION=1` before prompts can be created, and the execution listener defaults to disabled. Their scope and upgrade gates are documented in `patches/`; they do not enable a game connection or any network service. `config/runtime-defaults.toml` is the project-owned non-interactive template for a future launcher.
