# Pi procedural item research

Status: Courier's offline collection port and exact-build compatibility scanner
implemented and tested. Current native bindings remain unverified; no runtime
generation or delivery enabled. This complements [appearance seed research](PROCEDURAL_SEED_RESEARCH.md).

## Source and scope

User supplied [zencq/Pi](https://github.com/zencq/Pi). Inspection pins revision
`80e397b0067016c7d4f9ae37b18afc38ad43185c`; the GitHub tree response was not
truncated. Six selected source files totaling 61,028 bytes were inspected in
the external research directory. No repository clone, submodule initialization,
dependency installation, generated database download or upstream execution.

Pi principally catalogs procedural technology upgrades and products, including
treasures. Its Freighter and Weapon directories concern those inventory domains;
they are not evidence of freighter hull or multitool visual seed generation.
The README describes CSV/Parquet datasets and an automatically generated workbook
of desirable seeds. It does not supply an independent appearance PRNG.

## Native generation route observed in source

The pinned [Pi.py](https://github.com/zencq/Pi/blob/80e397b0067016c7d4f9ae37b18afc38ad43185c/NMSpy_mods/Pi.py)
captures a reality-manager instance after construction and waits for both that
instance and a language region before exposing generation. Its configuration
sets `TOTAL_SEEDS = 100_000`; loops enumerate decimal values 0 through 99,999.
IDs are constructed as an item identifier followed by `#` and a zero-padded
five-digit decimal seed. These are separate from 64-bit hexadecimal model seeds.

- Products call `GenerateProceduralProduct`, then read generated name,
  base value and selected descriptive metadata.
- Technologies call `GenerateProceduralTechnology`, then read `StatBonuses`
  and the generated name. Source branches explicitly change call arguments for
  version 6.02; an old function name is not a stable ABI.
- Outputs retain seed, transformed display statistics, names by language and
  calculated ranking fields. Generation is not an inventory delivery operation.

The native game acts as the forward oracle; Pi enumerates inputs and records
outputs rather than reproducing the native stat-generation algorithm in Python.
This is useful as a model for gathering expected-output fixtures before porting
an algorithm, or for a future verified local query adapter.

## Rankings and packaged technology

[helpers.py](https://github.com/zencq/Pi/blob/80e397b0067016c7d4f9ae37b18afc38ad43185c/NMSpy_mods/common/helpers.py)
computes perfection using observed stat ranges, weights and a penalty for fewer
available stats. That score is an upstream ranking convention, not an official
game field or a proof of theoretical maxima across game versions. Preserve raw
values alongside display transformations; some beneficial stats have lower raw
values, and transformations reverse their direction.

[Package.py](https://github.com/zencq/Pi/blob/80e397b0067016c7d4f9ae37b18afc38ad43185c/NMSpy_mods/Package.py)
calls `GetHashedIDForTech` for known technology identifiers and serializes the
returned package representation. This provides another native research target
for packaged upgrades. It does not demonstrate adding that package to inventory,
and its result-buffer handling must not be copied into Courier without an ABI
and ownership audit.

## Compatibility and integration decision

The checked configuration lists GOG versions 4.13, 5.20, 5.61 and 6.02 by
executable hash. Source selects version-specific structures and rejects unknown
hashes. Submodules pin NMSpy `db03f90ed69a09aa334b28f949e9c204ff2a0839` and
pyMHF `78e59ba7f68ccf5db7c653960ece7f38f5a1c440`. None extends Courier's verified
runtime compatibility to another executable. No old offsets/signatures imported.

Pi periodically clears a pending-technology container, and its own comment
questions the effect on gameplay. Courier must not repeat that bulk process in
a loaded player save. An eventual adapter needs verified callback/thread context,
bounded batches, owned results, cancellation, cleanup and exact-build checks.
Using the existing native bridge remains possible; Pi does not require adopting
NMS.py as Courier's runtime architecture.

Current candidates below narrow the remaining work to function semantics,
object lifetime, callback/thread context and argument/result ownership. Only
after verifying those should a small controlled batch become an oracle
experiment. Appearance selection and inventory delivery remain separate routes,
and no save editing is an acceptable delivery fallback.

## Courier collection port

The user requested updating Pi. Courier now has an original standard-library
collection tool: [pi-seed-catalog.py](../runtime/research/pi-seed-catalog.py).
This is a partial port of the enumeration/capture workflow, not a working
current-build Pi plugin. Python 3.14 works for offline use without pyarrow,
NMSpy or pyMHF; this does not verify upstream injection dependencies on 3.14.

- Plans enumerate decimal seeds 0..99,999 with five-digit procedural IDs.
- SQLite persists owned raw snapshots; missing-input batches default to 25 and
  are capped at 1,000. No native invocation or automatic mutation retry.
- Build fingerprint, item kind, identifier, range and evidence level are
  immutable. Simulated and observed results cannot share one catalog.
- Imports are atomic; identical duplicates are harmless, conflicting results
  are rejected without replacing evidence. Non-finite floats, oversized
  records, excessive nesting and out-of-range seeds are rejected.
- Observed snapshots require source, adapter and capture SHA-256 metadata.
  These are declarations, not independent proof of genuine game output.
  Raw bonuses are preserved without upstream perfection scoring.
- JSONL export streams results; pending/export files must be new. No upstream
  container clearing, mutable result buffer, save editing or runtime auto-start.

The tool does not generate native snapshots yet; connecting a verified adapter
is required. Missing rows never authorize replaying a call with an uncertain
outcome. Commands are in the [batch guide](../runtime/research/README.md#pi-collection-port).

## Build 180383 compatibility investigation

Executable SHA-256 was freshly checked:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
[scan-pi-compatibility.py](../runtime/research/scan-pi-compatibility.py) reads
hash-pinned historical types using AST literals without executing the source.
Historical offsets are recorded but never used as current addresses. It scans
signatures, checks instruction boundaries for named-string LEA references and
follows version-1 unwind chains with a 16-record budget, following
[Microsoft's x64 unwind documentation](https://learn.microsoft.com/en-us/cpp/build/exception-handling-x64?view=msvc-170).
Unsupported metadata remains an explicit warning.

| Historical binding | Current signature matches | Independent anchor primary RVA | Assessment |
| --- | --- | --- | --- |
| Language Load | `0x3d1b80`, `0x1836460` | `0x2bd84f0` | Ambiguous signature; anchor points elsewhere |
| Reality Construct | `0x30cfda0` | `0xeaf720` | Unique signature disagrees with mission-table anchor |
| GenerateProceduralProduct | `0x8bb23a` inside `0x8bb230` | `0xebec00` | Interior signature disagrees with product-format anchor |
| GenerateProceduralTechnology | `0xec1e60` | `0xec1e60` | Signature and wiki-tech anchor agree; ABI unverified |
| GetHashedIDForTech | `0xebe000` | Not independently established | Unique signature only; buffer contract unresolved |

All four anchor strings exist. Four checked references had no skipped sites or
unwind warnings. Their fragments were `0xeaf73d`, `0xebeeaf`, `0xec2e9b` and
`0x2bd84f0`; chained metadata links the first three to the primary RVAs above.
This is static structural evidence, not semantic or live verification. A unique
old signature alone is not sufficient to update a hook.

External reports: `seed-analysis-180383/pi-compatibility/compatibility.json`,
`anchor-seeds.tsv` and `pi-candidate-fragments`. Four signature-related fragments
decoded to 241 instructions. A separate four-anchor export failed with
`Incomplete fragment decoding`; no partial successful export is claimed.
The anchor scanner checked only specific references, without claiming complete
function disassembly or concealing that failure.

Validation: 13 new tests and all 55 research tests passed. CLI smoke testing
planned 10 simulated inputs, imported three synthetic snapshots, resumed at
seeds 3..5 and exported three preserved results. Zero native calls; no saves,
DLL installation, game-file changes or disk repair.

## External provenance

Source SHA-256:

| File | SHA-256 |
| --- | --- |
| README.md | `dcb1a0e24ae735f942da957779a8c0231af1ce8d7b4720df4d20051df0540e39` |
| NMSpy_mods/Pi.py | `688f2e7ff4f6dd375b92a2cd31ff2199fcb337461f8c070f3210e8a5577a3877` |
| NMSpy_mods/Package.py | `65bf570f8edf9504fe9b7928b1add728e14698dfebb0af9f8fe90ef909b12e35` |
| NMSpy_mods/common/helpers.py | `aba3ea35a66db0001952183e54e82033149ed66d552a608fdc9878d0f6c5c9ce` |
| NMSpy_mods/common/configuration.py | `15b635dc5e3444d94237f20875c0693edbd4d7e4a7185d9e424879f5bdc7d34c` |
| NMSpy_mods/data/7024b107f0533de802e8ecfbed65d2c778d03c1f/types.py | `59ed0a093901e65d79786cbd88b8fa5248a033c756b4311ecb7e2b2b48edac14` |

Copies are transient references under external `pi-reference-80e397b`, not
vendored source or distributable dependencies. Links and fingerprints allow
reinspection without depending on that temporary directory.
