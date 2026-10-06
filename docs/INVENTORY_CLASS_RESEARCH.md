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
   embedded build string of the new executable is 180836. The existing
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

## Build 180836 continuation: forcing the offered freighter class (2026-10-06)

The user authorized the newly installed executable as the research target. Its
embedded build string is **180836** (same `NMS-Release_20260811` branch as
180383), SHA-256 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`.

### Where the owned class comes from

In the existing 180383 export of purchase update `8e8830`, the item-kind-3
acceptance block copies the temporary offer store at item `+0x980` into the
player's type-7 store and item `+0xbc8` into the type-9 store with `4d1240`.
Bounded disassembly of `4d1240` shows it copies the class field (`+0x100`) and
`+0xfc`. The type-8 store is copied from an NPC object's store only when the
item's handle resolves. Therefore the class present in the offer stores when
the offer is accepted becomes the owned freighter class. The earlier live
negative (changing two frontend headers while an offer was already open did
not change the badge, build 179666) does not contradict this: that offer was
declined, and the badge is evidently read earlier.

### Relocation and equivalence on 180836

[relocate-native-signatures.py](../runtime/research/relocate-native-signatures.py)
matches masked instruction windows (rip-relative displacements and direct
branch targets wildcarded). Report:
`seed-analysis-180383/relocation-180383-to-180836-20261006.json`, 11 of 12
windows unique.

| Analytical label | 180383 RVA | 180836 RVA |
| --- | --- | --- |
| Class generator | `4cfd10` | `4cfda0` |
| Class wrapper | `4ccfa0` | `4cd030` |
| Base-stat generator | `4cea20` | `4ceab0` |
| Purchase setup | `8e3a10` | `8e58e0` |
| Setup wrapper | `8e4d30` | `8e6bf0` |
| Specific-ship handler | `f27cd0` | `f29b80` |
| Purchase update | `8e8830` | `8ea6f0` |
| Inventory copy | `4d1240` | `4d12d0` |
| Generic reward entry | `f12240` | `f140f0` |
| Application update | `2d7530` | `2d7580` |
| Reward dispatcher | `f19c30` | `f1bae0` |

The 69-byte layout-initializer window did not match (a 64-byte prefix matches
once at `4cd300`); it is not used by the profile. All 33 direct callers of the
generic reward entry that load `rcx` from a static address use `7103880` on
180383 and `7207900` on 180836. Direct disassembly of the 180836 purchase setup
shows the same freighter block at `8e684d..8e68cc`: three calls of the stat
generator for stores `+0x980` (type from a local set to 7), `+0xe10` (type 5)
and `+0xbc8` (type 9), each with `xor r9d, r9d` (class 0), stack argument 6
equal to 10 and the minimum-value byte set to 1.

### Research profile (built and fixture-tested, **not installed, not live-tested**)

[freighter_class_180836.c](../runtime/native/asi/freighter_class_180836.c),
build mode `FreighterClass180836`:

- Starts only when the running executable hashes to the 180836 fingerprint and
  the in-memory bytes of the update entry, reward entry, setup entry, stat
  generator entry and the whole 127-byte freighter block match.
- Creates disabled hooks and five process-specific random-named events
  (`c`, `b`, `a`, `s`, `dispatch`). Hooks are enabled on the first signal and
  removed after a 30-minute window.
- Setup detour: calls the original with all eleven argument slots unchanged.
  If item kind is 3 and a class request is armed, it consumes the request
  atomically, checks that the item span is committed read-write memory, writes
  the class at `+0x100` of the three stores and calls the native stat generator
  with the native argument values except the class and with the minimum-value
  flag cleared (as the native ship reward branch does). One request applies to
  one setup.
- Optional `dispatch` event: one call of the generic reward entry on the
  update thread with the shipped ID `RS_S13_S4M6` (a specific-ship freighter
  reward whose table entry declares class B, `IsGift=false`, zero cost in the
  180383 corpus). It can be requested once per process and is never retried.
  The ten-argument call shape is the one live-verified on build 179666; the
  24-byte entry prologue is identical, but the ABI is **unverified on 180836**.
- [signal-freighter-class-180836.ps1](../runtime/native/asi/signal-freighter-class-180836.ps1)
  checks the process, executable and DLL hashes, log freshness, profile state
  and unused dispatch state before signaling; `-PreflightOnly` signals nothing.

Fixture ([run-freighter-class-fixture.ps1](../runtime/native/asi/tests/run-freighter-class-fixture.ps1),
fake host, never installed): unarmed exclusion, kind filter, exact generator
arguments and store order, one-shot consumption, class B via the dispatch
path, single dispatch, unwritable-item rejection, timed hook removal and
preserved original return values all passed. Fixture DLL SHA-256
`5bf9d9f5e6480c49e62947e10f258975d91e6561beece14688af22d040c8243b`.
Production DLL SHA-256
`b3fcecf78eebc166e708ab17a73da650e72c1961fb9a3cfa6fd823705e342bb9`, built with
llvm-mingw 20260922 into `E:\NMS-Courier-Research\native-builds\freighter-class-180836-20261006`.
In the fake host the production DLL exposed no fixture export and wrote no
profile log; the startup rejection diagnostic itself was not captured because
the host exited first. The `RewardObserver180383` mode still compiles.

Currently installed in the game directory (unchanged by this work): bridge DLL
`1cb8ed07...7a8040` (180383 reward observer, which rejects the new build) and
data mod folder `NMSCourierCurrencyRewardProbe`.

### Proposed live validation (requires the user; nothing below was executed)

1. With the game closed, verify the installed executable hash, back up the
   current `xinput9_1_0.dll` externally with its hash, and copy the production
   DLL above into `Binaries`; verify the copied hash.
2. Start the game, load a **disposable** save into ordinary gameplay.
3. `signal-freighter-class-180836.ps1 -GameProcessId <pid> -ExpectedDllSha256 b3fcecf7... -Class S -PreflightOnly`,
   then the same command with `-DispatchTestReward` instead of `-PreflightOnly`.
4. Record what appears: whether an offer opens, its class badge, slots and
   price; then the log `native-freighter-class-180836-<pid>.log`
   (`applied_count`, `class_before`, `class_after`, `dispatch_state`).
5. Decline first. Accepting replaces the save's freighter and is a separate,
   later step with read-back of the owned class and a normal save/reload.

Unknowns this test would resolve: whether the dispatch ABI and the shipped
reward ID work on 180836; whether the badge shows the forced class; whether
base stats follow it. Not covered: slot counts, technology cap by class,
supercharged slots, model/seed selection, persistence. A crash or a missing
offer is a possible outcome; the dispatch must not be repeated in that process.

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
4. Run the proposed live validation of the 180836 class profile with the user
   present, then record the outcome in the experiment log before any redesign.
5. Re-extract or re-verify the tables used here from the 180836 archives; the
   corpus still describes 180383.

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
