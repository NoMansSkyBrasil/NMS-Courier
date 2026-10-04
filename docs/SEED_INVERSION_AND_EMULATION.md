# Seed arithmetic inversion and instruction emulation

Updated: 2026-10-04. Offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Read [the handoff](SEED_RESEARCH_HANDOFF.md),
[the shared algorithm](PROCEDURAL_SEED_RESEARCH.md) and
[entity input propagation](ENTITY_APPEARANCE_SEED_FLOW.md) first.

This pass adds two independent comparisons and an exact, narrowly scoped inverse.
It does **not** solve selected pieces/colors to a whole entity seed. No game
process, delivery, save, installed bridge or mod was used. Seeds in the probes
are synthetic arithmetic fixtures, not observed game outputs.

## Alternative method: execute the arithmetic in an emulator

[Unicorn's documented API](https://www.unicorn-engine.org/docs/tutorial.html)
maps private memory and registers and emulates instructions. The probe uses
Unicorn 2.1.4 in a private research-tools directory and Capstone 5.0.5, rather
than loading the executable as a Windows program or invoking game functions.

[emulate-seed-windows.py](../runtime/research/emulate-seed-windows.py) reads the
hash-pinned PE and decodes these fixed, straight-line windows:

| Operation | Start / exclusive stop RVA | Instructions | Code SHA-256 |
| --- | --- | --- | --- |
| Enabled initializer | `2d63c22` / `2d63c4a` | 13 | `9b709be6ec2457f1881a93b14f9ec6885ac2442bf16072dfaa897c257d825e39` |
| MWC draw and multiply-high choice | `2d67c4f` / `2d67c7d` | 12 | `8485f32d61d04c9d4aa34ec3702655e41ba740825a952f8bf9d9f85b0c1b56d7` |
| Two draws and child mixer | `2d63f70` / `2d63ff8` | 33 | `5ae039054d45df5bc06b83e3715af93b3b63f5c72e2d0ab113986f5069214021` |

Earlier notation named the final arithmetic instruction's address rather than
an exclusive byte boundary. The probe includes the initializer carry store at
`2d63c46`, the draw carry store at `2d67c79`, and the final XOR and child store
at `2d63ff1`/`2d63ff4`; stopping before these stores would be incomplete.

Each invocation maps one 4-KiB read/execute code page, one 4-KiB read/write seed
page and one 4-KiB read/write stack page. It permits only the reviewed arithmetic,
register and memory instructions, with no calls, branches, imports or system
calls. Execution has a 64-instruction and 10,000-microsecond limit and must reach
the exact stop address. Unknown fingerprints and existing output files reject.
The RIP-relative LEA in the child window computes an unused synthetic address;
it does not read a game asset or emulate resource resolution.

520 inputs comprise eight edge/example seeds and 512 deterministic random
uint64 seeds. Each tests initialization, four draw weights (1, 20, 21, 81920),
and child derivation: **3,120 forward comparisons, zero mismatches**. This verifies
the isolated formulas against actual instruction bytes, including wraparound,
zero-low handling and high-word updates. It does not verify caller register
origins, enabled/disabled branch selection, descriptor filtering or rendering.

Report: external `seed-analysis-180383/seed-window-emulation-20261004.json`.

## Exact inverse of the isolated child branch

[invert-child-seed.py](../runtime/research/invert-child-seed.py) accepts a target
child seed and enumerates every enabled initializer seed that generates it
**when this child branch occurs immediately after initialization**. It does not
assume that real descriptor recursion has that schedule. The CLI does no file,
process, asset or network access; imported helpers are repository-local.

Let `M = 0x5A76F899`, `B32 = 2^32`, and `B64 = 2^64`. For each MWC draw:

```text
p = low * M + carry
next_low = p mod B32
next_carry = floor(p / B32)
draw = next_low
```

The child branch concatenates the first two draws `a,b` into `v = (b << 32) | a`,
then applies:

```text
v = ((v xor (v >> 33)) * 0x64DD81482CBD31D7) mod B64
v = ((v xor (v >> 33)) * 0xE36AA5C613612997) mod B64
child = v xor (v >> 33)
```

Both multipliers are odd and therefore invertible modulo `B64`:

```text
inverse(0x64DD81482CBD31D7) = 0xFAA6B01EC53551E7
inverse(0xE36AA5C613612997) = 0x9BB5680ABE73E627
```

The 33-bit XOR shift is self-inverse on uint64 because shifting twice discards
all bits (`66 >= 64`). Undo the final XOR, multiply by the second inverse, undo
the next XOR, multiply by the first inverse, then undo the first XOR. This
recovers **exactly one concatenated pair of draw words**. It does not necessarily
recover one initializer seed or even a reachable initializer pair.

Recover the carry after the first draw and its packed state:

```text
c1 = (b - a * M) mod B32
p1 = (c1 << 32) | a
```

All normalized initial low words `L` and initial carries `C` must satisfy:

```text
p1 = L * M + C
1 <= L <= B32 - 1
0 <= C <= B32 - 1

L_min = max(1, ceil((p1 - (B32 - 1)) / M))
L_max = min(B32 - 1, floor(p1 / M))
C = p1 - L * M
```

There are at most three integer low-word candidates. For `L=1`, the original
seed low word may be either 0 or 1 because initialization substitutes 1 for 0.
For each original low word `l`, recover the original seed high word:

```text
h = C xor ror32(l,16) xor l
seed = (h << 32) | l
```

This creates at most four original-seed candidates. The implementation checks
every candidate through the forward arithmetic before returning it. An empty
interval means the target child has no preimage in this initializer/branch.
The disabled initializer is reported separately as a boolean match, not as one
specific numeric input seed: disabled input ignores that number.

**Do not restrict initial carry to `< M`.** That is a steady-state MWC bound,
whereas the seed initializer's XOR can produce any uint32. Its first updated
carry can equal `M` at the upper boundary. Quotient/remainder inversion with a
steady-state assumption silently loses valid original seeds.

Examples (isolated arithmetic only):

- Target child `0xF414C01605617978` has enabled preimages `0x0` and
  `0x0001000100000001`, both initializing `(1,0)`; disabled initialization matches.
- Target child `0x1F35A015E8BE20A0` has three enabled preimages, including the
  user's requested model seed `0x0001AD0003900054`. The other two are
  `0xBB719C3403900052` and `0x5DFFA49E03900053`.
  This does **not** establish that those three seeds produce identical ships
  or freighters: only this one child branch agrees.
- Child zero reverses to draw pair `(0,0)` but has no enabled initialized-seed
  preimage; arbitrary RNG state `(0,0)` is outside this initializer's range.

Across the 520 emulator inputs, candidate counts were: one preimage in one case,
two in 70 cases, three in 448 cases and four in one case. All **1,489 returned
candidates** were initialized and evaluated using the original x64 instruction
windows, reproducing their target child with **zero mismatches**. These counts
describe this fixture set, not the distribution across all uint64 seeds.
Five parser/reachability/ambiguity tests additionally passed; they are not game
appearance acceptance tests.

## Public implementation cross-check

The public [hadsh/nms_namegen source](https://github.com/hadsh/nms_namegen/tree/52ad48affaa4089c8f487a470a888dc9b7a650aa)
was found through [NMS Galactic Map's core documentation](https://github.com/elegra1965-source/nms-galactic-map/tree/main/nms-core).
The public source supplies a useful independent research lead, not a current
entity appearance oracle. No public-source accuracy percentage was adopted.

Pinned commit: `52ad48affaa4089c8f487a470a888dc9b7a650aa`.

| Reviewed file | SHA-256 | Role / boundary |
| --- | --- | --- |
| `nms_namegen/prng.py` | `fce048f001949fc196765523f8127a3ed5d93c1a5d99f24f8c56826aeadacb93` | Same MWC multiplier; its constructor accepts an already packed RNG state, not a resource seed initializer. |
| `nms_namegen/system.py` | `9b2c4ea245a26bc8f7a7c7c936b3c917dd8bab38e3dc235fabcee26dd9556e70` | `_bodySeed` uses the same two draws and child mixer. Planet draw schedules and system attributes were not validated here. |
| `nms_namegen/iprng.py` | `9d858e45072f0ab844bed6b662109f7cd2e19bb2715131fdcb6bed2a6a1ed065` | Different universal-address hash with rotations, additions and constant `0x1BD11BDAA9FC1A22`; a lead for location-derived seeds, not geometry/color decoding. |

[compare-public-child-mixer.py](../runtime/research/compare-public-child-mixer.py)
requires these hashes and 64-KiB per-file budgets. It compiles only the reviewed
PRNG class and `_bodySeed` function through AST selection, bypassing module
imports and other top-level code. It initializes the public PRNG with the
packed state from Courier's initializer, then compares both the child and final
state over 1,027 deterministic inputs: zero mismatches.

This corroborates shared arithmetic. It does not prove a common complete RNG
schedule, a resource seed-to-location mapping, galaxy attributes, procedural
names, NPC appearance, materials, or whole-model previews. The public PRNG
constructor must not replace the resource-seed initializer just because their
multipliers agree. Public source copies and instruction bytes remain external;
only original probes, source fingerprints and analysis are committed.

## Reproduction and continuation

Use the private approved Python runtime; `python` below denotes that executable.
Install no end-user dependency and change no global Python site-packages.

```powershell
python runtime/research/emulate-seed-windows.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\unicorn-2.1.4" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\seed-window-emulation-new.json
python runtime/research/invert-child-seed.py --child 0x1F35A015E8BE20A0
python runtime/research/compare-public-child-mixer.py `
  --reference E:\NMS-Courier-Research\seed-analysis-180383\namegen-reference-52ad48a `
  --output E:\NMS-Courier-Research\seed-analysis-180383\public-child-comparison-new.json
python -m unittest discover -s runtime/research -p test_child_seed_inverse.py
```

Recover the three public files from the pinned GitHub commit if the external
reference folder is unavailable; validate their hashes before compiling selected
definitions. The isolated Unicorn dependency was installed with
`pip install --only-binary=:all: --no-deps --target <private-folder> unicorn==2.1.4`.
This is a developer research tool, not a packaged application prerequisite.

Next, derive constraints from the real unfiltered/filtered descriptor schedule
and correlate material palette bindings. This inverse can constrain an exact
two-draw child step; it cannot bypass unknown preceding draws or supply missing
caller seeds. Keep world/address hashing separate until its current-build
native entry and salt/packing are independently recovered.
