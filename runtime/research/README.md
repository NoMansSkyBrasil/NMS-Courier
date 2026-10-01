# Bulk game-data research

Start with [the research navigation index](../../docs/RESEARCH_INDEX.md) and
[repository function map](../../docs/RESEARCH_SOURCE_FUNCTIONS.md) when locating
an existing mechanism. `build-research-index.py` creates a bounded-search metadata
index of source functions, corpus files, and available Ghidra exports.

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

- HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5; pinned in `requirements.txt`.
- MBINCompiler 7.04.1-pre3, Windows .NET 8 executable, SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`.
- Official compiler artifact:
  <https://github.com/monkeyman192/MBINCompiler/releases/download/v7.04.1-pre3/MBINCompiler.exe>.
- Working research root: `D:\NMS-Courier-Research`.
- Current data corpus: `D:\NMS-Courier-Research\corpus`.

The compiler's current mapping successfully converted four installed tables in an
offline pilot. This is not a guarantee that every MBIN type is supported. Failures
remain explicit in the index, per-archive converter logs, and report.

## Commands

Developer setup requires Python and the compiler's .NET runtime. This does not
establish clean-machine end-user packaging. Install the pinned dependencies into
the private research tools directory, not the application's runtime:

```powershell
python -m pip install --target D:\NMS-Courier-Research\tools\python -r runtime\research\requirements.txt
```

After placing the hash-verified compiler in the tools directory:

```powershell
python runtime\research\bulk-game-data.py `
  --game "E:\SteamLibrary\steamapps\common\No Man's Sky" `
  --output D:\NMS-Courier-Research\corpus `
  --compiler D:\NMS-Courier-Research\tools\MBINCompiler-7.04.1-pre3.exe `
  --compiler-sha256 4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4 `
  --python-tools D:\NMS-Courier-Research\tools\python
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
one-hour timeout per archive. Free-space checks reserve two GiB beyond each
archive's remaining binary extraction; MXML/index expansion may require more.

## Token-efficient research

Read `report.json` and query `index.sqlite` first. Do not send the full corpus or
compiler logs to an assistant. The symbol index deduplicates XML property values
per asset and returns a bounded list of source paths:

```powershell
python runtime\research\bulk-game-data.py --output D:\NMS-Courier-Research\corpus --query 'GcRewardSpecificShip' --limit 10
python runtime\research\bulk-game-data.py --output D:\NMS-Courier-Research\corpus --query 'ClassProbabilities' --limit 10
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
python runtime\research\prepare-offline-tools.py --output D:\NMS-Courier-Research\tools\native
python runtime\research\analyze-native-offline.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --tools D:\NMS-Courier-Research\tools\native `
  --output D:\NMS-Courier-Research\native-180383 --limit 400
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
python runtime\research\summarize-delivery-data.py --corpus D:\NMS-Courier-Research\corpus --output D:\NMS-Courier-Research\evidence\delivery-data-180383.json
```

The snapshot also retains up to three examples per selected reward type, exact
enclosing reward IDs, counts, and ship-type distributions per source archive.
Repeated inventory elements get indexed keys instead of overwriting one another.
Counts describe entries in the generic reward table, not all table categories or
runtime-supported operations. Assets duplicated across archives are preserved;
the snapshot does not infer which archive the game loads last.

Source tools: [Ghidra](https://github.com/NationalSecurityAgency/ghidra) and
[Temurin JDK](https://github.com/adoptium/temurin25-binaries).
