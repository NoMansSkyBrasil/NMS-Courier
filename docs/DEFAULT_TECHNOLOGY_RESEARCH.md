# Default (naturally generated) technology research

Checkpoint: 2026-10-06 (Claude Code). Status: **offline table reading,
pseudocode reading and execution of the original routine under emulation on
build 180383** with synthetic runtime state. Nothing here has been observed in
a running game. No
game, save, mod or bridge file was changed for this note. Start from
[AI continuation](AI_CONTINUATION.md); delivery context is in
[inventory class research](INVENTORY_CLASS_RESEARCH.md).

## Why this matters

The user requires delivered ships, multitools and freighters to carry the
technologies a naturally generated entity would start with. Every Courier
freighter offer so far shows exactly the two elements listed by the test reward
(`F_HYPERDRIVE`, `F_TELEPORT`). The reward path installs payload elements; it
does not run natural generation.

## Confirmed table facts (build 180383 corpus)

Source: `metadata/reality/tables/nms_reality_gctechnologytable.mbin` in
`NMSARC.Precache.pak`, indexed content hash
`b8f35e5eec6bef07700e106d93359ae9a01e6ff10ef991fdc334c4ad64bacf8b`, converted
MXML SHA-256 `29b1f8034b6cd14d941569949bbc9cdc7e66c76c5eaeacc4c97661386c4f5d65`,
393 entries. English names come from the corpus localisation files.

- **"Plasmatic Warp Injector" is `F_HDRIVEBOOST2`**: category Freighter, rarity
  VeryRare, an upgrade that requires `F_HYPERDRIVE`. The user's recollection of
  it on a natural freighter is consistent with the table.
- Freighter category, entries that are neither `Impossible` nor templates:

  | ID | English name | Rarity | Requires |
  | --- | --- | --- | --- |
  | `F_HYPERDRIVE` | Freighter Hyperdrive | Always | none |
  | `F_HDRIVEBOOST1` | Warp Core Resonator | Rare | `F_HYPERDRIVE` |
  | `F_HDRIVEBOOST2` | Plasmatic Warp Injector | VeryRare | `F_HYPERDRIVE` |
  | `F_SCANNER` | Interstellar Scanner | VeryRare | none |

  `F_TELEPORT` (the matter beam in the test reward) is rarity **Impossible**:
  natural generation cannot select it. `F_HDRIVEBOOST3` and the four
  `F_HACCESS` drives are Impossible as well.
- `Always` sets of other categories: Ship has six (`SHIPJUMP1`, `LAUNCHER`,
  `HYPERDRIVE`, `SHIPSHIELD`, `SHIPGUN1`, `SOLAR_SAIL`); AlienShip six;
  RobotShip six; Weapon three (`SCANBINOC1`, `SCAN1`, `LASER`); Suit four.
- Non-Always candidates: AllShipsExceptAlien 25 (7 Normal, 1 Common, 8 Rare,
  9 VeryRare), Weapon 28 (1 VeryCommon, 22 Common, 3 Rare, 2 VeryRare), Suit
  26 Common. Many list a required technology.
- `TechRarityData` in `gcplayerglobals.global` (converted SHA-256
  `fe26a57ac067c51c12e0fcf5bd946c3c94af3e6495db7ea036e5dae68b6411b8`) has seven
  values in rarity order: 10, 50, 25, 2, 1, 0, 9999999. Read against the
  rarity names this is Normal 10, VeryCommon 50, Common 25, Rare 2, VeryRare 1,
  Impossible 0, Always 9999999; the enum order is inferred from the values and
  the code below, not from a named declaration.

The complete candidate list per category is produced by
[inspect-default-technology.py](../runtime/research/inspect-default-technology.py)
(`seed-analysis-180383/default-technology-candidates-20261006.json`). It is a
catalog of what *can* be drawn, not a predictor.

## Native selection rule (read from pseudocode, not yet emulated)

`4cef50(store, inventory_type, seed, class_argument, size_argument, overrides)`
is called by the ordinary inventory wrapper `4ccfa0` right after layout. Ghidra
stage `defaulttechnology20261006`, selection
[default-technology-180383.md](../runtime/research/default-technology-180383.md)
(SHA-256 `02654970...f85761`), three exports. What the pseudocode shows:

1. It empties the store's element vector, then builds a candidate list. Every
   technology table entry (stride `0x2e0`) whose byte at `+0x2c9` is clear and
   which passes predicate `4d46d0` becomes a candidate with one uniform draw
   from the store seed. For inventory types other than 7, 8 and 9 it also adds
   entries of a second table (stride `0x290`, resolved to technologies), each
   with its own draw: freighter stores draw no procedural upgrades.
