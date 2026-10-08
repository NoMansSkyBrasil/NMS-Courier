# Signal scripts (removed)

Until 2026-10-08 this folder held one PowerShell script per domain
(`signal-item-180836.ps1` and the like) that wrote a request file and set a
named event of the bridge. They were removed on that date by the project
owner's decision: nothing between the application and the game may be a
script, and the application must run on Windows, macOS and Linux.

What replaced them:

- The desktop application sends every request itself:
  `apps/desktop/src/main/research-bridge/bridge-client.ts`. The request lines
  each script used to build are in `delivery-plan.ts`, `delivery-options.ts`,
  `equipment-plan.ts` and `currency-plan.ts` of the same folder.
- The bridge takes a request from a file since version 1.3.0:
  `runtime/native/asi/profile_180836/file_signal.h`.
- The protocol is described at the top of
  [live bridge operations](../../../../docs/LIVE_BRIDGE_OPERATIONS.md).

Older notes and experiment records still name the scripts; read those names as
"the request of that domain, sent from the application".
