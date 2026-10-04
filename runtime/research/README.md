# Bulk game-data research

Start with [the research navigation index](../../docs/RESEARCH_INDEX.md) and
[repository function map](../../docs/RESEARCH_SOURCE_FUNCTIONS.md) when locating
an existing mechanism. `build-research-index.py` creates a bounded-search metadata
index of source functions, corpus files, and available Ghidra exports.

For the resumed procedural investigation, read [the seed handoff](../../docs/SEED_RESEARCH_HANDOFF.md)
and [the recovered planet/fauna flow](../../docs/PLANET_FAUNA_SEED_FLOW.md).
They record bounded native export configurations, field associations, random-stream
order and unresolved links. Reuse the existing corpus and offline project.

`bulk-game-data.py` inventories and extracts every installed Windows PAK, converts
all `.MBIN` and `.MBIN.PC` candidates to MXML, validates generated XML, and indexes
property names, values, and templates in SQLite FTS5. Each archive gets its own
hash-qualified directory: duplicate asset paths are retained with their source
archive, without assuming game load precedence. Non-MBIN assets are extracted as
binary files; this tool does not decompile native executable code.

This is a developer research utility, separate from the packaged catalog importer.
It reads game archives and does not attach to the game, install mods, or edit saves.
All extracted assets, indexes, tool binaries, and logs stay outside the repository.

## Selected tools and current corpus

### Bounded rebuild pilot (2026-10-01)

The former D: corpus is unavailable after storage errors. Do not use the old
bulk commands below as the rebuild starting point. The new first step is
`extract-mbin-pilot.py`: exactly three Precache tables, one converter at a time,
staging on C: and publication in a new E: directory. It does not repair storage,
change BitLocker, install mods, or edit game/save files.

The verified pilot is `E:\NMS-Courier-Research-Pilot-20261001`: REWARDTABLE,
INVENTORYTABLE, and AISPACESHIPMANAGER, each with MBIN and validated MXML.
Its `report.json` records fingerprints, sizes, and readback hashes. Private
tools and the staging report remain under `%LOCALAPPDATA%\NMSCourier` on C:.
Use the direct Python runtime executable: the WindowsApps alias in this session
could not see the downloaded compiler, although native Python could.

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime\research\extract-mbin-pilot.py `
  --game "E:\SteamLibrary\steamapps\common\No Man's Sky" `
  --stage "$env:LOCALAPPDATA\NMSCourier\research-staging\pilot-NEW-ID" `
  --output E:\NMS-Courier-Research-Pilot-NEW-ID `
  --compiler "$env:LOCALAPPDATA\NMSCourier\research-tools\MBINCompiler-7.04.1-pre3.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python"
```

Existing stage/output directories are rejected. There are no automatic retries
or deletions. Each MBIN is limited to 32 MiB; conversion is monitored every 250 ms
against a 128 MiB staging budget and a 120-second timeout. The monitoring budget
can be exceeded briefly between checks; publication has a strict 128 MiB payload
limit plus a small report. Two GiB remain reserved on both volumes. A failure
preserves evidence on C: and aborts the batch. Hash verification detects mismatched
files; it does not prove physical disk health or guarantee future reliability.
At the end of the pilot, full corpus extraction and native decompilation had not been restarted.

### Full rebuild started after the pilot

Completion: all 97 archives finished at 2026-10-02 00:02:38 UTC. All 194,641 entries
were extracted; 106,482 MBINs were converted/indexed and one (`inputtest.mbin`)
failed conversion. `E:\NMS-Courier-Research\SUMMARY.md` contains format and archive
counts. `navigation/` indexes source functions and all asset filenames; native
exports remain an explicit unavailable input. `delivery-evidence.json` contains
bounded evidence from three delivery tables. No automatic failure retry occurred.

The user authorized all 97 installed PAK archives after the pilot. The new corpus
is `E:\NMS-Courier-Research\corpus`. Its `report.json`, `index.sqlite`, and
per-archive converter logs distinguish extracted, converted, unsupported, and
failed assets. Logs and a report mirror are kept on C: under
`%LOCALAPPDATA%\NMSCourier\diagnostics\extraction-e-20261001`.
The initial inventory contains 194,641 archive entries, 106,483 MBIN candidates,
and 71,022,968,519 uncompressed bytes; duplicate logical paths are retained.

Conservative defaults reserve 20 GiB, throttle binary extraction to 16 MiB/s,
pause three seconds between archives, and constrain the Windows converter to two
logical CPUs. Archives run sequentially; the compiler may use parallel work inside
an archive. The extraction rate does not limit conversion, SQLite, or read traffic.
Space is checked before each extracted file and every second during conversion;
storage/SQLite errors abort the run and preserve progress. Converter processes
are terminated on low space or a one-hour timeout. Unsupported asset formats
remain recorded failures. These controls do not guarantee physical disk health.

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime\research\bulk-game-data.py `
  --game "E:\SteamLibrary\steamapps\common\No Man's Sky" `
  --output E:\NMS-Courier-Research\corpus `
  --compiler "$env:LOCALAPPDATA\NMSCourier\research-tools\MBINCompiler-7.04.1-pre3.exe" `
  --compiler-sha256 4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4 `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --report-mirror "$env:LOCALAPPDATA\NMSCourier\diagnostics\extraction-e-20261001\report.json"
