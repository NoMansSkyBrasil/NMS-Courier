# Private runtime staging

This directory contains the reproducible source configuration for the private runtime shipped with NMS Courier. It does not contain a Python installation, third-party wheels, extracted payload, game bindings, or user data.

The initial B0 candidate is the official Windows x64 embeddable CPython 3.11.9 archive. Build automation must download it by the URL recorded in `runtime-manifest.template.json`, verify its SHA-256 digest before extraction, and stage it outside the repository's tracked source tree.

The final package will place the verified runtime in Electron resources, outside `app.asar`. End users must never need a global Python installation, `pip`, `uv`, or a PATH change.

This candidate matches the currently documented NMSpy 3.9–3.11 support range, but it is not evidence that the game runtime, pyMHF, NMS.py, or native dependencies work together. Those compatibility proofs remain B0 acceptance gates.