2. The predicate maps the technology category through a table at `4a5d414`
   (category index to inventory type; index 6 maps to type 8, index 1 to type
   3, index 0 and 13..17 to type 5) and applies ship-class exceptions for class
   arguments 7, 9, 10 and 12.
3. The number of non-Always picks is `slot count / 9` (`/ 5` for inventory
   type 3) times a factor chosen by the same solar-system wealth row used for
   the class draw (`0.3, 0.6, 1.0, 0.6`), rounded, clamped to 1..10 (5..>=9
   when the size argument is 9), then one draw picks a value between the
   minimum and that number.
4. Each round takes the candidate with the largest `weight * draw`, where the
   weight is `TechRarityData[rarity]`; rarity 6 is forced to the 9999999
   literal and rarity 5 to -1. A candidate is excluded when its level field
   exceeds a progress value in the manager, when its required technology is
   not yet in the store, or when a listed dependency is unknown; a candidate
   whose stat class is already present is multiplied by 0.1. An optional
   override list can force, scale or forbid single technologies.
5. Always-rarity picks do not count against the quota. Each pick is inserted
   with `4d06f0` and removed from the candidate list.

Consequences, to be confirmed: a natural freighter always has the hyperdrive
and, depending on slots, system wealth and seed, usually one further module
out of Warp Core Resonator (weight 2), Plasmatic Warp Injector (weight 1) and
Interstellar Scanner (weight 1). Ships get the six-entry Ship set filtered by
the predicate plus weighted picks from the shared ship list and procedural
upgrades; multitools get scanner, visor and mining beam plus weighted picks.
The loadout is a function of seed, slot count, wealth row and progress, so it
is not one fixed list per entity type.

## Original routine under emulation (2026-10-06)

[emulate-default-technology.py](../runtime/research/emulate-default-technology.py)
maps the `.text`, `.rdata` and `.data` sections of the pinned 180383 executable
and the **original technology table binary** (SHA-256
`b8f35e5e...acf8b`; its entry layout equals the runtime layout: ID `+0x108`,
category `+0x194`, rarity `+0x1b0`, required technology `+0x128`, stat list
`+0x158`, template flag `+0x2c9`) into Unicorn 2.1.4 and runs `4cef50` itself.
Synthetic inputs: manager block, wealth row, progress value, the list searched
for required technologies, rarity weights and a fully valid ten-column store.
Boundaries replaced by private code: element insertion (`4d06f0`, recorded and
appended to the store), the engine allocator and its releases, three imported
memory helpers, the stack probe, one map clear and one no-op initializer.
Everything else, including the predicate, weighting, dependency checks, stat
set and candidate removal, is the game's own instructions.

The rarity enum order is now read from the binary (0 Normal, 1 VeryCommon,
2 Common, 3 Rare, 4 VeryRare, 5 Impossible, 6 Always). The class argument is
`4d47f0(size type)`, decoded from its jump table: freighter size types 27..29
give 0, scientific 3, fighter 2, shuttle 4, hauler 1, exotic 6, living 7,
solar 8, sentinel 9, multitool sizes 12.

Results (reports under `seed-analysis-180383`, all runs without error):

