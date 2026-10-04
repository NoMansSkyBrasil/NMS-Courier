# REA assessment and resource-producer continuation

2026-10-04. User-supplied reference: [morluto/rea](https://github.com/morluto/rea).
Source checkout pinned at `405732a7f55e3033c29533b18f7d8313dbd28570`, package
version 3.2.1, outside the repository. No upstream code, skill, dependencies,
global package or MCP registration was installed into Courier/Codex.

## Useful capabilities and actual constraints

REA wraps Ghidra operations for decompilation, assembly, callers/callees,
references, exact instruction inspection, resolved call targets and bounded
value dependencies. These are useful for following seed inputs between known
functions and retaining evidence rather than repeatedly loading pseudocode.
It is an analysis orchestrator, not an NMS seed decoder.

The inspected `src/ghidra/GhidraInstallation.ts` requires exact Ghidra 12.1.4
and a 64-bit JDK 21 (`SUPPORTED_GHIDRA_JAVA_MAJOR = 21`). Courier's existing
developer tools use Ghidra 12.1.4 with portable JDK 25.0.4.1+1. This is a REA
adapter compatibility mismatch, not a failure of our existing Ghidra tools.

`GhidraLauncher.ts::ghidraHeadlessArguments` imports a target into a temporary
`rea-project`, uses `-readOnly` and `-deleteProject`, and does not pass
`-noanalysis`. Its documented operations start after automatic analysis.
The inspected launch path does not reuse our existing `Acquisition180383`
project. Thus immediate REA adoption would require a separate private JDK 21
and fresh target analysis, duplicating existing work. Do not change system Java
or rerun whole-program analysis merely to use this wrapper.

Decision: retain the pinned external source as a read-only tooling reference;
continue targeted Ghidra exports in our existing exact-build project. Later,
evaluate isolated REA CLI/snapshot queries if interactive value tracing provides
a concrete benefit over the established pipeline. No claim that REA has been
executed or verified with NMS. Windows support is experimental, Ghidra-only;
upstream setup automation is unavailable there.

Primary references:
[Windows constraints](https://github.com/morluto/rea/blob/405732a7f55e3033c29533b18f7d8313dbd28570/docs/windows-ghidra-p0.md),
[launcher](https://github.com/morluto/rea/blob/405732a7f55e3033c29533b18f7d8313dbd28570/src/ghidra/GhidraLauncher.ts),
[installation validation](https://github.com/morluto/rea/blob/405732a7f55e3033c29533b18f7d8313dbd28570/src/ghidra/GhidraInstallation.ts).

## New Ghidra evidence on the unresolved material producer

Exact offline NMS executable: build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
The [merged selection note](MERGED_TEXTURE_SELECTION_RESEARCH.md) places the
unresolved producer at virtual slot `+0xd8`, after resource-proxy resolution.

Targeted `appearance-resource-producer-180383.tsv` exported two routines with
the existing Ghidra project and `-noanalysis`, two CPUs, 4 GiB Java heap request,
300-second outer limit, 20 GiB free-space reserve and 30 seconds per decompile.
Both completed in sixteen seconds; no game process or proprietary export is
stored in Git.

- `2d646f0`: two-level resource-manager lookup. It looks up the supplied
  32-bit key, then a 64-bit variant key; if that variant is absent and nonzero,
  it tries key zero. The selected entry contains an integer resource handle
  resolved through the manager pointer array with bounds checks. This is cache/
  proxy resolution, not the material-vector producer. Do not label the variant
  key an appearance seed without tracing its writer.
- `2d65980`: reference acquisition. It resolves a handle, optionally calls the
  proxy lookup, checks a resource flag, and atomically increments a count at
  object `+0x134`. It does not enumerate material resources or choose colors.

Next investigate the concrete object construction/virtual table or the writer
of the resource-vector output. These generic helpers do not identify the dynamic
`+0xd8` target. Neither pseudocode nor a plausible method label is a verified ABI.

## Reproduction and failures

Use the tool root recorded by the existing run reports, not the historical README
example's E: tool location. The first attempt used that obsolete location and
raised `StopIteration` before starting Ghidra. Reading the prior stage report
located the actual C: private tools; the corrected call completed:

```powershell
python runtime/research/analyze-acquisition-offline.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --tools "$env:LOCALAPPDATA\NMSCourier\research-tools\native" `
  --seeds runtime/research/appearance-resource-producer-180383.tsv `
  --output E:\NMS-Courier-Research\acquisition-180383 `
  --project-name Acquisition180383 --stage appearanceresourceproducerNEW --timeout 300
```

This export script records functions in the external research database; it does
not modify the executable. Retain the completed stage rather than overwrite it.
Transient evidence: `appearanceresourceproducer20261004-export/manifest.tsv`,
`run-appearanceresourceproducer20261004.json`, associated headless log.
Game executable, mods, bridge, saves and corpus unchanged; no D: access, storage
repair or BitLocker changes. Full desired-appearance inverse remains open.