```

Do not start a second writer while `run.lock` exists. A started worker is not
completion evidence; inspect the report and failure counts. This extracts all
PAK assets and converts supported MBIN types, not native executable pseudocode.

`watch-extraction-storage.ps1` is a separate 30-second monitor attached to the
worker PID and its creation time. It checks E: availability, the 20 GiB reserve,
disk-1 events, and conservatively stops on NVMe/NTFS warnings. SATA `storahci`
events are recorded separately because the verified target disk uses NVMe.
On a stop it terminates only the verified worker and its compiler child, preserves
the lock and partial outputs, and writes `storage-watch.jsonl` on C:. Consult this
log as well as `report.json`: forced termination can leave the report at `running`.
The monitor itself does not repair, reset, or modify disk/encryption configuration.

```powershell
pwsh -NoProfile -File runtime\research\watch-extraction-storage.ps1 `
  -WorkerId WORKER_PID `
  -Diagnostics "$env:LOCALAPPDATA\NMSCourier\diagnostics\extraction-e-20261001"
```

- HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5; pinned in `requirements.txt`.
- MBINCompiler 7.04.1-pre3, Windows .NET 8 executable, SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`.
- Official compiler artifact:
  <https://github.com/monkeyman192/MBINCompiler/releases/download/v7.04.1-pre3/MBINCompiler.exe>.
- New research root: `E:\NMS-Courier-Research`.
- Corpus being rebuilt: `E:\NMS-Courier-Research\corpus`.
- Former unavailable corpus: `D:\NMS-Courier-Research\corpus`. Commands below
  use E: for current research. Preserve historical reports without accessing
  or repairing the former volume.

The compiler's current mapping successfully converted four installed tables in an
offline pilot. This is not a guarantee that every MBIN type is supported. Failures
remain explicit in the index, per-archive converter logs, and report.

## Commands

Developer setup requires Python and the compiler's .NET runtime. This does not
establish clean-machine end-user packaging. Install the pinned dependencies into
the private research tools directory, not the application's runtime:

```powershell
python -m pip install --target E:\NMS-Courier-Research\tools\python -r runtime\research\requirements.txt
```

After placing the hash-verified compiler in the tools directory:

```powershell
python runtime\research\bulk-game-data.py `
  --game "E:\SteamLibrary\steamapps\common\No Man's Sky" `
  --output E:\NMS-Courier-Research\corpus `
  --compiler E:\NMS-Courier-Research\tools\MBINCompiler-7.04.1-pre3.exe `
  --compiler-sha256 4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4 `
  --python-tools E:\NMS-Courier-Research\tools\python
