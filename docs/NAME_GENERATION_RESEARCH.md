# Name generation for ships, multitools and freighters

Checkpoint: 2026-10-07, offline, build 180383 executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Status: **original routines run under emulation; two results agree with
names known from the game**. Not a Python port, not runtime verified on build
180836. Return to [the category ledger](SEED_CATEGORY_LEDGER.md).

## Routines

Located through code references to the `NAMEGEN_*` language IDs; decompiled
with the offline Ghidra stage (selection file
`runtime/research/name-generation-180383.tsv`, stages
`namegeneration20261007`, `nameword20261007`, `namefrigate20261007`).

| RVA | Arguments as read | Produces |
| --- | --- | --- |
| `e8ce30` | generator, seed, output, optional second output, ship type | Ship names; type 7 forwards to `e8bd10` (the `NAMEGEN_WEIRDSHIP_FORMAT` strings), type 9 to `e8c380` (`NAMEGEN_ROBOTSHIP_*`) |
| `e8ebf0` | generator, seed, weapon class, output, extra | Multitool names; class 9 (staff) uses `NAMEGEN_STAFF_*` |
| `e8da90` | generator, seed, output, optional second output | Code-and-number names with `NAMEGEN_FRIGATE_CODE_*` (matches the user's freighter, below) |
| `e8e150` | generator, seed, output, optional second output | A second code routine that can also use ship adjective and noun strings |
| `e85aa0` | generator, name type, seed, output, optional second output | Many place and object names; holds the `FREIGHTER_NAME_*` formats (wrecks and similar) |
| `e7f860` | generator+0xc0, stream state, three integers (alphabet, minimum, maximum length), output | The procedural word |

## What the ship routine does

1. The seed is mixed before use: `h = (s >> 33 ^ s) * 0x64dd81482cbd31d7;
   h = (h >> 33 ^ h) * 0xe36aa5c613612997; k = h >> 33 ^ h`, then the usual
   stream state is built from `k`.
2. Draws, in order: noun index 1..48, verb 1..36, possession 1..32, property
   1..36, adjective 1..48, a numeral 2..19 written in Roman digits, three
   draws for the ship code (`%c%c%d`: two letters A..Z and a digit 1..9; the
   draws are consumed digit first, then second letter, then first letter).
3. The procedural word (`e7f860`, alphabet 5, length 5..8), first letter
   upper-cased.
4. One draw for the format 1..15 (`NAMEGEN_SHIP_FORMAT_n`), whose `%NOUN%`,
   `%PROPERTY%`, `%VERB%`, `%ADJECTIVE%`, `%PROCNAME%`, `%SHIPCODE%`,
   `%NUMERAL%` and `%POSSESSION%` markers are replaced.

Every component is drawn whether or not the chosen format uses it.

## The procedural word

`e7f860` is a letter-chain generator compiled into the executable: eight
alphabets, each with a table of three-letter openings in `.rdata` (5,996,
3,597, 3,022, 1,994, 1,996, 747, 3,840 and 3,234 entries as multipliers of the
first draw) and its own next-letter routine, plus rules that insert a vowel
into unpronounceable openings and endings and two final passes (`e803e0`,
`e81760`). It was not ported: the transition routines are code, not data.
Emulating the original instructions is exact by construction and is what the
tool below does.

## Tool and results

`runtime/research/emulate-name-generation.py` maps the whole executable into
Unicorn 2.1.4, points every import slot at a private stand-in (memory and
string routines and the two formatted-print imports are answered in Python),
replaces the language lookup with English strings read from the corpus
language files, and calls the routine. Kinds: `ship`, `weapon`, `code-a`
(`e8da90`), `code-b` (`e8e150`), `place` (`e85aa0`).

| Routine and input | Emulated name | Known from the game |
| --- | --- | --- |
| ship, type 0, `0xA547AB958C97E439` | `Radiant Pillar BC1` | The widely published starter ship of that seed is the Radiant Pillar BC1 |
| code-a, `0x8C968767B3282F13` | `CV-5 Hayasenn` | The user's delivered pirate freighter with that model seed was shown in game as `Hayasenn CV-5` (build 180836, 2026-10-06) |
| ship, type 0, `0x7` | `Endai's Indiscretion CB5` | not compared |
| ship, type 7, `0x7` / `0x1` | `The Screaming Oevuiutsia` / `Yasnoa OU6` | not compared |
| ship, type 9, `0x7` / `0x1` | Greek-suffix forms from the robot format strings | not compared |
| weapon, classes 0..6, `0x7` | `Vosoko's Neutron Compressor` | not compared |
| weapon, class 9, `0x7` | Greek-prefix staff form with `Vosoko` | not compared |

The second row matches in all three components (code `CV`, number 5, word
`Hayasenn`); the word order depends on the language. `e8da90` uses the fixed
format `FRIGATE_NAME_FORMAT_1`, which is `%CODE%-%NUMBER% %PROCNAME%` in
English and `%PROCNAME% %CODE%-%NUMBER%` in Brazilian Portuguese. With
`--language brazilianportuguese` the emulator prints **`Hayasenn CV-5`**,
exactly the name the user saw. The freighter name therefore comes from
`e8da90` with the **model seed**, not the home system seed (which gives
`EV-5 Apporozawa`). In Brazilian Portuguese the ship seed
`0xA547AB958C97E439` gives `Radiante Pilar BC1`.

Build 180836: the emulator's `--build 180836` profile runs the relocated
routines of the installed executable; 54 names over ship, weapon and
fleet-code routines equal the 180383 results, the routines compare identical
instruction by instruction, and the language files are byte-identical (see
[the build comparison](INVENTORY_CLASS_RESEARCH.md#build-180836-same-code-same-data-2026-10-07-offline)).

Reports (disposable): `E:/NMS-Courier-Research/seed-analysis-180383/names-20261007`.

## Not established

- Which type or class value each natural caller passes (ship types other
  than 0, 7 and 9 gave the same name for seed `0x7`, so the routine only
  distinguishes those two), and the callers themselves.
- Languages other than English and Brazilian Portuguese were not run.
- A data-only port of the word generator.

## Reproduction

```powershell
$py = "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe"
$cx = "$env:LOCALAPPDATA\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\NMSCourier\research-tools"
& $py runtime/research/emulate-name-generation.py `
  --executable E:/NMS-Courier-Executables/180383/NMS.exe --corpus E:/NMS-Courier-Research/corpus `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$cx\unicorn-2.1.4" --kind ship --type 0 --seed 0xA547AB958C97E439 `
  --output E:/NMS-Courier-Research/seed-analysis-180383/names-NEW.json
```
