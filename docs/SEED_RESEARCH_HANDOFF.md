# Procedural seed investigation: method and continuation checkpoint

Research checkpoint: 2026-10-03; handoff finalized: 2026-10-04.
The 2026-10-03 pause was lifted by the user on 2026-10-04. Offline algorithm
research resumed; see [the planet/fauna seed-flow continuation](PLANET_FAUNA_SEED_FLOW.md)
for named fields, planet child-stream order, resource seed overrides and evidence.
The original checkpoint below is retained as historical evidence.
Current scope: offline discovery and documentation across categories, not
features, tests, live hooks, delivery or save editing. The objective is to
understand which inputs/random streams choose resources, parts, colors,
textures, scale and other properties. Inverse search is a separate later problem.

## Read first

1. [Seed overview](SEED_ALGORITHM_EXPLAINED.md): category coverage and limits.
2. [Detailed research](PROCEDURAL_SEED_RESEARCH.md): existing PRNG, child mixing,
   descriptor and palette findings. Do not rediscover these from scratch.
3. [Experiment log](EXPERIMENT_LOG.md), [research pipeline](../runtime/research/README.md)
   and [navigation index](RESEARCH_INDEX.md): evidence and existing tools.
4. [Pi assessment](PI_PROCEDURAL_ITEM_RESEARCH.md): technology/product seed
   generation is distinct from visual resource generation.

We have recovered forward components, not the complete procedural algorithm.
The unresolved connection is which seed/state reaches each consumer, including
conditional draws and overrides. A model seed alone is not a spawn coordinate.

## Method used to identify the mechanism

### Follow existing data dependencies

Use `E:\NMS-Courier-Research\corpus\index.sqlite` in SQLite `mode=ro`.
Query exact `files.path`, or a narrow `LIKE` with `LIMIT`; select `archive`,
`content_hash` and `xml_path`. Preserve duplicate sources; do not infer archive
precedence. Read selected XML fields with ElementTree rather than dumping files.

```python
db = sqlite3.connect(index_path.as_uri() + '?mode=ro', uri=True)
rows = db.execute(
    'SELECT archive, content_hash, xml_path FROM files WHERE path = ?',
    ('models/planets/creatures/smallbird/bird.descriptor.mbin',),
).fetchall()
```

Trace environment/category tables -> resource -> ordered descriptor alternatives
and references -> scene/material -> texture layer/palette binding. A table is
declarative evidence, not proof of which seed selected a choice. Descriptor
weights, XML Chance and texture Probability are different mechanisms.
The corpus is already extracted: do not repeat extraction.

### Locate native candidates, then decompile bounded sets

