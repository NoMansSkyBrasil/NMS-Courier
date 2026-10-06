# Inventory class (C/B/A/S) generation research

Checkpoint: 2026-10-06, written by Claude Code. Status: **offline executable
evidence and an instruction-compared port**, not a runtime adapter and not a
delivery capability. No game process, save, mod, bridge or corpus was changed.
Start from [AI continuation](AI_CONTINUATION.md); the acquisition context is in
[native acquisition](NATIVE_ACQUISITION_RESEARCH.md).

## Environment changes every AI must read first

1. **The installed game was updated.** `E:\SteamLibrary\steamapps\common\No Man's
   Sky\Binaries\NMS.exe` was replaced on 2026-10-05 15:05 local (Steam build ID
   `25732212`, 88,560,712 bytes, PE timestamp 1790874153). Its SHA-256 is
   `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`.
   It no longer matches researched build 180383 (`671de226...`, 88,545,352
   bytes, PE timestamp 1790680261). Every hash-pinned tool rejects it. The
   internal build number of the new executable has not been read. The existing
   corpus was extracted before this update and may no longer match installed
   archives. No runtime compatibility of any kind extends to the new build.
2. **The exact 180383 executable was recovered** from the stored file bytes of
   the existing Ghidra project (opened `-readOnly`) with
   [ExportOriginalExecutable.java](../runtime/research/ExportOriginalExecutable.java).
   The recovered file hashes to `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`
   and lives at `E:\NMS-Courier-Executables\180383\NMS.exe`. Pass that path as
   `--executable` to offline tools. It must stay named `NMS.exe` (the Ghidra
   launcher uses the file name) and outside `E:\NMS-Courier-Research` (several
   tools reject outputs under the executable's grandparent directory).
3. **Private tools are in a packaged-app redirected directory.** Codex runs as a
   packaged Windows app, so what it documented as
   `%LOCALAPPDATA%\NMSCourier\research-tools\{native,unicorn-2.1.4}` and
   `research-references` physically lives under
   `%LOCALAPPDATA%\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\NMSCourier\`.
   Other programs see only `research-tools\python` (Capstone, HGPAKtool) at the
   plain path. Use the physical path from any non-Codex tool; Codex can keep
   using the documented path. Nothing was moved, copied or reinstalled.

## Recovered rule

All addresses are build 180383 RVAs. Names are analytical descriptions.

`4cfd10(store, seed_pair)` writes the class at inventory store `+0x100`:

1. Initialize the usual two-word state from the 16-byte seed pair: disabled
   seed gives `(1, 0)`; otherwise `low = low32(seed)` with zero replaced by one
   and `carry = ror32(low32(seed), 16) XOR high32(seed) XOR low32(seed)`.
2. One draw: `draw = low32(low * 0x5A76F899 + carry)`.
3. `r = float32(double(draw) * 2.3283064370807974e-10)` (double at `4b251f8`).
4. Row = `InventoryTable + 0x1a54 + 16 * index`, where the table pointer is
   `*(manager + 0x218)` and `index = *(int *)(*(manager + 0x72afb0) + 0x2524)`.
5. Accumulate four float32 weights, each multiplied by float32 `0.01`
   (`4b243a0`); the first position whose running sum is `>= r` is the class.
   If no sum reaches `r`, the class stays 0 (C).

`0x1a54` is the `ClassProbabilityData` field of `GcInventoryTable` (name string
`349bad0`, registration sites `2605899` and `2609a97`, four 16-byte entries).
The converted table (SHA-256
`2b6cb078323e33bfed649c0ed8a6026602a1e580780fbf9d33d30348f73dee25`) names the
rows Poor, Average, Wealthy, Pirate and the columns C, B, A, S.

The row index is **source-associated, not runtime-observed**: serializer bodies
`1e4f400`/`1e52e00` place the `TradingData` name at structure offset `+0x2520`,
and `GcPlanetTradingData` readers (`1df7350`, `1dfabd0`) place `WealthClass` at
`+4`. `0x2524` therefore coincides with the current solar system's
`TradingData.WealthClass`, whose four enum values carry the same names as the
rows. The owner of those serializer bodies was not independently identified as
`GcSolarSystemData`; treat the association as a strong lead.

Consequences that follow from the arithmetic and the build 180383 table:

| Row | Weights C/B/A/S | S draw interval (uint32, inclusive) | Share |
| --- | --- | --- | --- |
| Poor | 60/30/10/0 | none | S unreachable |
| Average | 49/35/15/1 | 4252017536..4294967166 | about 1.00 % |
| Wealthy | 30/40/28/2 | 4209067648..4294966911 | about 2.00 % |
| Pirate | 5/5/5/5 | 644245088..858993439 | about 5.00 % |

The Pirate row sums to 0.2, so draws above 858993439 (about 80 %) fall through
to the default C. Float32 accumulation leaves a few hundred top draws in the
Average and Wealthy rows as default C as well. Because the draw is linear in
the initial carry, for any fixed low seed word exactly one high word produces
each draw value; `high_words_for_class` reports the exact solution interval.
A class is therefore a property of *(seed, system wealth row)*, not of the
model seed alone, and the same seed has different classes in different systems.

## Callers and what they establish

Wrapper `4ccfa0(store, inventory_type, seed, ..., requested_class [stack arg 9])`:

- `requested_class != 4`: stored directly at `+0x100`.
- `requested_class == 4`: calls `4cfd10`, then keeps the generated class only
  for inventory types 3, 4 and 7; every other type (including 8) is reset to 0.
- It then generates layout and base stats for the stored class. Outer wrappers
  `4cced0` and `4cd160` forward their stack argument 8 as this class.

NPC component body `170a7a0` (object with stores at `+0x7d20`, `+0x7f68`,
`+0x81b0`; class at `+0x7e20`): ship-type field `+0x34` equal to 6 or 7 stores
class 3 directly; otherwise it calls `4cfd10`. The seed pair comes from
`9a9e70` (a resource-handle lookup) when field `+0x38` is 4, and otherwise from
a sign-extended 32-bit value at `*(component + 8) + 8`. The latter is **not**
shown to be the model seed. `1712f50` regenerates the three stores through
`4cd160`; call sites `1713115` and `171329f` pass the class at `+0x7e20`, while
the class argument at `17130b9` comes from a register not yet traced.
In purchase setup `8e3a10`, item kind 3 (the freighter kind) uses types 7, 8, 9.

Purchase setup `8e3a10` (reward route used by the Courier freighter experiment):
its item-kind-3 branch calls layout initializer `4cd270` (which zeroes `+0x100`)
and base-stat generator `4cea20` with class 0 and the minimum-value flag for
all three stores. It never reads the payload class at `+0x40` and never calls
`4cfd10`. This statically explains the repeated C result of the specific-ship
freighter reward on this build. It does not establish the same for build 179666
or for the newly installed build.

Direct callers of `8e3a10`: wrapper `8e4d30` (specific ship reward), weapon
handler `f31490`, and `1739170` (a globally configured ship setup). None is the
natural freighter purchase path, which was **not located** in this pass.

## Evidence

- Port: [evaluate-inventory-class.py](../runtime/research/evaluate-inventory-class.py),
  SHA-256 `88e70a85e6596d00a8a89eb321f187c4febafc6a15f50fcea903d29aeda5d790`.
- Comparison: [emulate-inventory-class.py](../runtime/research/emulate-inventory-class.py)
  runs original bytes of `4cfd10` (270 bytes, SHA-256 `f8de7f89...c1ba8e`) and
  the wrapper head `4ccfa0..4ccfed` (77 bytes, SHA-256 `72102f63...7e5eab`)
  under Unicorn 2.1.4 with a synthetic manager, row index and table.
  **619 cases, 0 mismatches**: 121 generator cases, 198 threshold-boundary
  seeds (each interval edge and both neighbours, three low words, four rows)
  and 300 wrapper cases (12 inventory types by five requested classes).
- Nine unit tests in [test_inventory_class.py](../runtime/research/test_inventory_class.py)
  use synthetic rows only.
- Ghidra stage `classgeneration20261006`, selection
  [class-generation-180383.tsv](../runtime/research/class-generation-180383.tsv)
  (SHA-256 `4ad9792b...474b99`): nine exports succeeded; `572c40` timed out at
  the 30-second per-function limit and is unread.
- External reports under `E:\NMS-Courier-Research\seed-analysis-180383`:
  `class-callers-20261006.json/`, `inventory-class-emulation-final-20261006.json`.

Recorded failure: the first boundary run reported 75 mismatches
(`inventory-class-emulation-boundaries-20261006.json`). The port had the bytes
of the double literal transposed (`...10 00 00 f0 3d` instead of
`00 00 10 00 00 00 f0 3d`), shifting every threshold by roughly 150 to 400
draws. The earlier 421-case run without boundary seeds had passed with that
error (`inventory-class-emulation-20261006.json`), so arbitrary seeds alone are
an insufficient check for float thresholds. Both superseded reports are kept.

New-build observation (static pattern only): the instruction bytes of `4cfd10`
and of the wrapper head, with rip-relative displacements and call targets
masked, each occur exactly once in the newly installed executable, at RVAs
`4cfda0` and `4cd030`. The table offset `0x1a54`, row field `0x2524` and
manager field `0x72afb0` are unchanged in those bytes. Table values of the new
build were not extracted. The masked head of `8e3a10` did not match.

## Not established

- The natural freighter acquisition path and the seed it supplies to the draw.
- Whether the live object at `manager + 0x72afb0` is the current solar system
  and which system applies while an offer is generated.
- Any class-setting API. Writing `+0x100` without regenerating the matching
  layout and base stats is incomplete by construction; the earlier live
  two-field frontend mutation recorded in the acquisition note did not fix
  the offer.
- Multitool and starship callers' concrete class arguments beyond the wrapper
  rule (types 3 and 4 keep a generated class when the argument is 4).
- Anything about slot counts, supercharged slots or upgrade-class rewards.

## Next bounded steps

1. Read the class argument at each `4cced0`/`4cd160` call site in `8e6590`,
   `8e6880`, `8e7860`, `55a330` and `17519a0` from bounded disassembly (Ghidra
   drops these stack arguments). Identify which pass 4 and which pass a stored
   class.
2. Locate the natural freighter purchase: find what fills the purchase object at
   `manager + 0x874030` with item kind 3 other than `8e3a10`, starting from
   `8e7860` case 3 and from readers of NPC component `+0x7e20`.
3. Decide the delivery design from that evidence: either a request-scoped
   change of the class argument on a verified native path, or a matching seed
   chosen with `high_words_for_class` for the target system's row. Both need
   exact-build live validation; neither is implemented.
4. Before any further native work on the installed game, fingerprint the new
   build, re-extract or re-verify affected tables, and re-locate every address.

## Reproduction

```powershell
$py = "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe"
$exe = 'E:\NMS-Courier-Executables\180383\NMS.exe'
$hash = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
$cx = "$env:LOCALAPPDATA\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\NMSCourier\research-tools"
$table = 'E:\NMS-Courier-Research\corpus\archives\NMSARC.Precache-a6371a8b2f06\metadata\reality\tables\inventorytable.MXML'

& $py runtime/research/evaluate-inventory-class.py --table $table `
  --table-sha256 2b6cb078323e33bfed649c0ed8a6026602a1e580780fbf9d33d30348f73dee25 `
  --seed 7 --low-word 7
& $py runtime/research/emulate-inventory-class.py --executable $exe `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$cx\unicorn-2.1.4" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\inventory-class-emulation-NEW.json
& $py -m unittest discover -s runtime/research -p test_inventory_class.py
& $py runtime/research/analyze-acquisition-offline.py --executable $exe --sha256 $hash `
  --tools "$cx\native" --seeds runtime/research/class-generation-180383.tsv `
  --output E:\NMS-Courier-Research\acquisition-180383 `
  --project-name Acquisition180383 --stage classgenerationNEW --timeout 600
```

The executable recovery itself is one read-only headless run of
`ExportOriginalExecutable.java` with the output path and expected SHA-256 as
script arguments; it refuses to overwrite and deletes a mismatching output.