```

Use `--archive NMSARC.MetadataEtc.pak` for a bounded pilot. Rerun the same command to
resume: extraction records are reused when source hash, output presence, and size
match; successful conversions are reused only for the same compiler hash. The
corpus is generated research material and must not be edited manually. A changed
compiler reconverts the archive's MBIN candidates. `--retry-failed` explicitly
retries recorded conversion failures. File-level extraction is atomic, with byte
counts and SHA-256 recorded. Extraction streams chunks from the audited pinned
HGPAKtool API to avoid buffering an entire large asset.

`run.lock` prevents concurrent writers. After an interrupted process, verify that
its recorded PID has exited before removing a stale lock. Conversion has a
one-hour timeout per archive. Free-space checks reserve 20 GiB by default beyond each
archive's remaining binary extraction; MXML/index expansion may require more.

## Token-efficient research

For exact-build acquisition candidates and their external pseudocode locations,
read [native acquisition research](../../docs/NATIVE_ACQUISITION_RESEARCH.md).
The targeted scanner and Ghidra exporter avoid whole-program auto-analysis.
Use `analyze-acquisition-offline.py` for a bounded future invocation; it requires
an explicit executable hash and seed list and never attaches to the game.
The current navigation index imports both the initial and focused native exports.

For the comparison of gift, upgrade and direct-acquisition routes, read
[delivery alternatives](../../docs/DELIVERY_ALTERNATIVES.md). Reproduce its
bounded local schema/ZIP evidence without attaching to the game:

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/research/research-delivery-routes.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --output E:\NMS-Courier-Research\delivery-routes.json `
  --mods C:\Users\louan\Downloads\Compressed
```

The optional ZIP inspection reads selected Lua sources and stores fingerprints
and text-marker counts, not executable third-party code. Comments can contain
markers. Generic reward counts exclude inline payloads outside their container.

Read `report.json` and query `index.sqlite` first. Do not send the full corpus or
compiler logs to an assistant. The symbol index deduplicates XML property values
per asset and returns a bounded list of source paths:

```powershell
python runtime\research\bulk-game-data.py --output E:\NMS-Courier-Research\corpus --query 'GcRewardSpecificShip' --limit 10
python runtime\research\bulk-game-data.py --output E:\NMS-Courier-Research\corpus --query 'ClassProbabilities' --limit 10
```

Then use `rg -n` on only the returned MXML files and share bounded relevant
sections. The `files` table retains archive hashes, asset hashes, paths, extraction
and conversion status, and errors. `report.json` records executable fingerprint,
compiler fingerprint/version, dependency versions, and per-archive totals.
An ordinary `symbol_keys` table maps archive/path pairs to FTS row IDs. Replacement
and failure cleanup use this key instead of scanning every indexed asset. Existing
indexes migrate automatically without extracting or converting their files again.
Archive indexes and generated MXML reveal data definitions, not the timing of
native game calls or a proven delivery capability.

Primary documentation: [HGPAKtool](https://github.com/monkeyman192/HGPAKtool) and
[MBINCompiler](https://github.com/monkeyman192/MBINCompiler).

## Interruption recovery and ordering

Interrupted MXML without a committed conversion record is XML-validated before
reuse. Malformed output is preserved with an `.interrupted` suffix and converted
again. Explicit failure retries overwrite old converter outputs. Archive order
prioritizes Precache, MetadataEtc, and EntitySceneMBIN for delivery research, then
processes every remaining PAK. Purely numeric XML payloads are omitted from the
symbol index; exact numeric searches remain available in the original MXML.

## Native executable analysis

The pinned `offline-tools.json` selects Ghidra 12.1.4 and a portable Temurin JDK
25.0.4.1+1. `prepare-offline-tools.py` downloads official release ZIPs, checks their
SHA-256, and extracts them outside the repository without changing system Java
settings. This setup is for developer research, not shipped app code.

```powershell
python runtime\research\prepare-offline-tools.py --output E:\NMS-Courier-Research\tools\native
python runtime\research\analyze-native-offline.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --tools E:\NMS-Courier-Research\tools\native `
  --output E:\NMS-Courier-Research\native-180383 --limit 400
```

The exact-hash input is imported into a separate Ghidra project. Automatic analysis
uses two CPUs and requests a 30-minute analysis timeout per imported file. Import,
analyzer shutdown, and the separate export phase can extend total wall time. Inspect
the log and running process before treating that request as a hard deadline. The Java post-script
exports an index of discovered functions, references to delivery-related strings,
and up to 400 decompiled candidate functions, with 30-second per-function timeouts.
It follows one level of indirect data references. Generated C-like pseudocode,
auto-generated names, and reference proximity do not prove function identity or a
safe runtime call. The stored `headless.log`, `run.json`, and TSV exports permit
targeted follow-up without loading full disassembly into the conversation.