Use the pinned local public reference:
`C:\Users\louan\AppData\Local\NMSCourier\research-references\NMS.py-52e2e554\data.json`
and adjacent `types.py`. The
[upstream database](https://github.com/monkeyman192/NMS.py/blob/52e2e55493ddade1d89d3e638491afff995f5631/tools/data.json)
provides candidate labels/signatures, not verified current-build ABIs.
Previously recorded database SHA-256:
`1acdf18b60e9d23fb7f75cc4e7eb27d11be8ed0daaf4ab06de6539ba4d074089`;
each scanner report records its actual input hash.

`scan-native-acquisition.py` accepts narrow `--function-term` filters, verifies
the executable SHA-256, records all matches and containing PE unwind ranges.
Unique signatures are leads, not confirmed semantic identities. Direct-call
counts cover only the first unwind fragment: GenerateCreatureRoles reported
zero there although its subsequently decompiled body contains calls.

`analyze-acquisition-offline.py` consumes a small TSV of selected RVAs and labels.
Reuse the existing `Acquisition180383` Ghidra project with a new stage name.
This wrapper uses `-noanalysis`, two logical CPUs, a 4 GiB Java heap, a 20 GiB
free-space reserve and an explicit timeout (180 seconds in this session).
It does not execute NMS. `ExportAcquisitionSeeds.java` exports pseudocode plus
per-function status; inspect both its manifest and the wrapper run report.
Keep proprietary pseudocode and assets outside Git.

### Check arithmetic separately from field names

`inspect-native-fragments.py` exports bounded instructions and literal windows
from the same fingerprint-pinned executable. Check integer width, signedness,
overflow, shifts, float32/double operations, branches and draw order. Ghidra
output is an interpretation, especially with type-propagation warnings.

Retain raw offsets until current metadata or independent evidence identifies
them. Copying a 16-byte pair does not prove it is a color seed. Type-name cross
references can lead to hashing/serialization rather than generation. Record
data declarations, native static behavior and live behavior separately; this
checkpoint adds only the first two. No tests were run under this request.

## Exact environment and completed stages

| Input | Value |
| --- | --- |
| Executable | `E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe`, offline build 180383 |
| SHA-256 | `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4` |
| Corpus | `E:\NMS-Courier-Research\corpus` |
| Native project | `E:\NMS-Courier-Research\acquisition-180383\projects\Acquisition180383.gpr` |
| Python | `C:\Users\louan\AppData\Local\Python\pythoncore-3.14-64\python.exe` |
| Analysis libraries | `C:\Users\louan\AppData\Local\NMSCourier\research-tools\python` |
| Native tools | `C:\Users\louan\AppData\Local\NMSCourier\research-tools\native` |
| Versions | Ghidra 12.1.4 PUBLIC; existing corpus conversion by MBINCompiler 7.04.1-pre3 |

Under `E:\NMS-Courier-Research\seed-analysis-180383\`:

- `fauna-generation-signatures/candidates.json` and `seeds.tsv`: four unique
  signature matches. TSV SHA-256
  `1fff922a0c709f0375adfe7b11fd4c485fe8c6b7d55b1844174f1eb64d140e38`.
- `fauna-metadata/candidates.json` and `payload-seeds.tsv`: nine references to
  the exact names GcCreatureRoleData, GcCreatureSpawnData and GcCreatureData.
  `selected-seeds.tsv` retains only `229a410`, `229c280`, `22f7d70`; SHA-256
  `3600b8232e86c14c978f79bde4f811bffe777c7d7912e0073e89d9fe537930bc`.
- `fauna-spawn-arithmetic.json`: 363 instructions, RVA `16a0a50` through unwind
  end `16a1121`, fragment SHA-256
  `02a484326e7453e0d4ca73dd57c27fff82d9e689f30af2e6c3a2f7913c11b6c2`,
  plus two constant windows.

Under `E:\NMS-Courier-Research\acquisition-180383\`:

- `faunageneration-export/`: four successful pseudocode exports and manifest;
  `run-faunageneration.json`: completed, exit 0, 53.1 seconds.
- `faunametadata-export/`: three successful exports and manifest;
  `run-faunametadata.json`: completed, exit 0, 25.0 seconds.

Both analysis workers completed before the pause. No analysis worker was left
running. These seven new exports are **not yet in the generated navigation
index**; use these paths until research resumes.

| RVA | Candidate label | Static observation |
| --- | --- | --- |
| `169d4e0` | GenerateCreatureRoles | MWC at generator-relative `+0xba4/+0xba8`, child mixing, nested random-state helpers, environment branches and call to `16970c0`. |
| `16970c0` | GenerateCreatureInfo | Initializes local RNG from role `+0x5b0`, enabled byte `+0x5b8`; also uses generator RNG elsewhere. Many outputs are description strings, not geometry. |
| `16a08b0` | GenerateCreatureSpawnData | Iterates role stride `0x5d8`, calls `16a0a50` for spawn stride `0x148`, then applies optional lookup substitutions. |
| `16a0a50` | FillCreatureSpawnDataFromDescription | Initializes the same role seed, samples bounded scale-like value, copies fields to spawn data and makes a second probabilistic choice. |
| `229a410` | cGcCreatureRoleData name reference | Beginning resembles structural hashing, including disabled-seed substitution; not a recovered appearance generator or field-name registration. |
| `229c280`, `22f7d70` | cGcCreatureSpawnData / cGcCreatureData name references | Exported but **not analyzed** when the user paused research. |

## Newly observed arithmetic

The Roles candidate repeats the known integer recurrence and child mixer:

```text
product = uint64(low) * 0x5A76F899 + carry
low = low32(product); carry = high32(product)

After two draws a,b:
x = (uint64(b) << 32) | a
x = (x XOR (x >> 33)) * 0x64DD81482CBD31D7  [uint64 wrap]
x = (x XOR (x >> 33)) * 0xE36AA5C613612997  [uint64 wrap]
child = x XOR (x >> 33)
```

Spawn initialization sets low to low32(seed), replacing zero with one; carry is
`ror32(low32(seed),16) XOR high32(seed) XOR low32(seed)`. A disabled seed uses
`(1,0)`. Shared arithmetic does not establish identical draw schedules.

Read-only literal inspection confirmed:

- RVA `4b251f8`: double `2.3283064370807974e-10`, corresponding to
  `1/4294967295`, **not** `1/4294967296`.
- RVA `4b25aa0`: float32 `0.25`.

The spawn candidate's first interpolation, without guessing field names:
`m = data.float(+0xa8)`, `M = min(data.float(+0xa4), runtime_global)`,
`a = role.int(+0x574)`, `b = role.int(+0x56c)`.
It forms `lo=m+a*0.25*(M-m)` and `hi=m+(b+1)*0.25*(M-m)`, interpolates with
the normalized first draw, bounds by m/M, and stores at spawn `+0x130/+0x134`.
The next draw is compared to data float `+0x94`, storing a boolean at `+0x144`.
Float32 rounding matters. This is descriptive algebra, not a tested substitute;
exact field meanings and the runtime cap remain unresolved.

## New concrete data chains

### Fauna

`CREATUREGENERATIONDATA.MBIN` declares biome/sub-biome and special-system
options, domain lists, life/density/rarity controls. Exact native precedence
is unfinished. `CREATUREGENERATIONARCHETYPES.MBIN` has 41 ground, 8 air,
18 water and 1 cave entries, including test-named entries.

Air DEFAULT points to `AIR/AIRTABLECOMMON.MBIN`: two Bird roles, both
Small-to-Small, groups 1–3, OnlyDay, enable probabilities 1.0 and 0.25.
These are eligibility probabilities, not descriptor weights.
`CREATUREFILENAMETABLE.MBIN` contains 89 entries; BIRD maps to
`MODELS/PLANETS/CREATURES/SMALLBIRD/BIRD.SCENE.MBIN`.

The bird descriptor has BAT -> `_HBAT_0/1`, BIRD -> `_HBACC_1..5`, six wing
alternatives, five tail alternatives and conditional wing/tail accessories.
`birdbodyhead.texture.mbin` binds BEAK to Fur/Alternative1, BASE to Fur/Primary,
UNDERBELLY to Underbelly/Primary, MARKINGS alternatives to Underbelly/Primary
or Scale/Primary, COLOURALT to Scale/Unique, EYES/SKIN to Rock/None.
An entire bird cannot be represented by one Feather palette tint.

### Flora

`LUSHBIOME.MBIN` references object list alternatives and `LUSHCOLOURPALETTES.MBIN`;
the base palette bank alone is not sufficient evidence for all planet colors.
`LUSHOBJECTSFULL.MBIN` has 38 object-spawn records. Its first two name
`HQTREEREF.SCENE.MBIN`, use FLORACLUMP versus FOREST placement, different
coverage/density, MaxScale=3.2 and resource seed NONE. The caller supplying that
missing seed has not been recovered.

`hqtreeref.descriptor.mbin` contains 75 `_NEWTREE_` choices referencing numbered
tree scenes. `parts/hqtree01.descriptor.mbin` has trunk/accessory/branch/frond
groups with LOD-specific IDs, not 61 independent visible parts. Conversely,
`alpine/largeplant/largefir01.descriptor.mbin` is empty: placement, scale and
material variation must not be confused with descriptor choices.

A separate frozen `treebase.texture.mbin` binds SNOW to Snow/Primary, MOSS to
Plant/Primary and both BASE alternatives to Wood/Primary. This is a frozen
tree example, not a proven material dependency of the Lush tree above.

## Selected source fingerprints

These are existing corpus `content_hash` values for original MBINs, not fresh
binary readback verification. MXML was read from the existing corpus.
Logical path prefixes follow the chains above.

| Source | Indexed SHA-256 |
| --- | --- |
| creaturegenerationdata | `46ffc96e3306b1ad00200499e93e0368189711c189368aa9cb00f6ad6495d1b1` |
| creaturegenerationarchetypes | `b55b42101fa808f002cd8b9ba4fc2203a9536418003a9a8cb1c67a14ff862a92` |
| creaturefilenametable | `37b47c88117464a264444ef15f193edb07c17de4c5af7c13e166b3a328e2d0ba` |
| airtablecommon | `124425c7a4693a0779817a500d3d94c2d701bbba2159a161034c99e0765a300d` |
| bird.descriptor | `0f8a0ac4745b60a92b11fb17e89d610d23c85a344dc871a0195963dbab0e5776` |
| birdbodyhead.texture | `8ba332193ae4d813c3b919f46f636be46ae07d0c1bc411b1327f3e8f8e89eeb6` |
| lushbiome | `73d6c2dd31dbce6c3653b40e86d70931c7b05561d42376a70b39ca14f3356c7b` |
| lushobjectsfull | `198dd59ac474cfe51887608864d017519c55d09b308071b1aaa39efef9fdd080` |
| lushcolourpalettes | `21513a99cdf9c59e7bd0d35235cccc30bdeac5436f64d7419e93d065267627ff` |
| hqtreeref.descriptor | `6fdb2181970c653d847f427b6985ba77852bb5268af7fc578395383c980fea70` |
| hqtree01.descriptor | `6b11f9a41505649c40970820ea19de75b0c455a5e293dfd787635c8b03a3f9e7` |
| largefir01.descriptor | `d4346df5ac8817df67d122658f6307e540903d4c853554c9b223b472a5e38852` |
| frozen treebase.texture | `d2087f0e7f0e5f5d59c25a4559edd276a4ab37d5961c49e3a58ee152e22c065c` |

## Reproduction pattern, only after resuming

Read existing exports first. This is a record of the commands used, not an
instruction to rerun them. For a repeat use **new output/stage names**: the
wrappers do not universally reject existing destinations.

```powershell
$seedPython = 'C:\Users\louan\AppData\Local\Python\pythoncore-3.14-64\python.exe'
$seedExe = "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe"
$seedHash = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
$seedTools = 'C:\Users\louan\AppData\Local\NMSCourier\research-tools'
$seedReference = 'C:\Users\louan\AppData\Local\NMSCourier\research-references\NMS.py-52e2e554\data.json'

& $seedPython runtime/research/scan-native-acquisition.py `
  --executable $seedExe --sha256 $seedHash --database $seedReference `
  --python-tools "$seedTools\python" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\fauna-generation-signatures `
  --function-term 'cGcPlanetGenerator::GenerateCreature' `
  --function-term 'cGcPlanetGenerator::FillCreatureSpawn'

& $seedPython runtime/research/analyze-acquisition-offline.py `
  --executable $seedExe --sha256 $seedHash --tools "$seedTools\native" `
  --seeds E:\NMS-Courier-Research\seed-analysis-180383\fauna-generation-signatures\seeds.tsv `
  --output E:\NMS-Courier-Research\acquisition-180383 `
  --project-name Acquisition180383 --stage faunageneration --timeout 180
```

For metadata discovery use `--metadata-only` and the three `--type-name` values
listed above; select only the recorded three RVAs in a tab-separated seed file.
For the arithmetic report use `inspect-native-fragments.py --rva 16a0a50
--literal 4b251f8 --literal 4b25aa0`, the same executable/hash/library arguments
and an explicit new external `--output` JSON path. Run reports retain exact
tool invocations and source hashes.

## Failures and where to continue

- Requesting literal RVA `527a93c` failed with `Raw literal window outside
  file-backed sections`. This is a PE bounds rejection, **not SSD damage or
  permissions**. That attempt emitted no report. Retrying only the two
  file-backed constants succeeded; the runtime global remains unknown.
- Large whole-function/XML output was truncated. Use selected line windows and
  property summaries; complete exports are already preserved externally.
- An early manifest read preceded export creation. Both stages later completed
  normally; this was timing, not decompilation failure.
- A web search found an obsolete template checklist; it was not used to infer
  current offsets. Local pinned sources and exact-build evidence take priority.

**Original continuation point, completed on 2026-10-04:** inspect `229c280.c` and `22f7d70.c`, determine
whether these help name fields or are only structural hashes. Map role/spawn
seed fields to current metadata, then follow their consumers to resource
generation, descriptors and palette inputs. For flora, follow the native caller
that fills resource seed NONE. The missing link is seed propagation and call
order, not another list of XML names. Check consequential deductions in assembly.

No complete fauna/flora generator, inverse search, natural-location mapping or
live appearance validation was produced. No game/save/mod files were modified.
Do not restart full extraction, access the failed D: corpus, run disk repair or
change BitLocker. No tests, feature implementation or runtime work are requested
in this offline algorithm investigation. The current next reads are the missing
seed input names, resource source collections and palette/descriptor consumers
in [the continuation](PLANET_FAUNA_SEED_FLOW.md#rejected-leads-and-remaining-links).
