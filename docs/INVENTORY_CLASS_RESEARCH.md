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
  [class-generation-180383.md](../runtime/research/class-generation-180383.md)
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

### Research profile (fixture-tested; first live run recorded below)

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

### First live result: S-class freighter offer (2026-10-06, build 180836)

**Observed, once, in one process.** This is the first time a Courier-triggered
freighter offer showed a class other than C.

| Item | Value |
| --- | --- |
| When | 2026-10-06, about 10:46 to 11:00 local (America/Fortaleza); game process started 10:45:58 |
| Where | Installed Steam game, `E:\SteamLibrary\steamapps\common\No Man's Sky`, PID 22104, user's loaded save in ordinary gameplay |
| Executable | Build 180836, SHA-256 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499` (`asi-startup-22104.log`: `exact_build_startup_observed`) |
| Bridge | `xinput9_1_0.dll` `FreighterClass180836`, SHA-256 `b3fcecf78eebc166e708ab17a73da650e72c1961fb9a3cfa6fd823705e342bb9`, installed with the game closed after hash checks; previous DLL `1cb8ed07...7a8040` backed up to `E:\NMS-Courier-Research\native-builds\installed-backup-20261006` |
| Data mods | Only the pre-existing `NMSCourierCurrencyRewardProbe` folder; no freighter data mod |
| Preflight | `signal-freighter-class-180836.ps1 -Class S -PreflightOnly` passed: status `awaiting_request`, hooks created, all five byte windows had matched, `dispatch_state=0` |
| Trigger | `signal-freighter-class-180836.ps1 -GameProcessId 22104 -ExpectedDllSha256 b3fcecf7... -Class S -DispatchTestReward`, one time |

How it was done, step by step:

1. The class event `s` armed one request and enabled the two hooks.
2. The `dispatch` event made the update-thread detour call the native generic
   reward entry (`f140f0`, manager `7207900`) once with the shipped reward ID
   `RS_S13_S4M6`.
3. The game's own reward handling reached purchase setup (`8e58e0`) with item
   kind 3. The original ran unchanged and left class 0 in all three offer stores.
4. After it returned, the detour wrote class 3 at `+0x100` of stores `+0x980`,
   `+0xe10` and `+0xbc8` and called the native base-stat generator (`4ceab0`)
   for each with class 3 and the minimum-value flag cleared.
5. The game then opened its normal freighter offer screen.

Profile log six seconds after the signal (`native-freighter-class-180836-22104.log`):
`dispatch_state=3`, `setup_calls=1`, `freighter_setups=1`, `last_kind=3`,
`applied_count=1`, `applied_class=3`, `rejected_item=0`,
`class_before=0,0,0`, `class_after=3,3,3`. The process stayed alive and
responsive.

User-supplied screenshot of the offer: title "Nave cargueira restaurada",
**S class badge**, cost 23,000,000 units, slot summary 19 and 19, hyperdrive
range 168.2, warp efficiency 0.3, storage 19, fleet coordination 27.1; a
technology grid seven columns wide with two installed technologies and a
cargo grid seven columns wide.

What this establishes on build 180836: the ten-argument generic reward call
shape and the shipped reward ID work; the specific-ship freighter setup leaves
class C although the table entry declares B; a class stored before the offer
screen is created is the class the screen shows. The table's zero cost did not
produce a zero price in this offer.

What it does not establish: the class after acceptance and after save/reload
(the offer had not been accepted when this was written), whether the displayed
stats equal native S-class stats of a naturally generated freighter, slot
counts beyond the native 19/19, anything on another build, repeatability
(one run), or behavior with a different reward, seed or model. The save was
selected by the user; it was not independently confirmed to be disposable.

### Second live result: S class with 120/60 grids (2026-10-06, build 180836)

| Item | Value |
| --- | --- |
| When | 2026-10-06, about 11:09 to 11:20 local; game process started 11:09:15 |
| Where | Same installed game and user save, PID 22292 |
| Executable | Build 180836, SHA-256 `13d5060d...cc3499` |
| Bridge | `FreighterClass180836` with the slot override, SHA-256 `2e4403736cef5bed030fa082eba0fd077fac32ce7afdb61a0d635c6b140bc94c`, installed with the game closed over `b3fcecf7...` after hash checks |
| Trigger | `signal-freighter-class-180836.ps1 -Class S -MaxSlots -DispatchTestReward` after a passing preflight, one time |

Earlier state reported by the user before this run: the first S offer had been
accepted, the game saved and restarted, and the owned freighter **still showed
S**. Owned slot counts were not reported.

Profile log six seconds after the signal: `dispatch_state=3`,
`freighter_setups=1`, `applied_count=1`, `class_before=0,0,0`,
`class_after=3,3,3`, `slots_applied=1`, `layout_overrides=2`,
`main_grid=10,12,120`, `technology_grid=10,6,60`. Process alive and responsive.

User screenshot of the offer: S badge, slot summary **120 and 60**, storage
120, cost 600,000,000 units, hyperdrive range 168.2, fleet coordination 27.1,
ten-column technology and cargo grids, the two default technologies installed,
and exactly **one** special (supercharged) technology slot at column 3, row 1.
The user then accepted the offer, saved and closed the game; the owned state
after this acceptance has not been reported yet.

Established: changing only the slot count and argument 9 of the native layout
initializer yields the large bounds and a fully valid grid in the offer; the
price follows class and slots (23,000,000 at 19/19, 600,000,000 at 120/60).
Not established: owned grids after acceptance, persistence, technology
transfer, more than one run.

### Third live result: 120/120 offer, all technology slots special; carry not applied (2026-10-06)

| Item | Value |
| --- | --- |
| When | 2026-10-06, about 11:27 to 11:45 local; game process started 11:27:13 |
| Where | Same installed game and user save, PID 9912 |
| Executable | Build 180836, SHA-256 `13d5060d...cc3499` |
| Bridge | SHA-256 `ec4da1c76b313ab860b76fdcc40438b2d7a233fd167ede758a8e3eb3f652681c` (source commit `a8fe8e0`), installed with the game closed over `2e440373...` after hash checks |
| Trigger | `signal-freighter-class-180836.ps1 -Class S -MaxSlots -ExtendedTechnology -Supercharge -DispatchTestReward` after a passing preflight, one time |

Owned state before the run (user screenshot of the freighter accepted in the
second run, after save and restart): S badge, storage 120 with a full
ten-column cargo grid, but the **technology grid was still the older sparse
seven-column layout** with one special slot. This confirms the static reading
that a reward offer's technology store is not transferred at acceptance while
class and main grid are.

Profile log after the signal: `dispatch_state=3`, `applied_count=1`,
`class_after=3,3,3`, `layout_overrides=2`, `main_grid=10,12,120`,
`technology_grid=10,12,120`, `table_patches=1`, `table_rejected=0`,
`super_added=119`, `super_errors=0`, `carry_pending=1`. Process alive and
responsive.

User screenshot of the offer: S badge, slot summary **120 and 120**, every
visible technology slot drawn as a special slot, both default technologies
installed, cost 600,000,000, hyperdrive range 210.0 (168.2 in the earlier
offers), fleet coordination 27.1.

The user accepted. Afterwards the owned freighter looked the same as before
the run (sparse technology grid, one special slot), and the log still showed
`carry_pending=1`, `carry_applied=0`: **the acceptance carry did not fire.**
The profile had no diagnostics for why. Candidate causes: the seed passed at
acceptance is read from the resource descriptor (`+0x10` of the object returned
for the item's handle), which need not equal the item seed the profile
compared with; or acceptance through the comparison screen reaches the
routine from another call site.

Established on build 180836: the native growth helper call shape works for the
special-slot vector (119 appends, no error); a scoped height bound of 12
produces a 10 x 12 technology grid in the offer; the offer screen draws all of
them as special slots; installed special-slot bonus is reflected in the
displayed hyperdrive range. Not established: any transfer of the offered
technology store to the owned freighter.

Follow-up build (not yet run): the carry now requires only inventory type 8, a
store outside the offer, an unchanged offer seed and a caller inside the
purchase update function (`8ea6f0..8ef9c6`); it records up to six caller RVAs,
whether the caller was the exact expected site and whether the passed seed
equalled the offer seed. Fixture DLL SHA-256
`53e2c6df7905fd69c532022702455e8c0a8089dc33477deb4f891947a557a320`; production
DLL SHA-256 `99a887a3aa9fba5307bcbe72779285cf4af2f21d552db0ea198209ea2d64db61`
(`native-builds\freighter-class-carry-180836-20261006`).

### Fourth live result: owned S freighter with 120 cargo and 120 all-special technology slots (2026-10-06)

| Item | Value |
| --- | --- |
| When | 2026-10-06, about 11:37 to 11:55 local; game process started 11:37:19 |
| Where | Same installed game and user save, PID 436 |
| Executable | Build 180836, SHA-256 `13d5060d...cc3499` |
| Bridge | SHA-256 `99a887a3aa9fba5307bcbe72779285cf4af2f21d552db0ea198209ea2d64db61` (source commit `d21c2a7`), installed with the game closed over `ec4da1c7...` after hash checks |
| Trigger | `signal-freighter-class-180836.ps1 -Class S -MaxSlots -ExtendedTechnology -Supercharge -DispatchTestReward` after a passing preflight, one time |

Sequence: the offer opened as in the third run (S, 120 and 120, every
technology slot special, cost 600,000,000, hyperdrive range 210.0). The user
pressed "Comparar"; the comparison screen listed the current freighter as
"120 / 13" with hyperdrive range 168.2 and the new one as "120 / 120" with
210.0, trade-in value 210,000,000. The user chose "Obter nave cargueira" and
answered **No** to the base-transfer prompt.

Profile log after acceptance: `carry_applied=1`, `carry_pending=0`,
`carry_candidates=1`, `carry_exact_site=1`, `carry_callers=8ee2ca`,
`carry_seed_equal=0`; earlier fields `class_after=3,3,3`,
`main_grid=10,12,120`, `technology_grid=10,12,120`, `super_added=119`,
`super_errors=0`, `table_patches=1`.

User screenshot of the **owned** freighter afterwards: S badge, full
ten-column cargo grid with storage 120, technology grid with every visible
slot special and both default technologies installed, hyperdrive range 210.0,
warp efficiency 0.7, fleet coordination 27.1. The user saved and closed the
game.

Established: the acceptance call is the expected site (`8ee2ca`); the seed it
passes is not the item seed, which is why the third run's carry did not fire;
the native store copy at that point gives the owned freighter the offered
technology store, including the 10 x 12 grid and the special slots.

Not established: persistence after restart (the user will check later);
behavior when the base transfer is accepted; whether a 12-row technology grid
and 120 special slots stay stable in play; what happened to technologies of
the replaced freighter (its technology store held only the hyperdrive); any
second run of this exact configuration; anything for ships, multitools or the
exosuit.

Design requirement recorded from the user in this session: the final bridge
must accept repeated requests with arbitrary parameters without restarting the
game. The one-shot-per-process dispatch is a property of this research
profile only.

### Next target requested by the user: freighter category, model and seeds (2026-10-06)

Not started. The user wants to choose the freighter category (normal, capital,
pirate "Dreadnought") and its seeds per request; the frontend may ship examples
but the seeds stay user-editable. Example supplied by the user for a pirate
capital freighter: model seed `0x8C968767B3282F13`, home/color seed
`0x175000B001FFD`. The reference images came from Reddit and the community
wiki, not from this project; they show an S-class pirate freighter and are not
evidence about any build researched here.

Known inputs to start from, none of them live-verified for this purpose:

- The specific-ship payload carries the scene filename and model seed
  (`ShipResource`), read by handler `f29b80` and passed to purchase setup; the
  test reward `RS_S13_S4M6` uses the ordinary procedural freighter scene.
- [The uninstalled pirate model variant](../runtime/mods/freighter_pirate_model_research/README.md)
  records the pirate scene path and its table source for build 180383.
- Owned freighter appearance uses a model seed and a separate home-system
  (palette) seed; see [entity seed flow](ENTITY_APPEARANCE_SEED_FLOW.md) and the
  three-seed freighter form in [the feature catalog](REFERENCE_FEATURE_CATALOG.md).

Requested outcome for this target (user, 2026-10-06): the delivered pirate
freighter keeps the technologies a naturally generated one starts with, and
uses the same layout as the fourth live result (120 cargo, 120 technology
slots, all technology slots special). Which technologies a natural pirate
freighter starts with is **not known here**: the reward path installs only the
elements listed in the payload (the test reward lists the hyperdrive and the
teleporter), while natural generation goes through the ordinary inventory
wrapper and its installed-technology routine (`4cef50` on 180383), which has
not been read. The wiki screenshot the user supplied shows a hyperdrive and one
further module, which is an external illustration, not evidence for this build.

Open questions for the first offline pass: where the payload filename and seed
can be supplied per request without a data mod (payload construction or a
scoped argument change at the handler or setup), how the home seed reaches the
owned freighter at acceptance, and whether the pirate scene needs the pirate
palette/customisation category.

### Fifth live result: pirate freighter by scene and seeds, three offers in one process (2026-10-06 evening)

| Item | Value |
| --- | --- |
| When | 2026-10-06, about 18:48 to 19:20 local; game process started 18:48:33 |
| Where | Same installed game and user save, PID 23116 |
| Executable | Build 180836, SHA-256 `13d5060d...cc3499` |
| Bridge | SHA-256 `f36ba9d65f97c82477b5daa043f8dd76ee8acbdecba23d459d65c30ff254adf0` (source commit `97a4313`), installed with the game closed over `99a887a3...` after hash checks |
| Request | `-Class S -MaxSlots -ExtendedTechnology -Supercharge -Scene MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN -ModelSeed 0x8C968767B3282F13 -HomeSeed 0x175000B001FFD -DispatchTestReward`, sent **three times** in the same process |

Sequence and observations:

1. First request: log `model_applied=1`, `applied_count=1`, grids 120/120,
   `super_added=119`. The user declined by mistake before reporting the screen.
2. Second request, same process (first repeated dispatch): log
   `setup_calls=2`, `model_applied=2`. Offer screenshot: **pirate freighter
   model**, S badge, 120 and 120, all technology slots special, hyperdrive and
   teleporter installed, cost 600,000,000, hyperdrive range 212.1, fleet
   coordination 26.3. The user accepted through the comparison screen and
   answered **Yes** to the base transfer. Log afterwards: `carry_applied=1`,
   `carry_exact_site=1`, `carry_seed_equal=1`, `home_applied=1`. The user saw
   no replacement and reported it as a bug.
3. Third request, same process: accepted with **No** to the base transfer. Log
   `carry_applied=2`, `carry_callers=8ee2ca,8ee2ca`, `home_applied=2`. The owned
   freighter screen showed the offer's statistics (212.1 and 26.3 instead of
   210.0 and 27.1) but still the **previous model and name**.
4. The user closed and reopened the game. The owned freighter then showed the
   pirate model, the name "Hayasenn CV-5", S badge, storage 120, all visible
   technology slots special, hyperdrive range 212.1, fleet coordination 26.3.
   The public example the user had cited for these seeds carries the name
   "CV-5 Hayasenn".

Established: scene and model seed substituted at setup arguments 2 and 3
produce the requested model in the offer; the acceptance block runs with either
base-transfer answer; the home seed override fires at the expected site; the
ownership record holds the new model after an ordinary save and restart;
several dispatches per process work when each call returns.

Open, with what is known:

- **The visible model and name do not update until restart.** Read offline on
  180383: after the home seed write the block calls `542750`, sets two byte
  flags at ownership `+0x461` and `+0x463`, and calls `543690(ownership, 0)`,
  which returns immediately when a predicate on the ownership position fields
  (`546290`) fails. The routine that consumes the two flags was not read. A
  deferred rebuild that never ran in that session is a hypothesis, not a
  finding. The earlier runs could not show this because the model did not
  change.
- Whether the first acceptance with **Yes** to the base transfer left any
  inconsistent base state; nothing was inspected.
- **Installed technologies**: every offer so far carries only the hyperdrive
  and teleporter listed by the test reward. The natural pirate loadout is
  unknown.
- Palette under the home seed was not compared with a reference.

### Persistence check of the fourth live result (2026-10-06 evening)

The user restarted the game about six and a half hours later (process started
18:28:28 local, PID 13136, same executable and installed DLL `99a887a3...`,
nothing signaled) and supplied a screenshot of the owned freighter: S badge,
storage 120 with the full cargo grid, technology grid with every visible slot
special and both default technologies, hyperdrive range 210.0, warp efficiency
0.7, fleet coordination 27.1. **The class, both grids and the special slots
survived an ordinary save, exit and reload.** Only the first three technology
rows are visible in the screenshot; the lower rows were not re-inspected.

### Model, model seed and home seed per request (built, not yet run)

Offline reading of the 180836 handler, setup and reward-acceptance block:

- Purchase setup receives the model seed pair as argument 2 and the scene
  filename as argument 3 (the handler passes payload `+0x1e8` and the string
  pointer at payload `+0x1c8`, or an empty string). Setup copies the seed to
  item `+0x10` and loads the resource from that filename.
- At reward acceptance (`8ee5fe` onward) the ownership resource filename and
  seed are taken from that resource, and the home seed is written by the
  three-instruction setter `546d40` (ownership `+0x2b0`) from the **current
  solar system** (`+0x2480` of the object at `+0x25e020`), call site `8ee730`.
  The setter has exactly one other direct caller, `8ee49f`, in the NPC branch.
- Shipped scenes in the 180383 corpus: `FREIGHTER_PROC`, `FREIGHTERSMALL_PROC`,
  `FREIGHTERTINY_PROC`, `CAPITALFREIGHTER_PROC` and `PIRATEFREIGHTER` under
  `MODELS/COMMON/SPACECRAFT/INDUSTRIAL/`.

Profile additions:

- `model` event: the worker reads
  `native-freighter-request-180836-<PID>.txt` (lines `scene=`, `model_seed=0x`,
  `home_seed=0x`), accepts only an upper-case `MODELS/...SCENE.MBIN` path and
  hexadecimal seeds of at most 16 digits, and arms one request. For the next
  kind-3 setup it substitutes arguments 2 and 3. If a home seed was given, a
  detour on `546d40` replaces the source pointer for the single call returning
  to `8ee735`.
- Dispatch may now be requested again after the previous call **returned**
  (state 3); a call that never returned (state 2) still blocks the process.
  This follows the user's requirement of several requests per session and
  keeps the rule against repeating an uncertain outcome.

Fixture: all earlier checks, four rejected request files, argument
substitution only for the armed freighter setup, home seed replaced only for
the acceptance stand-in and only once, second dispatch after a returned first.
A fixture failure was again a test artifact (two adjacent stand-ins inside the
accepted caller range). Fixture DLL SHA-256
`b6912adae68d0ffb416f71e87f399f057b196757d98763c11ec687a018dc0955`; production
DLL SHA-256 `f36ba9d65f97c82477b5daa043f8dd76ee8acbdecba23d459d65c30ff254adf0`
(`native-builds\freighter-model-180836-20261006`). **Not run in the game.**
Unknowns: whether the pirate scene loads through this path, whether its
palette follows the home seed, what the offer installs as technologies (still
the test reward's hyperdrive and teleporter, not a natural pirate loadout).

### Special (supercharged) slots: recovered rule and additions

Offline, bounded disassembly of build 180383 `4d22c0` (180836 `4d2350`), the
routine purchase setup calls for every store right after layout:

- The special-slot vector is at store `+0xc0` (capacity, count, data pointer);
  an element is twelve bytes: x, y and a type, where type 4 is the technology
  bonus used here. The public pinned header names this member `maSpecialSlots`.
- It acts only for inventory types 1, 3, 5, 8, 11. The wanted number is the
  size-type entry's `MaxNumSpecialTechSlots` (`+0x3c`), limited to
  **class + 1** except for type 1, minus existing type-4 entries. Coordinates
  are drawn from the store seed within `SpecialTechSlotMaxIndex` (`+0x30`,
  `+0x34`) and duplicates are redrawn.
- During purchase setup the class is still 0, hence exactly one special slot in
  both live offers. A native S freighter would get four. "All technology slots
  supercharged" therefore exceeds what the game generates.
- In the acceptance block (180836 `8ee246..8ee2ca`) the owned type-8 store is
  overwritten by the native store copy only when the item's NPC handle
  resolves; afterwards the same routine runs on the owned store with the
  purchase seed.

Profile additions (same source file), each a one-shot armed request:

- `super`: after setup, every valid technology slot of the offer that has no
  type-4 entry gets one, appended in place when capacity allows and otherwise
  through the game's vector growth helper (`2bf95c0`) with the argument list
  of the native append sites; it stops at the first append whose count does
  not advance by one.
- `techrows`: for the technology layout call of the armed setup only, the
  large technology height bound of the size-type entry is changed from 6 to 12
  and restored when the call returns, and the count becomes 120. It is skipped
  and counted as `table_rejected` unless the entry holds exactly 10 x 6.
- Acceptance carry: when an armed setup changed the offer, a detour on the
  special-slot routine copies the offer's technology store into the owned
  store with the native store copy, only for a call that returns to the exact
  acceptance address, with inventory type 8 and the same seed as the armed
  offer; one time. This reproduces the NPC-purchase branch with the offer as
  source. A later freighter setup or the end of the window cancels it.

Fixture: all previous checks plus 120 appended entries with the exact growth
arguments, last entry at (9, 11), no copy for a foreign caller or a different
seed, exactly one copy for the acceptance stand-in. One fixture failure was a
test defect: the compiler dropped unused arguments at a same-file call site, so
the stand-in did not pass type 8 until it was made to record its arguments.
Fixture DLL SHA-256 `ddbf4b134cdb9fd481845ca8960f8df6bae65ed3c2aa84e6b29024d4333bd00b`;
production DLL SHA-256 `ec4da1c76b313ab860b76fdcc40438b2d7a233fd167ede758a8e3eb3f652681c`
(`native-builds\freighter-class-super-180836-20261006`). **None of these three
additions has run in the game.** Known risks: the growth helper is called by
our code for the first time; a 10 x 12 technology grid and 60 to 120 special
slots are outside native generation; the carry replaces the owned technology
store contents with the offer's.

### Slot grids: recovered rule and first override (2026-10-06)

Offline, build 180383 export `4cd270` and bounded disassembly of its helpers
`4ce530`/`4ce630` (relocated on 180836 to `4cd300`, `4ce5c0`, `4ce6c0`):

- The first sixteen 64-bit words of a store are the valid-slot rows (one word
  per row); width, height and the slot count are 16-bit values at `+0x80`,
  `+0x82`, `+0x84`; the requested count is also kept at `+0xf4`.
- With stack argument 9 equal to zero the initializer first draws a count from
  the size-type generation entry (technology range for inventory types 1, 3,
  5, 8, 11; cargo range for types 6 and 9; main range otherwise). With argument
  9 nonzero it uses the caller's slot count. Purchase setup passes nonzero only
  for the first store and only when the reward sets `UseOverrideSizeType`.
- `4ce630` then picks the smallest of the entry's three bounds (small,
  standard, large; technology bounds for the type set above) whose area holds
  that count, and the final count is capped by width times height.
- For `FreighterLarge` in the 180383 table the large bounds are 10 x 12 (main)
  and 10 x 6 (technology): **120 and 60** are the largest grids the native
  layout can produce. The observed 19/19 offer used the small 7-wide bounds.
- In the acceptance block of `8e8830` the player's type-8 (technology) store is
  copied from an NPC object's store only if the item's handle resolves; for a
  reward offer it does not, so the offered technology grid is **not expected to
  transfer**. This matches the 2026-09-24 note that an accepted C/120 offer
  left the owned technology store at 13 valid slots. Owned technology slots
  therefore need a separate, not yet researched native operation.

Profile addition (same source file): the `slots` event arms one request. For
the next kind-3 setup on that thread, a detour on the layout initializer
changes only the slot count and argument 9 for the item's main store (120)
and technology store (60); everything else, including the third store, stays
native. The resulting width, height and count are recorded in the log
(`main_grid`, `technology_grid`). Fixture checks passed: scope limited to the
armed setup, direct layout calls and non-freighter setups untouched, one-shot
consumption, third store native. Fixture DLL SHA-256
`01261d8ca4aad6f7b142fa1967c3264705d25a45dd02f4f7ff2a67de97baf816`.
An earlier fixture run failed at its first armed check because three separate
hook enables took longer than the fixture's 400 ms wait; the profile now
enables all hooks in one call and the fixture waits 900 ms. Production DLL
SHA-256 `2e4403736cef5bed030fa082eba0fd077fac32ce7afdb61a0d635c6b140bc94c`
(`native-buildsreighter-class-slots-180836-20261006`). Live result: see the second live result above.

### Native generation ranges per size type (build 180383 table)

From `GenerationDataPerSizeType` of the converted inventory table (SHA-256
`2b6cb078...3dee25`), in table order, which is the size-type index the code
multiplies by `0x54`. "Slots" is the main inventory range, "Tech" the
technology range. All ship and freighter rows share main bounds up to 10 x 12
and technology bounds up to 10 x 6 with at most four special technology slots;
multitool bounds end at 10 x 6.

| Index | Size type | Slots | Tech |
| --- | --- | --- | --- |
| 0-2 | Sci Small / Medium / Large (explorer) | 24-29 / 24-32 / 30-38 | 14-19 / 19-24 / 24-30 |
| 3-5 | Fgt Small / Medium / Large (fighter) | 24-28 / 24-32 / 30-38 | 14-19 / 14-24 / 19-30 |
| 6-8 | Shu Small, Sht Medium / Large (shuttle) | 24-32 / 28-36 / 32-42 | 12-19 / 18-26 / 18-28 |
| 9-11 | Drp Small / Medium / Large (hauler) | 30-36 / 36-40 / 40-48 | 12-18 / 18-24 / 20-30 |
| 12-14 | Roy Small / Medium / Large (exotic) | 24-30 / 24-30 / 24-32 | 14-19 / 20-28 / 26-30 |
| 15-17 | Alien (living) | 36 | 30 |
| 18-20 | Sail Small / Medium / Large (solar) | 24-30 / 24-32 / 30-36 | 13-18 / 14-22 / 20-30 |
| 21-23 | Robot (sentinel) | 32-40 | 22-28 |
| 24-26 | Weapon Small / Medium / Large | 9-18 / 13-20 / 17-30 | same as slots |
| 27-29 | Freighter Small / Medium / Large | 15-19 / 24-34 / 35-48 | 8-12 / 12-20 / 18-30 |
| 43 | Corvette | 40-48 | 20-30 |

Correction to earlier text in this note: when the reward does not override the
size type, purchase setup uses index `0x1c` (28) for item kind 3, which is
**FreighterMedium**, not FreighterLarge. The bounds used by the slot override
are identical for the three freighter size types, so the live results are
unaffected; only the name was wrong. The class argument derived from a size
type by `4d47f0` is listed in [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md).

### Requested delivery defaults (user, 2026-10-06)

Deliveries should default to the requested class (S unless chosen otherwise),
every cargo and technology slot unlocked, and **every technology slot
supercharged**, for ships, freighters, multitools and the player's own
inventory. Supercharged slots are a separate store field and have not been
researched in this note: purchase setup never calls the helpers that the
ordinary inventory wrapper `4ccfa0` uses after layout (`4ce460`, `4cef50`), and
the inventory table declares a maximum of four special technology slots per
size type. Treat "all supercharged" as an explicit non-vanilla target that
needs its own static research and live validation.

### Live validation procedure (executed once on 2026-10-06; see the result above)

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

### One wrapper, one seed: natural generation order (2026-10-07, offline)

Read from the disassembly of `4ccfa0` (build 180383) and a scan of every
direct call site in the code section:

- The technology routine `4cef50` has exactly **one** direct caller, inside
  `4ccfa0` (`4cd043`). The three earlier "natural callers" are callers of the
  wrapper. The base-stat routine `4cea20` is reached from the wrapper by a
  tail jump and directly from the purchase setup `8e3a10` (eleven sites), the
  reward path `f3c8b0`/`f3d070` and `17519a0`.
- `4ccfa0(store, inventory type, seed, ?, size type, weapon class, ...,
  requested class at the ninth position, tenth argument)` runs, in order and
  each restarting from **the same seed**: the class draw `4cfd10` (only when
  the requested class is 4), the layout `4ce460(store, type, seed, size
  type)`, then `class argument = 4d47f0(size type)`, the technology routine
  `4cef50(store, type, seed, class argument, weapon class, tenth argument)`,
  a type-specific step (`4ce710` for type 7; for type 8 a mode-dependent
  extra element), and finally base stats `4cea20(store, type, seed, class
  stored at +0x100, class argument, weapon class, ..., minimum flag 0)`.
- So for one inventory the natural class, slots, technologies and base stats
  are all functions of one seed plus the size type, the weapon class and the
  solar-system wealth row. The technology routine's "size argument" is the
  weapon class: value 9, which forces five to nine picks, is the staff.
- The wrapper has two thin callers that derive the remaining arguments from
  the size type: `4cced0` (weapon class from `4d5690(size type)`) and
  `4cd160` (through `4dfcd0` and `4e02c0`). Their own callers (purchase setup
  sites near `8e59..8e79`, `55a498`, `4c20d9`, `1713xxx`, `1751cf6`) decide
  which seed and size type reach them; those sites were listed, not read.

Read on 2026-10-07 for the purchase-setup family (bounded disassembly of
`8e5710`, `8e6590` and `8e6880`): in each, the seed pointer handed to the
wrapper is the setup function's own second argument, unchanged — the same
seed the function stores as the item seed.

| Setup function | Stores generated | Seed | Requested class |
| --- | --- | --- | --- |
| `8e5710` | item `+0x980`, inventory type 3 (multitool), size type from item `+8` | second argument | constant 4 (always the natural draw) |
| `8e6590` | item `+0x980`, type 3 | second argument | caller's stack argument |
| `8e6880` | item `+0x980` (type 4 or a caller value) and item `+0xe10` (type 5, technology) | second argument, for both stores | caller's stack argument |

So for an offered ship or multitool, class, slots, installed technologies and
base stats all derive from the entity seed, together with the size type, the
weapon class and the solar-system wealth row. This is the argument the
delivery profile replaces with the requested model seed. The remaining call
sites (`55a498`, `8e79a3`, `4c20d9`, `1712f50`, `17519a0`, `572c40`) were not
read; `8e3a10` (the reward setup used for freighters) calls the base-stat
routine directly and passes class 0, as recorded above.

Not established: the unread call sites and the build 180836 equivalents.

### Natural slot count and grid ported (2026-10-07, offline)

The layout step `4ce460(store, inventory type, seed, size type)` takes the
size type's 0x54-byte generation entry (inventory table start + `5e0`, one per
size type) and calls two small routines:

- `4ce530`: one draw of the store seed scaled into an inclusive range and
  stored as the slot count. Technology grids (inventory types 1, 3, 5, 8, 11)
  use the fields at `+0x50`..`+0x44`; types 6 and 9 use `+0x48`..`+0x38`;
  every other type uses `+0x4c`..`+0x40` (minimum..maximum).
- `4ce630`: chooses width and height from the entry's bounds block
  (technology grids use the block at `+0x18`, others the block at `+0`):
  the smallest of three sizes whose width x height holds the count.

`runtime/research/evaluate-inventory-layout.py` ports both and, with the
emulator folders, compares them with the original instructions: **121,836
cases, 0 differences** (44 size types, 13 inventory types, 210 seeds plus
disabled-seed variants). Which individual grid positions are valid (routine
`4cfe20`, 479 instructions) is not ported. `evaluate-seed-profile.py` now
uses this draw when `--slots` is omitted; example: fighter `FgtMedium`, seed
`0xA547AB958C97E439` — main store 25 slots in a 7x5 grid, technology store
16 slots in a 7x3 grid with `SHIPJUMP1`, `LAUNCHER`, `HYPERDRIVE`,
`SHIPSHIELD`, `SHIPGUN1` and one generated shield upgrade.

### Build 180836: same code, same data (2026-10-07, offline)

- **Code.** `runtime/research/compare-native-routines.py` compares whole
  routines between the two executables after masking relocated operands and
  cutting jump-table data. 28 routines, 11,329 instructions, **all identical**:
  class draw, generation wrapper, layout, slot count, grid, valid positions,
  special slots, base-stat row and generator, technology selection and
  filter, size-type mapping, procedural instance ID and statistics, the ship,
  weird-ship, robot-ship, weapon, place and both fleet-code name routines,
  the word generator and its two fix-up routines, the base palette generator,
  descriptor recursion and chooser, and the texture option selector.
  Addresses were found with `relocate-native-signatures.py` (unique matches,
  except the stream-state initializer with two candidates).
- **Data.** `runtime/research/compare-installed-data.py` reads members
  directly from the installed archives and compares their SHA-256 with the
  corpus index: 8,289 members — everything under `metadata/reality`, the
  palette folder, English and Brazilian Portuguese language files, spacecraft
  and weapon descriptors, texture lists and materials — **all identical, none
  changed**. A second run over every spacecraft and weapon scene and geometry
  member (4,558 members, 1.78 GB read) is also identical throughout.
- **Names.** The name emulator accepts `--build 180836`; 54 names (ship types
  0, 7 and 9, weapon classes 0, 7 and 9, fleet code) are the same from both
  executables.

So the ports and emulations checked on build 180383 apply to the installed
build 180836 for these routines and these files. Runtime addresses still have
to come from the relocation table, and a later game update needs the two
comparison tools run again.

### Combined seed profile tool (2026-10-07, offline)

`runtime/research/evaluate-seed-profile.py` applies the ports in the wrapper's
order for one entity seed and prints the natural class (or a requested one),
the installed technologies and the base stats. It decodes the size-type jump
table of `4d47f0` from the pinned executable and prints it: Sci 3, Fgt 2,
Shu/Sht 4, Drp 1, Roy 6, Alien 7, Sail 8, Robot 9, Freighter 0, Corvette 10,
every other size type 12 (multitools, vehicles, chests, suit).

Example outputs (wealth row 2, natural class): fighter main store, seed
`0xA547AB958C97E439` — class C, `SHIP_DAMAGE` 9.48, `SHIP_AGILE` 10.12; seed
`0x7` — class B, `SHIP_DAMAGE` 33.95, `SHIP_SHIELD` 9.06, `SHIP_AGILE` 19.97;
rifle (`WeaponMedium`, weapon class 1, 24 slots), seed `0x178B99DB843CB6E0` —
class C, technologies `SCAN1`, `SCANBINOC1`, `LASER`, `BOLT`. These are
outputs of compared ports under stated inputs, not observations of the game.

Inputs the tool cannot derive: the wealth row of the solar system, the weapon
class, progress and known technologies. Names come from `emulate-name-generation.py`.

### Base-stat generation ported (2026-10-06, offline)

`4cea20(store, inventory type, seed, class, ship class, weapon class, ?, minimum flag)`
writes the base statistics of a store (vector at `+0xd0`, 0x18-byte elements:
16-byte stat ID and a float).

- Row selection `4ce9b0`: the table at `manager+0x218` (start of the loaded
  inventory table) holds 23 rows of four `{pointer, count}` cells, one cell per
  class C, B, A, S. Inventory types 4 to 9 use the ship-class argument as row
  (12 means none); type 3 uses weapon class + 12 (10 means none); types 10 and
  11 use row 22; every other type generates nothing and leaves the store
  untouched. Row order read from the data: Freighter, Dropship, Fighter,
  Scientific, Shuttle, PlayerFreighter, Royal, Alien, Sail, Robot, Corvette,
  one unused row, then Pistol, Rifle, Pristine, Alien, Royal, Robot, Atlas,
  AtlasYellow, AtlasBlue, Staff, then the vehicle row.
- Values: the stream starts from the store seed; each entry of the cell takes
  one draw and stores `unit(draw) * (max - min) + min` (float32 steps in that
  order). The minimum flag stores `min` instead; the draw still advances.
- Each 0x20-byte entry holds the ID then `Max`, `MaxFixedAdd`, `Min`,
  `MinFixedAdd`. A runtime byte (RVA `525d35b`) selects the `Max`/`Min` pair
  when set and the `FixedAdd` pair when clear. The `FixedAdd` values are zero
  in every entry of the 180383 table, so the set state is assumed to be the
  normal one; the byte's meaning and its writer were not found in code (it is
  only read, so it is probably loaded with a settings block).
- Example ranges (S class): fighter `SHIP_DAMAGE` 70..90, `SHIP_SHIELD`
  24..38, `SHIP_AGILE` 35..45; hauler `SHIP_SHIELD` 95..125; scientific
  `SHIP_HYPERDRIVE` 90..120; freighter `FREI_HYPERDRIVE` 60..80, `FREI_FLEET`
  40..60; rifle `WEAPON_DAMAGE` 15..20; pristine and royal `WEAPON_SCAN`
  100..100. Alien ships have only an S cell; the player-freighter row is empty.

`runtime/research/evaluate-base-stats.py` is the port;
`emulate-base-stats.py` runs `4ce9b0..4cec9f` under Unicorn on the original
table bytes and compares float bit patterns: **71,264 cases, 0 differences**
(every row, four classes, 512 seeds, plus disabled-seed, alternate-pair and
minimum-flag variants). A first run reported 10,480 differences; all were the
"no row" case, where the routine returns before resetting a stale element
count that the harness had planted. The harness now expects the untouched
store. Report: `E:\NMS-Courier-Research\seed-analysis-180383\base-stats-port-20261006b.json`.
Table SHA-256: `ccb6e6858a7df981b198fb020a539be364446c703bf741ccc7ee5da88458240d`.

Not established: which seed, class and class rows each natural caller passes
(the delivery profile calls this routine natively with the stored class); how
the stored value becomes the bonus shown in the interface; build 180836
values.

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
  --tools "$cx\native" --seeds runtime/research/class-generation-180383.md `
  --output E:\NMS-Courier-Research\acquisition-180383 `
  --project-name Acquisition180383 --stage classgenerationNEW --timeout 600
```

The executable recovery itself is one read-only headless run of
`ExportOriginalExecutable.java` with the output path and expected SHA-256 as
script arguments; it refuses to overwrite and deletes a mismatching output.
