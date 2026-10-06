# Default (naturally generated) technology research

Checkpoint: 2026-10-06 (Claude Code). Status: **offline table reading and
partial pseudocode reading on build 180383**. Nothing here has been compared
with original instructions under emulation or observed in a running game. No
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
[default-technology-180383.tsv](../runtime/research/default-technology-180383.tsv)
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

## Not established

- The category enum order beyond what the mapping table and candidate counts
  suggest; which Ship entries the predicate keeps for each ship class (for
  example whether `SOLAR_SAIL` is limited to sail ships).
- Exact rounding, the meaning of the level/progress comparison, the stat-class
  conflict set and the override list semantics.
- Which arguments each natural caller passes (NPC ship component, purchase
  paths), and that natural freighters use this routine with type 8.
- Any numeric agreement with the game: no emulation, no live observation.
- Build 180836 values; the tables above are from the 180383 corpus.

## Next bounded steps

1. Port the routine and compare it with original instructions under Unicorn
   (synthetic technology table plus the real one), as done for the class draw.
2. Read the three natural callers' arguments from bounded disassembly.
3. Decide delivery: calling this native routine on the offer's technology
   store before the screen opens would give the natural loadout for the
   requested seed; the alternative is an explicit, user-chosen list. Either
   needs live validation and must keep the installed elements consistent with
   the special-slot and carry steps already in the profile.
4. Re-extract both tables from build 180836 before relying on the lists.

## Reproduction

```powershell
$py = "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe"
& $py runtime/research/inspect-default-technology.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/default-technology-NEW.json
```

The Ghidra stage is reproduced with `analyze-acquisition-offline.py`, the
recovered 180383 executable and the selection file above, using a new stage
name, as described in [inventory class research](INVENTORY_CLASS_RESEARCH.md#reproduction).
