# pyMHF 0.2.4 runtime-safety patch

## Scope

This patch applies only to the staged `pymhf/injected.py` and `pymhf/main.py` files with upstream SHA-256 values `3bdcdd7e33c33433963f3d4413a059f57c74b17a52ef80d732f2899e0508aa2c` and `c4d593f437a692a403915e264ae4c47b1df7bc80bebc0f38de3141a8f690f61a`.

## Reason

pyMHF starts an unauthenticated general-purpose execution server on `127.0.0.1:6770` after injection. Its `interactive_console` setting only controls the command-line client and does not prevent the listener.

## Change

The patch adds a project-owned `pymhf.execution_server.enabled` setting. It defaults to `false`; the listener is neither created nor contacted during shutdown unless a future reviewed launcher explicitly enables it. The default configuration also turns off pyMHF's GUI, interactive console, and socket-backed logging. The private dependency specification uses `--no-deps` because NMSpy declares pyMHF's GUI optional extra; all required non-GUI dependencies are explicitly pinned.

When pyMHF's injected worker exits, the upstream callback terminates the target PID even when `start_exe` is false and the tool attached to an existing game. The staging patch reports worker exceptions and only terminates a game process when pyMHF started it. This prevents a failed attachment from closing a user's running game and lets the bridge distinguish setup failure from a dispatched delivery.

## Compatibility gate

The staging script fails when either upstream source hash or exact code structure differs. A pyMHF update requires a separate review, patch revision, source validation, and runtime test before packaging.
