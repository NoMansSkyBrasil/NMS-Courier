# Texture collection: isolated native comparison

2026-10-04, offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This follows [selector emulation](TEXTURE_SELECTOR_EMULATION.md). It closes a
restricted collector boundary, not whole material order or appearance inversion.

## Recovered rule and observed equivalence

`62fba0` collects layer declarations before random selection. For the audited
unlinked, IgnoreName/default-call fixtures:

1. An empty option list contributes no row.
2. Layer identity is **Name plus Group**. Encounter order determines row order.
3. An existing layer increments occurrence count, adds Probability in float32,
   and ORs SelectToMatchBase. Native selection later uses average probability.
4. An option in an existing layer matches on **32-byte Name, ColourAlt selector
   and palette family**. Palette Index is excluded from that match. The first
   retained Index survives when a later matching option has a different Index.
5. Matching options increment their count and float32 probability sum. Different
   selectors or families produce separate alternatives, even with the same Name.
6. Initial options in a new layer are appended in order, including duplicate
   identities. A later call merges the first matching entry. Do not globally
   deduplicate all declared alternatives.

The collector does not roll the appearance RNG in these executed paths. It
constructs the ordered choice space; the subsequent selector consumes draws.
Order and grouping therefore matter to the inverse solver as well as weights.

`emulate-texture-collection.py` compared its original Python port with original
collector/copy-constructor instructions in private Unicorn memory: **65 cases,
160 calls, zero divergences**. Thirteen resources: eight existing decal samples,
four weapon textures and freighter procedural paint. Five profiles per resource:
declared, repeated declarations, altered Index/Probability/Group/base flag,
altered selector/family, and duplicated initial options. Modifications affect
copied fixtures only. Comparison covers ordered groups/options, retained Index,
selectors/families, counts, probability sums and base flag.

All selected declarations use IgnoreName and empty LinkedLayer; unsupported
contexts explicitly fail. Repeated fixture declarations are not evidence that
the game naturally loads the same resource twice.

## Code and execution boundaries

| Code window (hex RVA, end exclusive) | SHA-256 |
| --- | --- |
| `62fba0..630273` collector including split unwind fragments | `3d4113b905b2f8e26ba44154cd7a709ad7c1066eff88970603253bc41fe854c5` |
| `63bb20..63bb9c` original collected-group copy constructor | `239678382ef83414c6b3b9d1d0ee7e4dfc402844e07e85967670ad614a7a3e24` |

Private Unicorn 2.1.4, Capstone 5.0.5, Python 3.14. No OS calls, imports, game
process or saves execute. Allocation append/copy/free functions are explicit
bounded stubs at `2bf5930`, `2bf5d70`, `2bf6c60`; original `63bb20` executes.
The group vector is preallocated; `63be30` growth is deliberately unreachable.
Any unapproved instruction target aborts. Per call: 100,000 instructions and
200,000 microseconds; 1 MiB synthetic heap, 64 KiB stack, 16 groups, at most 256
options per group and 512 stub calls per case. Explicit input mode is zero;
gameplay-name matching and mode-dependent blank-layer behavior are unverified.

Original exports were reused. Bounded disassembly of collector entry/body/return
and copy helper yielded 445 instructions. Entry-only inspection returned just
18 prologue instructions; following the actual split body/return was necessary.
This did not require extraction, Ghidra reimport or game execution.

## Subsequent integrated comparison

[Ordered multi-resource selection](MERGED_TEXTURE_SELECTION_RESEARCH.md) now
connects original wrapper/collector/selector execution in 390 isolated cases,
including an unnamed-layer mode exception. The remaining list below records
the original collector checkpoint; merged selection is closed only within that
new note's explicit fixture boundaries. Natural resource ordering remains open.

## Remaining boundaries at the collector checkpoint

- Actual scene/material resource order at `62f420` and caller declaration order.
- Linking native collection output directly into the full selector with multiple
  resource declarations, including compatibility fallback across resources.
- LinkedLayer, MatchName/DoNotMatch, alternate contexts, supplied palette modes.
- XML-derived float32 fixture versus original converted binary precision.
- DDS masks, diffuse textures and shader composition; exact category fixtures.
- Complete requested appearance-to-seed inverse and live runtime compatibility.

Do not add 65 collector cases to the 468 selector cases and call that 533 full
appearances. They compare different components with different supplied inputs.

External reports under `seed-analysis-180383`:
`texture-priority-collector-matrix-20261004.json`,
`texture-collector-instructions-20261004.json`,
`texture-collector-body-20261004.json`. Scripts and bounded commands are in the
[pipeline README](../runtime/research/README.md). Catalog organization and exact
inverse acceptance rules are in [priority catalog](PRIORITY_APPEARANCE_CATALOG.md).
