# Private runtime staging

This directory contains the reproducible source configuration for the private runtime shipped with NMS Courier. It does not contain a Python installation, third-party wheels, extracted payload, game bindings, or user data.

The initial B0 candidate is the official Windows x64 embeddable CPython 3.11.9 archive. Build automation must download it by the URL recorded in `runtime-manifest.template.json`, verify its SHA-256 digest before extraction, and stage it outside the repository's tracked source tree.

The final package will place the verified runtime in Electron resources, outside `app.asar`. End users must never need a global Python installation, `pip`, `uv`, or a PATH change.

After `pnpm stage:runtime` and `pnpm stage:runtime:dependencies`, run `pnpm generate:runtime-manifest`. The generator uses the staged interpreter's standard library to read the closed wheel cache, extracts included upstream license notices to ignored staging output, hashes every shipped wheel and staged runtime file, and writes `runtime/staging/runtime-manifest.json`. `pip` is locked by `build-tool-lock.json`, used only to assemble dependencies, then removed before the manifest is generated. The generated manifest and notices are package inputs, not tracked source files.

This candidate matches the currently documented NMSpy 3.9–3.11 support range, but it is not evidence that the game runtime, pyMHF, NMS.py, or native dependencies work together. Those compatibility proofs remain B0 acceptance gates.

pyMHF 0.2.4 creates terminal prompts during import. `stage-runtime-dependencies.mjs` applies one hash-pinned, minimal non-interactive startup patch after installation and before verification. The patch requires `PYMHF_INTERACTIVE_CONFIGURATION=1` before those prompts can be created. Its scope and upgrade gate are documented in `patches/pymhf-noninteractive-startup.md`; it does not enable a game connection or any network service.