- Freighter technology store, type 8, class argument 0, seed
  `0x8C968767B3282F13` (the user's pirate model seed), 24 cases
  (`default-technology-freighter-pirate-seed-20261006.json`):

  | Slots | Poor | Average | Wealthy | Pirate |
  | --- | --- | --- | --- | --- |
  | 13, 19, 25 | hyperdrive + Warp Core Resonator | same | same | same |
  | 30 | same | same | + Plasmatic Warp Injector | same |
  | 60 | hyperdrive + Resonator | + Injector | + Injector + Interstellar Scanner | + Injector |
  | 120 | + Injector | + Injector + Scanner | + Injector + Scanner | + Injector + Scanner |

- Sixteen other seeds at 25 slots, Pirate row
  (`default-technology-freighter-seeds-20261006.json`): always the hyperdrive
  plus exactly one of Warp Core Resonator or Plasmatic Warp Injector (seeds 1
  to 7 and `0xFFFFFFFFFFFFFFFF` gave the Injector, the others the Resonator).
- Ship stores (type 5) with the second table empty, so procedural upgrades are
  missing: classes 1, 2, 3, 4, 6 gave pulse engine, launch thruster,
  hyperdrive, deflector shield, photon cannon and one or two weighted picks
  (rocket launcher, cyclotron ballista); class 7 the six living-ship parts;
  class 9 the sentinel parts plus weighted picks; class 8 additionally the
  Vesper Sail.
- Multitool store (type 3, class argument 12), second table empty: scanner,
  analysis visor and mining beam plus two to four weighted picks that differ
  by seed (boltcaster, scatter blaster, survey device, waveform recycler,
  blaze javelin, terrain manipulator).

Assumptions that the reports state and that still need evidence: the seed fed
to this routine by natural callers is the entity's model seed; every required
technology is in the manager list; the progress value does not exclude
entries; the runtime-initialized ID global at `5220e20` holds `SOLAR_SAIL`
(with it left zero every non-living class received the Vesper Sail, which is
the behavior the special branch is evidently there to prevent).

For the user's Dreadnought seed this predicts a natural loadout of hyperdrive
plus Warp Core Resonator at native slot counts, and at 120 slots hyperdrive,
Warp Core Resonator, Plasmatic Warp Injector and, outside poor systems,
Interstellar Scanner. This is a prediction from emulated original code under
the stated assumptions, not an observation of the game.

### Procedural upgrade table added (2026-10-06, later run)

The emulator now also maps the original procedural technology table (SHA-256
`8c72de23...b76df`, 254 entries of `0x290` bytes: ID `+0x40`, template ID
`+0x60`, skip flag `+0x284`, 31 flagged). Three engine routines are private
boundaries: the technology lookup by ID (`ec6f10`) answers from the mapped main
table, and the two procedural-instance routines (`ec1a10`, `ec1e60`) return a
copy of the template entry carrying the procedural ID. Real generated stats are
therefore not modeled, and the routine's penalty for an already present stat
class is only approximate for procedural picks.

With that table (20 slots, wealthy row, fighter class argument 2): seed 7 gave
the five core parts plus `UP_S_SHL3`; `0xDEADBEEF` plus `UP_S_SHL4` and
`UP_S_SHL1`; seed 1 plus `UP_S_SHL4`; seed 2 plus `UP_S_SHL3` and `UP_S_SHL4`.
Multitool, 24 slots: seed 7 scanner, visor, mining beam, survey device and
`UP_LASER4`; `0xDEADBEEF` added boltcaster, survey device, `UP_LASER4` and
`UP_LASER1`; seed 1 terrain manipulator and `UP_SCAN2`; seed 2 boltcaster,
`UP_LASERX` and terrain manipulator. Compared with the earlier main-table-only
runs the weighted picks changed, as expected when more candidates draw from
the same stream. Repeated shield or laser upgrades in one result are exactly
where the unmodeled stat penalty matters, so treat multi-upgrade results as
provisional. Reports: `default-technology-fighter-procedural-try1-20261006.json`
and `default-technology-weapon-procedural-try1-20261006.json`.

## Selection port compared with the original (2026-10-06, later)

`runtime/research/evaluate-default-technology.py` is an independent Python
port of `4cef50` and its predicate `4d46d0`: candidate lists and per-candidate
draws, the pick quota (`slots/9`, or `/5` for inventory type 3, times the
wealth factor, rounded, clamped 1..10, then one draw; size argument 9 forces
5..9+), the weight rule (`TechRarityData` weight times the draw; Always is
9999999; Impossible and unmet level, known-list or in-store requirements give
-1), the stat-class penalty (x0.1) and the order of installation.
`emulate-default-technology.py --compare-port` runs the original routine and
the port on the same inputs and counts differences.

| Store | Inputs | Cases | Differences |
| --- | --- | --- | --- |
| Freighter technology (type 8) | slots x wealth rows x seeds | 8,000 | 0 |
| Freighter main (type 7) | same shape | 1,200 | 0 |
| Freighter type 9 | same shape | 800 | 0 |
| Ship type 5, class argument 1 (hauler) | same shape | 2,000 | 0 |
| Ship type 5, class argument 2 (fighter) | same shape | 2,000 | 0 |
| Ship type 5, class argument 3 (scientific) | same shape | 2,000 | 0 |
| Ship type 5, class argument 4 (shuttle) | same shape | 2,000 | 0 |

Completed later the same night, all with 0 differences: ship class arguments
6, 7, 8 and 9 (2,000 cases each), fighter with size argument 9 (1,600),
multitool store (type 3, class argument 12; 4,800), exosuit store (1,200),
multitool with an empty known list (800), fighter with progress 0 (800) and
fighter without the special ID (400) and sail without the special ID (400).
Total for this matrix: **36,000 cases, 0 differences** in 18 groups.

### Procedural upgrade instances

A procedural pick is not installed as the table entry. `ec1a10` builds the
instance ID `'%.9s#%05u'` from **one draw of the store seed**
(`number = draw * 100000 >> 32`), so every procedural upgrade generated for one
store shares the same five digits. `ec1e60` copies the template entry
(`5f0b00`), writes the new ID, clears the template byte `+0x2c9`, keeps the
base stat (`+0x18c`) and replaces the stat list with a generated one:

1. Stream state from the number alone:
   `h = ((n ^ 0x3d0000) >> 16) ^ n; h *= 9; h ^= h >> 4; h *= 0x1b873593;
   h ^= h >> 15` (32-bit), then the usual state layout.
2. For qualities 4, 5 and 6 one extra draw decides a boosted roll:
   `draw * 100 >> 32 < percentage` (the percentage is a runtime global,
   RVA `5246310`; its value is not read offline).
3. One draw through the entry's weighting curve gives the number of stats
   between `NumStatsMin` and `NumStatsMax` (rounded half away from zero).
4. Non-always stat levels are shuffled from the last index down
   (`other = draw * (position + 1) >> 32`); always-stats come first; at most
   four stats are kept.
5. Each kept stat takes one draw through its own weighting curve between its
   minimum and maximum (boosted rolls use a second draw in a narrow top or
   bottom band; the forced flag uses constants).

Weighting curves come from `DefaultReality` (struct offset `85d2`, seven
bytes `00 10 13 19 11 14 1a`: linear, ease-in quad/quart/expo, ease-out
quad/quart/expo); formulas were read from `2d6b820`.

`runtime/research/evaluate-procedural-technology.py` ports this;
`emulate-procedural-technology.py` executes the original instruction windows
`ec1f9b..ec1fe3` (state) and `ec272e..ec2e75` (stats) and compares: state
10/10, statistics 4,256/4,256 with `--numbers 6`. Not ported: names,
descriptions, colours and the copied template fields.

The selection comparison now uses these instances: with `--reality-data` the
emulator's stand-ins for `ec1a10`/`ec1e60` give the original routine a
template copy with the ported ID and statistics, and the port receives the
same model. This checks how selection consumes instances (the stat-class
penalty of later picks); the generator itself is checked by the window
comparison above, not end to end. Final instance-aware matrix, boosted percentage 0 and 100:
ship class arguments 1, 2, 3, 4, 6, 7, 8, 9 and 10 and the multitool store,
732 cases per group, **14,640 cases, 0 differences** (reports
`instances-v2-*`), plus a 204-case fighter smoke run.

Two tool defects were found and fixed while doing this, neither in the port:
the report stored each case's installed list in a list that the next case
overwrote (the comparison itself used the right values), and the synthetic
store marked ten valid slots for a five-slot store, which produced 303 false
differences until the last row's mask followed the slot count.

## Not established

- The category enum order beyond what the mapping table and candidate counts
  suggest; which Ship entries the predicate keeps for each ship class (for
  example whether `SOLAR_SAIL` is limited to sail ships).
- Exact rounding, the meaning of the level/progress comparison, the stat-class
  conflict set and the override list semantics.
- Which arguments each natural caller passes (NPC ship component, purchase
  paths), and that natural freighters use this routine with type 8.
- Agreement with a running game: emulation and port only, no live observation.
- The boosted-roll percentage (runtime global) and the forced flag's callers.
- An end-to-end run of `ec1e60` inside the selection emulation; the instance
  generator is compared by instruction windows only.
- Build 180836 values; the tables above are from the 180383 corpus.

## Next bounded steps

1. Done 2026-10-06: port, procedural instances and comparison (section
   above). Finish reading the remaining matrix reports.
2. Done 2026-10-07 for the wrapper: the routine has one direct caller and
   takes the same seed as class, layout and base stats; see
   [the natural generation order](INVENTORY_CLASS_RESEARCH.md#one-wrapper-one-seed-natural-generation-order-2026-10-07-offline).
   Still open: which seed the wrapper's own callers pass.
3. Decide delivery: calling this native routine on the offer's technology
   store before the screen opens would give the natural loadout for the
   requested seed; the alternative is an explicit, user-chosen list. Either
   needs live validation and must keep the installed elements consistent with
   the special-slot and carry steps already in the profile.
4. Re-extract both tables from build 180836 before relying on the lists.

## Reproduction

```powershell
$py = "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe"
$cx = "$env:LOCALAPPDATA\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\NMSCourier\research-tools"
$table = 'E:\NMS-Courier-Research\corpus\archives\NMSARC.Precache-a6371a8b2f06\metadata\reality\tables\nms_reality_gctechnologytable.mbin'
& $py runtime/research/emulate-default-technology.py `
  --executable E:\NMS-Courier-Executables\180383\NMS.exe --table $table `
  --table-sha256 b8f35e5eec6bef07700e106d93359ae9a01e6ff10ef991fdc334c4ad64bacf8b `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$cx\unicorn-2.1.4" --inventory-type 8 `
  --slots 19 --slots 120 --wealth-row 1 --seed 8C968767B3282F13 `
  --output E:\NMS-Courier-Research\seed-analysis-180383\default-technology-NEW-emulation.json
& $py runtime/research/inspect-default-technology.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/default-technology-NEW.json
```

The Ghidra stage is reproduced with `analyze-acquisition-offline.py`, the
recovered 180383 executable and the selection file above, using a new stage
name, as described in [inventory class research](INVENTORY_CLASS_RESEARCH.md#reproduction).