`summarize-delivery-data.py` emits a compact, provenance-bearing JSON snapshot of
reward types, freighter reward payloads, model references, and generation bounds:

```powershell
python runtime\research\summarize-delivery-data.py --corpus E:\NMS-Courier-Research\corpus --output E:\NMS-Courier-Research\evidence\delivery-data-180383.json
```

The snapshot also retains up to three examples per selected reward type, exact
enclosing reward IDs, counts, and ship-type distributions per source archive.
Repeated inventory elements get indexed keys instead of overwriting one another.
Counts describe entries in the generic reward table, not all table categories or
runtime-supported operations. Assets duplicated across archives are preserved;
the snapshot does not infer which archive the game loads last.

Source tools: [Ghidra](https://github.com/NationalSecurityAgency/ghidra) and
[Temurin JDK](https://github.com/adoptium/temurin25-binaries).

## Static service-client and independent C# inspection

See [the service assessment](../../docs/METAIDEA_SERVICE_RESEARCH.md) before using
public service UI/catalogs as runtime evidence. Inspect supplied HTML without
executing it or making delivery requests:

```powershell
python runtime/research/inspect-service-client.py --source <saved-client.html> `
  --output E:\NMS-Courier-Research\evidence\service-client.json
```

The report contains hashes and selected identifiers, not account values or copies
of embedded assets. Its lexical function scanner is deliberately limited and
must not be treated as a JavaScript parser or server/backend analysis.

An independent developer-only .NET 10 file-based app uses built-in PEReader and
SHA-256, with no NuGet dependencies or process/memory access:

```powershell
dotnet run --file runtime/research/InspectNativeCandidates.cs -- `
  "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  0xf12240 0xf27cd0 0xf31490 0x8e3a10 0x4cea20
```

It rejects unknown hashes and non-executable/file-unbacked targets, inspects at
most 32 candidates, and reports 24 entry bytes plus unwind bounds. Matching these
to Python output is independent static validation, not permission to invoke a
native function. The desktop product does not depend on an end-user SDK.


## Procedural appearance and seed investigation

See `docs/PROCEDURAL_SEED_RESEARCH.md` for exact evidence and unresolved algorithm
work. `inspect-procedural-descriptors.py --corpus <external-corpus> --model
models/common/spacecraft/sentinelship/sentinelship_proc.descriptor.mbin --output
<new-external-json>` indexes conditional descriptor choices from existing XML.
It does not generate a seed or assign probabilities.

The native metadata scan accepts `--metadata-only --type-name
TkModelDescriptorList --type-name TkResourceDescriptorList --type-name
TkResourceDescriptorData`. Feed `descriptor-metadata-180383.tsv` to the existing
bounded Ghidra launcher with `--stage descriptors`. `scan-native-callers.py`
accepts a pinned executable/hash, up to 16 `--target <hex-rva>` arguments,
`--python-tools <external-capstone>` and a new external `--output` directory.
It checks direct E8/E9 instruction boundaries and exports caller seed candidates;
indirect calls and split unwind fragments remain incomplete. No process/save API
is used. Do not interpret metadata hashing as the appearance PRNG.

The six `procedural-*-180383.tsv` seed lists trace task preparation through
automatic descriptor selection; owning evidence is in the seed research document.
Use stages `proceduraltask`, `proceduraltaskcallees`, `proceduraltaskconstructor`,
`proceduralselection`, `proceduralselector`, and `proceduralchoice` respectively.
`scan-native-acquisition.py --function-term <bounded-substring>` selects public
signature labels, without asserting current native identity.

`inspect-native-fragments.py --executable <pinned-exe> --sha256 <hash>
--python-tools <external-capstone> --rva <hex> --literal <hex> --output
<new-external-json>` exports up to 16 bounded unwind fragments/literal windows.
`procedural-seed-primitives.py --seed 0x1ad0003900054 --draws 8` prints an
experimental integer trace, not parts or colors. Validate with:

```powershell
python runtime/research/test_procedural_seed_primitives.py --assembly `
  E:\NMS-Courier-Research\seed-analysis-180383\selector-assembly.json --assembly `
  E:\NMS-Courier-Research\seed-analysis-180383\selector-child-assembly.json
```

Without external assembly reports the command runs boundary tests only; that is
not a fresh assembly comparison. The interpreter never invokes native code.

Use `inspect-procedural-descriptors.py --models-file
runtime/research/procedural-categories-180383.json --corpus <existing-corpus>
--output <new-external-json>` for the fourteen additional ship, freighter,
frigate and multitool roots. Manifest and repeated `--model` inputs are mutually
exclusive. `inspect-appearance-fields.py --corpus <existing-corpus> --asset
<exact-logical-path> --output <new-external-json>` reports bounded palette/seed
field samples from up to sixteen assets. Neither tool evaluates a full seed.
Feed `procedural-texture-180383.tsv` to stage `proceduraltexture` for the two
current texture-loading candidates; pixel loading is not verified color selection.

`inspect-seed-presets.py --corpus <existing-corpus> --output <new-external-json>`
catalogs shipped specific-ship reward model/seed/class fields. It does not access
saves or infer class from gift flags. `build-appearance-graph.py --corpus
<existing-corpus> --root <exact-scene-path> --output <new-external-json>` follows
bounded asset dependencies; optional lookup misses and exhausted budgets remain
explicit. Use narrower roots when a combined graph reaches the node ceiling.

`scan-procedural-arithmetic.py --executable <pinned-exe> --sha256 <hash>
--python-tools <external-capstone> --start-rva 600000 --end-rva 660000 --output
<new-external-json>` checks multiply/carry instruction candidates in a bounded
region. It does not identify every candidate as a generator. Feed the arithmetic,
palette, palette-lookup and palette-callers TSV lists to stages
`proceduralarithmetic`, `proceduralpalette`, `proceduralpalettelookup` and
`proceduralpalettecallers`, respectively. Inspect manifests as well as process
exit codes: successful launcher completion can retain individual export failures.

`procedural-seed-primitives.py --seed 0x6 --draws 5 --palette-mode All` traces
isolated palette-index draws, without full category propagation, RGBA or retries.
Run `test_seed_asset_inspectors.py` for synthetic asset safety/precision checks.
The owning seed research document records recovered formulas and missing steps.

`evaluate-base-palettes.py --corpus <existing-corpus> --seed 0x6 --output
<new-external-json>` traces the complete candidate base-collection schedule from
the hash-pinned MBIN's original float32 colors. It does not resolve the actual
ship color seed, alternate collections or final materials. Add `--palette-assembly
<external-palette-row-body-assembly.json>` to the primitive test command to replay
1,000 draw windows and 320 index windows. That replay does not cover RGBA or
whole appearances. Additional branch seed lists map to stages
`proceduralcolorbranches` and `proceduralalternatepalette`.

`evaluate-descriptor-seed.py --corpus <existing-corpus> --model <exact-model-path>
--seed 0x7 --output <new-external-json>` predicts the unfiltered default descriptor
trace. Alternatively use `--models-file procedural-categories-180383.json` for
bounded category runs. Reports retain unsupported cases; exit/trace counts are
not runtime success. Inclusion/exclusion/prefix/customisation inputs, colors and
class are outside this evaluator. The collector's ordered_model_tree preserves
child-list boundaries needed by its recursive schedule. Metadata is cached in
memory; the corpus database is never modified.

`inspect-native-fragments.py --executable <pinned-exe> --sha256 <hash> --rva
2d65af0 --python-tools <external-capstone> --output <new-external-json>` exports
instruction bytes from up to eight containing unwind fragments (16 KiB each).
It validates target instruction boundaries and complete decoding, never invokes
native code and explicitly does not merge split fragments into a guessed ABI.
Optional `--literal-rva` and `--thunk-rva` inspect at most sixteen bounded literals
and sixteen PE64 FF25 import thunks. Import symbols come from the pinned PE table,
not a guessed library function based on nearby instructions.
The existing `--literal` option still reads raw 32-byte windows, including
non-string float constants; literal-only calls remain supported.
Stage `proceduralresourcelookup` uses the corresponding resource-lookup seed TSV;
its first attempt timed out before exporting a manifest. Navigation retains
such unavailable stages separately as `native_analysis_run` evidence.

For code-only metadata changes, use `build-research-index.py --refresh-source
--output <existing-navigation-directory> --source-summary
docs/RESEARCH_SOURCE_FUNCTIONS.md`. It transactionally replaces repository
definitions and their search records while preserving imported data/native rows,
warnings and the original import timestamp. Do a full build when imported
corpus/native artifacts actually change; source refresh does not import them.

## Pi collection port

See [the owning assessment](../../docs/PI_PROCEDURAL_ITEM_RESEARCH.md) for upstream
revision, source fingerprints, current candidates and limits. These tools are
offline developer research, not a shipped runtime adapter or a working Pi plugin.
Use the approved private Python executable; `python` below denotes that runtime.
Keep SQLite catalogs and snapshots in the external research directory.

```powershell
python runtime/research/pi-seed-catalog.py `
  --catalog E:\NMS-Courier-Research\seed-analysis-180383\pi-example.sqlite `
  plan --exe-sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --kind technology --item UP_FRHYP --evidence simulated --stop 10
python runtime/research/pi-seed-catalog.py `
  --catalog E:\NMS-Courier-Research\seed-analysis-180383\pi-example.sqlite `
  pending --limit 3 --output E:\NMS-Courier-Research\seed-analysis-180383\pi-example-pending.jsonl
```

Pending rows are inputs only, with `runtime_call_authorized=false`. To ingest
owned snapshots use `import --input <new-jsonl-path>`; export uses
`export --output <new-jsonl-path>`; `status` reports counts. Output files must be
new. Results require `exe_sha256`, `kind`, `item`, `evidence`, `seed`,
`procedural_id`, nonempty `raw` and `provenance`. Example synthetic row:

```json
{"exe_sha256":"671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4","kind":"technology","item":"UP_FRHYP","evidence":"simulated","seed":0,"procedural_id":"UP_FRHYP#00000","raw":{"stats":[{"stat":"SyntheticStat","bonus":1.125,"level":3}]},"provenance":{"source":"Synthetic example; not game output"}}
```

Observed snapshots additionally require `adapter_sha256` and `capture_sha256`
inside provenance. They must use a separate observed catalog and an independently
verified producer. Changing an evidence label is not validation. No native producer
is enabled by this tool. Maximum import is 1,000 records, 64 KiB per record.

Compatibility inspection does not import the historical source or reuse offsets:

```powershell
python runtime/research/scan-pi-compatibility.py `
  --types-source E:\NMS-Courier-Research\seed-analysis-180383\pi-reference-80e397b\NMSpy_mods__data__7024b107f0533de802e8ecfbed65d2c778d03c1f__types.py `
  --source-sha256 59ed0a093901e65d79786cbd88b8fa5248a033c756b4311ecb7e2b2b48edac14 `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\pi-compatibility
```

The external source is a disposable copy; recover it from the pinned upstream
link and verify its hash if unavailable. `compatibility.json` records ambiguous,
disagreeing and corroborated static candidates with all runtime calls disabled.
`anchor-seeds.tsv` is suitable for later bounded offline analysis, not hook installation.

## Public seed-reference candidate batch

See [preview research](../../docs/MODEL_PREVIEW_RESEARCH.md) for image review,
category mapping, conflicting input exclusions and NMSMV source findings.
The committed `reddit-seed-observations.tsv` contains public metadata and written
observations only, no image assets. Do not infer an algorithm accuracy score
from completed traces or any convenient color in an unbound palette family.

```powershell
python runtime/research/compare-seed-observations.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\reddit-comparison-20261003.json
```

The output must be new; the executable must match the pinned 180383 fingerprint.
Input is capped at 128 posts/128 KiB, descriptors retain existing row/XML budgets,
and the corpus is read-only. This tool does not fetch webpages or execute game
functions. Rendering, native color-channel correlation and whole appearance
validation remain separate work.
