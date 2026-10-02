# Runtime experiment log

This is the short entry point for resuming exact-build research. Detailed reasoning belongs in [runtime research](RESEARCH_AND_DECISIONS.md), implementation contracts in [protocol and runtime](PROTOCOL_AND_RUNTIME.md), and current tasks in [TODO](../TODO.md). Entries describe observations, not general compatibility claims. All live tests used the user's disposable local save; none used save-file editing.

## 2026-10-01: targeted offline native acquisition research

- Build: installed 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  different from the live-tested 179666 bridge target.
- Source/configuration: [native acquisition research](NATIVE_ACQUISITION_RESEARCH.md),
  its pinned NMS.py/ReNMS revisions, `scan-native-acquisition.py`,
  `ExportAcquisitionSeeds.java`, Capstone 5.0.5, Ghidra 12.1.4, and pinned
  Temurin JDK 25.0.4.1+1. External `run.json` records source hashes.
- Trigger/save conditions: static PE reading and selected Ghidra disassembly;
  `-noanalysis`, two CPU configuration, initial 26 seeds/30-second decompilation
  limits, then two focused seeds/120-second limits. No process attachment,
  reward event, save access, mod installation, or mutation occurred.
- Observed: six unique public-signature matches at unwind starts; 25 of 26
  initial pseudocode exports succeeded. The purchase candidate timed out.
  The focused run successfully exported it and a reward-entry dispatcher,
  yielding 27 unique pseudocode candidates. Subsequent bounded metadata,
  handler, initializer, setup, inventory and layout passes added eight successful
  exports, for 35 unique candidates. The payload tag `0x8a37c4a2` links the
  specific-ship serializer/getter to handler `0xf27cd0`, purchase setup
  `0x8e4d30`/`0x8e3a10`, and inventory initialization `0x4cd270`/`0x4cea20`.
  The layout initializer zeros the field corresponding to public `mClass`;
  the type-3 setup branch creates types 8/9 with zero class-stat selection,
  unlike other branches with explicit class copies. Reward dispatch passes through
  separate entry handlers; purchase handling includes readiness, item-kind
  branches, callback and cleanup. The first unwind fragment is not the complete
  purchase function, so its static direct-call sample is incomplete.
- Not proven: payload-to-freighter handler identity, complete ABI, gift without
  UI, S class/Pirate/120 technology/all-supercharged delivery, current-build
  runtime compatibility, or persistence. The static C-class clue is not proof
  of the older build's badge source. Public 4.13 ownership layouts are reference
  clues only. The initial/focused runs were supervised headless commands; the
  subsequent stages used the new bounded launcher with 300-second deadlines.
- Rollback: none required; game/DLL/data/save remained unchanged. Tools on C:,
  pseudocode/project on E:, all prior and failed manifests retained. Navigation
  now imports the initial/focused candidates rather than reporting unavailable
  native exports. No D: access or disk maintenance occurred.

## Reference points

### 2026-10-02: current-build observation bridge verified in gameplay

- Build: installed NMS 180383 SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Source/configuration: `callback_observer_180383.c`, startup verifier profile
  `COURIER_OBSERVE_180383`, `build-probe.ps1 -Mode Observer180383`, pinned
  MinHook 1.3.4 and llvm-mingw 20260922. Public NMS.py revision
  `52e2e55493ddade1d89d3e638491afff995f5631` has a unique Update signature match
  at RVA `0x2d7530`, with exact 16-byte prefix
  `40534883ec20e8a54792024889056ebd`. Its mangled name describes a void method
  with no explicit arguments. The observer forwards the original this pointer.
- Conditions: game closed; no reward event, inventory read/write, or save access.
  The observer source does not link legacy inventory or delivery adapters. It
  logs counters and disables its hook after 180 seconds. Old callback source
  explicitly rejects the new profile at compile time.
- Failure: the former compiler directory contained only two executable files;
  the build exited `-1073741515` (missing dependency). The official private
  toolchain ZIP was downloaded to C: and verified against its previously pinned
  SHA-256 `e3ad77d117a4bea19a7a3b333341824d79a5a371004a10e25b8504e7b3047666`.
  No system installation or disk operation was used to resolve the tool failure.
- Observed: strict `-Wall -Wextra -Werror` build succeeded. The isolated
  fixture forwarded all 400 original calls; the sampled diagnostic recorded
  385 callbacks and hook status zero. The production-mode fake executable
  logged `unsupported_build`, forwarded all 400 calls, and produced no observer
  log. Fixture hash bypass is never used in the installed DLL.
  The historical Callback profile also compiled under strict warnings. Two
  negative compilation checks rejected mixed observer/delivery macros and
  linking the legacy callback adapter into the current-build observer.
- Installed observer SHA-256:
  `755f8d374f13e1db4eb962f6bc8573bddaab58a22a7c8f903cd38b6c101d627d`.
  Executable, previous DLL, new DLL, and unchanged reward patch were checked.
  The known older DLL hash was `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d`;
  it was backed up before replacement, and installed readback matched.
- Live result: process 20928 resolved to the intended Steam executable and
  logged `exact_build_startup_observed` with the exact fingerprint. The observer
  completed its 180-second window with `hook_status=0`, `callback_count=7042`,
  and callback thread 22420. The user confirmed the disposable save was loaded
  and the character stationary in gameplay. The process remained alive after
  the hook disabled itself. Transient evidence: `asi-startup-20928.log` and
  `native-observer-180383-20928.log` under the local diagnostics directory.
- Not proven: callback behavior across all gameplay transitions or long sessions,
  current-build inventory layouts, delivery, or freighter acquisition. No reward
  was dispatched and no inventory or save was accessed by this observer.
- Rollback: previous DLL retained under the external C: staging directory
  `observer-180383-20261002`; replacement requires the game closed and exact
  source/destination hashes. That older DLL rejects the current game build.
  Reward patch and game/save files were not changed.

### 2026-10-02: reported C-class generation; vanilla control prepared

- Build/configuration: the same exact 180383 executable and counter-only DLL
  as above. The installed reward EXML remains SHA-256
  `62840d2810e5ca2b30dccde5f75b9ab5d5ce07ade92ea1e2bb30ba555a9e9732`.
- Conditions/observation: the user reported C class both for ordinary NPC ships
  and a naturally encountered freighter, not just Courier's historical offers.
  No reward was dispatched in this process. The settings list only
  `NMSCOURIERCURRENCYREWARDPROBE` enabled, and the inspected MODS directory has
  its reward EXML and a `.before-explicit-backup` file. No global inventory,
  buildable-ship or fleet table patch was found there. The observer's original
  update forwarding and counter writes do not set inventory class.
- Not proven: a global generation regression, a causal relationship to Courier,
  or normal generation probabilities. The reward patch's narrow intended scope
  does not exclude a loader/merge effect. User observations lack a controlled
  vanilla comparison and a measured sample.
- Further user observations: multitools also appeared C; an expedition reward
  ship expected to be A/S appeared C and was reportedly C in a save editor.
  After changing systems, the user encountered a B-class ship. This contradicts
  an absolute all-C lock but does not establish expected class probabilities or
  whether the expedition reward's original expected class was correct.
- Control preparation: after confirming NMS was closed, verify the exact game
  fingerprint and all three Courier file hashes; copy the proxy, reward EXML,
  and its `.before-explicit-backup` to the external C: staging directory
  `generation-isolation-180383-20261002`, verify every copied hash, and remove
  only those three exact source files. The backup EXML's hash is
  `0745a424670c848ee17e7df5621236bd11b355dd8bd8f0640f3a20abbc1f45a3`.
  A manifest retains relative source paths and expected hashes. MODS contains
  no files afterward; the proxy is absent. Game settings and saves were not
  changed. Vanilla fresh-process class observations are pending.
- Rollback: preserve the external backups; restore only while NMS is closed,
  with expected executable/backup hashes and absent destination files. Existing
  owned entities can retain saved class independently of the removed patches;
  compare naturally generated entities before blaming or changing persistent
  state. Do not edit saves or force class during diagnosis.

### 2026-10-02: static class-generation and reward collision audit

- Build/source: 180383 executable fingerprint above. The installed
  `NMSARC.Precache.pak` SHA-256 is
  `a6371a8b2f065eca33fd306a16cbe2baca9d4ce75806c71e42f74e1ab9295032`,
  matching the corpus archive used for this audit. Inventory MXML SHA-256
  `2b6cb078323e33bfed649c0ed8a6026602a1e580780fbf9d33d30348f73dee25`;
  reward MXML SHA-256
  `8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`.
- Configuration/trigger: new reproducible
  `runtime/research/audit-generation-inputs.py` parses those extracted tables and
  the exact backed-up reward patch. No game attachment, new extraction,
  disk maintenance or save access. Transient report: `static-audit.json` in the
  external generation-isolation staging directory.
- Observed: Poor inputs are C/B/A/S=60/30/10/0, Average=49/35/15/1,
  Wealthy=30/40/28/2, and Pirate stores 5/5/5/5. Do not normalize or interpret
  the Pirate values as final probabilities without tracing its selection path.
  The patch's only top-level property is GenericTable. Its three entry selectors
  match the three Courier reward IDs, and none collide with any original reward
  table Id property. The original specific-ship payloads contain 19 S, 66 A,
  two B and two C class definitions across all tables; some payloads lack an
  enclosing reward ID. Thus original reward data has not universally changed to
  C. The installed observer source only counts callbacks, forwards original
  Update and disables that hook; no class assignment is present or linked.
- Not proven: live merged reward data, the player's economy or entity-selection
  path, a particular expedition reward's expected class, or whether another
  historical integration changed an already-owned entity. Static parsing is not
  an implementation of the game's EXML merger. A linked documentation page was
  unavailable through browsing; no merger behavior was inferred from that error.
- Next/rollback: request the affected reward ship's exact name/model for a
  deterministic original-data lookup. Leave the proxy and patch isolated until
  the cause is understood; the removed files' verified backups remain intact.

#### Targeted Starborn Runner lookup

The user identified the affected ship as Starborn Runner. Hello Games identifies
that ship as the Omega/expedition-twelve reward in its
[Omega update announcement](https://www.nomanssky.com/omega-update/).
Running the same audit with `--model WRACER.SCENE.MBIN` found two original
payloads: `RS_S12_SHIP` and `RS_S12_COMPLETE`. Both specify
`MODELS/COMMON/SPACECRAFT/FIGHTERS/WRACER.SCENE.MBIN`, ship type Royal and inventory
class S. This verifies the user's expected class from the current original data;
the report of an acquired C instance is not explained by those source payloads.
It does not prove when or where its class changed. Do not dismiss that report as
ordinary random generation, and do not infer the patch caused it without a
live acquisition/merged-data comparison. Existing owned-ship class may remain
saved after removing runtime integration. No save was read or modified here.

| Subject | Location or identity | Use |
| --- | --- | --- |
| Tested game executable | Steam Windows build 179666, SHA-256 `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb` | Gate every runtime test; reject other builds |
| Historical known-good delivery DLL | `runtime/native/asi/`; SHA-256 `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d`, backed up before the 180383 observer installation | Older-build native XInput forwarding, update callback, one-shot local reward triggers |
| Installed 180383 observer | `callback_observer_180383.c`; DLL SHA-256 `755f8d374f13e1db4eb962f6bc8573bddaab58a22a7c8f903cd38b6c101d627d` | Observation only; 7,042 callbacks and successful timed hook removal in process 20928 |
| Current installed reward patch | `GAMEDATA/MODS/NMSCourierCurrencyRewardProbe/METADATA/REALITY/TABLES/REWARDTABLE.EXML`, SHA-256 `62840d2810e5ca2b30dccde5f75b9ab5d5ce07ade92ea1e2bb30ba555a9e9732` | Maps the third currency test event to the explicit freighter offer for the next fresh-process test; Quicksilver is not available through that event while installed |
| Original currency reward backup | Local development scratch copy SHA-256 `d67a57493af349e6a50d624537e5fdce59fdfdd2d29a6e2a63366e6c817f08e7` | Restore only while the game is closed, with exact-hash checks |
| Live process diagnostics | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-hook-<PID>.log` | Read callback and one-shot dispatch state; state `2` alone is not user-visible success |
| Reward and inventory sources | `runtime/mods/`, `runtime/native/asi/inspect-freighter-state.py` | Rebuild experiments and perform exact-build read-only inventory checks |
| Source research | [research decisions](RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666) | Trace upstream clue, extracted table field, live validation, and limitation |

The installed reward patch above is a development test configuration, not a release artifact. On 2026-09-24 the game was closed; executable, DLL, patch, and backup hashes were rechecked, and the only Courier mod directory in `GAMEDATA/MODS` was `NMSCourierCurrencyRewardProbe`. The repository was clean after commit `941fb1b` was pushed to `origin/main`.

## What was tested

The 2026-10-01 bulk-data investigation uses a newer installed executable: Windows
file/product version `180383`, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This is an offline extraction fingerprint, not a new runtime compatibility claim.

### 2026-10-01: offline comparison of delivery routes without offer UI

- Scope/configuration: `runtime/research/research-delivery-routes.py`, SHA-256
  `b8498bb76d2dfb9dbc6e8d59ac961e53dfd5090b42517e3ca7b5d1e48e7a9c88`; corpus executable build 180383,
  SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  Read-only SQLite/selected XML inspection and bounded Lua inspection of the four
  supplied ZIPs. No game/save conditions apply and no runtime trigger was sent.
- Sources/provenance: archive/XML fingerprints and all four ZIP hashes retained
  in `E:\NMS-Courier-Research\delivery-routes.json`. Recipe, class, gift and
  slot payloads are schema clues. Re-inspected REWARDTABLE and buildable globals;
  separately inspected fleet globals and expedition reward field names.
- Observed: generic ship rewards have 86 non-freighter gift=true payloads and one
  freighter gift=false payload. Three ship-class and seven weapon-class upgrade
  payloads exist. Ship/weapon slot rewards expose window/token/cost fields.
  There is no demonstrated freighter-targeted class-upgrade call in this evidence.
  Buildable-global inline payloads are outside the collector's generic-entry
  scope; its empty generic count must not be interpreted as missing schemas.
- External reference: NoMansSky.Api inspected at
  `1974810b828802377129a03bb96fa2d6f10ded8a`; GitHub API reports last push in 2023.
  Its C# inventory extension delegates element access, not a demonstrated native
  freighter grant. Frameworks are research references; none installed or run.
- Decision: compare reward gift branches and native acquisition/finalization,
  with independent owned-entity upgrades and per-request generation as candidate
  routes. An offer is no longer mandatory. See [delivery alternatives](DELIVERY_ALTERNATIVES.md)
  for the matrix, order and proof requirements. This is an investigation plan,
  not new production capability or an adopted external dependency.
- Not proven: gift flags bypassing UI, freighter support in ship upgrade rewards,
  any build-180383 native function address/ABI, S/120/60 acquisition, 120 technology
  slots, all-supercharged slots, persistence or remote-player delivery.
- Rollback: no runtime mutations, data-patch installation, save editing, disk
  commands or proprietary-source copying. Only authored research and external
  evidence metadata were generated.

### 2026-10-01: completed corpus summaries and E: storage observation

- Source/configuration: existing batch, navigation and delivery-data tools;
  `runtime/research/summarize-corpus.py` SHA-256 `e91e2662f3e535586db444bb567e668c13b5efb949b962f6167b210245637f54`.
  Offline build 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  compiler/dependencies match the earlier E: extraction entries. No save or
  runtime attachment; trigger was the completed corpus and user summary request.
- Observed: extraction finished at 2026-10-02 00:02:38 UTC (October 1, 21:02:38
  America/Fortaleza). All 97 PAKs processed, 194,641 entries extracted without
  extraction failures, 106,482 MBINs converted/indexed. One conversion failure:
  `metadata/inputtest.mbin` produced no MXML. No retries were attempted.
- Outputs: `E:\NMS-Courier-Research\SUMMARY.md` groups formats and archive outcomes;
  `navigation/` imports 194,641 data filenames, 52 source files and 110 source
  functions. Native exports are unavailable and explicitly warned. Delivery
  evidence covers three tables, one freighter reward and seven model definitions.
- Storage observation: E: Samsung 970 EVO Plus NVMe disk 1 remains Healthy/Online;
  volume Healthy/OK, 163,077,390,336 bytes free before summary generation. System
  queries since extraction start found six storahci event-129 warnings and no
  disk/NVMe/NTFS warnings. The watcher recorded normal worker exit. Physical
  reliability counters were denied CIM access; wear, temperature and uncorrected
  error totals could not be verified. Healthy summaries do not prove hardware
  reliability or establish the cause of the former D: failure.
- Not proven: native executable decompilation, game call identities, physical
  SSD health certification, or runtime integration support for this build.
- Rollback: only external summary/navigation artifacts created; no disk repair,
  encryption changes, game/save/mod changes, or extraction retries. Completion
  notification was delivered and the heartbeat was paused.

### 2026-10-01: full E: corpus rebuild started with conservative limits

- Source/configuration: `runtime/research/bulk-game-data.py`, SHA-256
  `63fa5ba037bdd67c10a7727e1749fef6c1b1cd56a48c04bdab9012425ccffd55`.
  Offline executable build 180383 SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  compiler/dependencies match the three-table pilot above. Start 22:06:13 UTC.
- Trigger/conditions: explicit user authorization to extract all NMS archives.
  Inventory-only inspection found 97 PAKs, 194,641 entries, 106,483 MBIN candidates,
  71,022,968,519 uncompressed bytes. No game attachment or save conditions apply.
  Output `E:\NMS-Courier-Research\corpus`; report mirror/stdout/stderr on C: at
  `%LOCALAPPDATA%\NMSCourier\diagnostics\extraction-e-20261001`.
- Limits: one archive at a time; extraction throttled to 16 MiB/s; three seconds
  between archives; two logical CPUs for the converter; 20 GiB free-space reserve
  monitored during extraction/conversion/indexing. Storage and SQLite errors stop
  the worker rather than continuing to other archives. Unsupported conversions
  are indexed as failures. CPU limiting does not make converter I/O serial.
- Observed at startup: worker PID 17636 running, Precache extraction active,
  stderr empty, exact executable/compiler/dependency fingerprints recorded.
  Thirteen Python tests pass, including converter termination at the reserve.
- Follow-up observation: Precache conversion exited 0 and XML indexing began.
  Compiler affinity mask 3 confirmed two logical CPUs. Windows recorded new
  storahci/RaidPort0 reset warnings; the target remained online/Healthy and maps
  to Samsung NVMe disk 1. No target disk/NVMe event was observed in that query.
  A separate read-only storage monitor, `watch-extraction-storage.ps1`, started
  at 22:09:54 UTC (PID 26056). It can terminate the verified worker/compiler on
  target availability, space, disk-1, NVMe or NTFS failures; unrelated SATA events
  are logged. Its JSONL and stderr must be checked alongside the corpus report.
- First completed archive: Precache has 14,759 extracted entries, all 14,759
  MBINs converted and indexed successfully. MetadataEtc extraction then started;
  this remains partial progress toward the complete 97-archive run.
- Not proven: completion, aggregate conversion coverage, physical disk reliability,
  executable decompilation, or runtime support. Read the external report for live
  status; the initial startup entry must not be treated as completed extraction.
- Rollback: only new external corpus and C: diagnostics created. D:, game assets,
  mods, saves, encryption and storage configuration unchanged. Do not remove a
  live run.lock or start another writer; investigate the logged failure before
  explicitly resuming an interrupted run.

### 2026-10-01: bounded three-table rebuild published on E:

- Source/configuration: `runtime/research/extract-mbin-pilot.py`, source SHA-256
  `c94c5cc511ea0beba19540df0439f9b9e4966506d6b303a6505c2c05c5e0d2b3`;
  executable build 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  Precache SHA-256
  `a6371a8b2f065eca33fd306a16cbe2baca9d4ce75806c71e42f74e1ab9295032`.
  MBINCompiler 7.04.1-pre3 SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`;
  HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5.
- Trigger/conditions: offline CLI, no save or runtime attachment. Three explicit
  logical paths only: REWARDTABLE, INVENTORYTABLE, AISPACESHIPMANAGER. Extracted
  and converted serially on C:, then published one file at a time in
  `E:\NMS-Courier-Research-Pilot-20261001`; independent staging report remains in
  `%LOCALAPPDATA%\NMSCourier\research-staging\pilot-20261001` on C:.
- Observed: all three MXML files parse, and all six published MBIN/MXML files pass
  readback SHA-256 checks. Payload 11,165,040 bytes plus report. MXML hashes match
  the earlier recorded tables. E: maps to Samsung disk 1; Windows reports Healthy,
  with 255,667,372,032 bytes free after publication. The bounded post-run System
  query returned no warning/error events from disk, storahci, stornvme, or Ntfs
  during the preceding five minutes. Earlier disk-0 removal remains a separate
  recorded event; these observations do not establish its cause.
- Failed preflight: both BitLocker status commands were denied access. Their
  output cannot determine E: encryption status. No encryption settings were
  changed. The WindowsApps Python alias could not see the compiler downloaded by
  PowerShell; switching to the direct Python 3.14 runtime resolved the file lookup.
  That first failed attempt stopped before extraction/publication.
- Not proven: whole-corpus reliability, physical disk health, all MBIN mappings,
  native function identities, or runtime delivery support for build 180383. No
  full batch or native decompilation was restarted. Twelve Python tests pass,
  including containment, existing-directory preservation, and converter-budget
  termination fixtures.
- Rollback: no game files, mods, saves, D: files, partitions, or BitLocker settings
  changed. New research files remain available; no automatic cleanup or retry.

### 2026-10-01: external research storage diagnosis; repair blocked by OS privileges

- Scope/configuration: read-only inspection of D:, its research metadata, Windows
  System events, volume/partition information, and process inventory. No corpus or
  native-analysis workers remained active. The affected artifacts belong to the
  previously recorded build 180383 executable fingerprint
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  no game or save was accessed.
- Observed: D: maps to physical disk 0. Windows reported repeated System event 51
  paging-operation errors on `Harddisk0`. Volume and disk health summaries still
  reported Healthy/Online, so those summaries did not exclude actual I/O failures.
  Corpus SQLite/header reads failed; the full 6,434-byte `corpus/report.json`
  consisted of zero bytes, SHA-256
  `068789ae01065e68dd3a1aaaebac7ec6b8c4665f312cdfca93a14280ab60d13f`.
  Native report/log reads also failed. The specific hardware or filesystem cause
  is not established by these observations.
- Preservation: copied the readable zero-filled report verbatim to local C:
  diagnostics with a JSON diagnosis record. Inaccessible database/native files
  remain untouched; a complete backup could not be claimed. No further research
  writes were initiated on D:.
- Reproduction: `Get-Partition -DriveLetter D`, `Get-Disk`, `Get-Volume -DriveLetter D`,
  and `Get-WinEvent -FilterHashtable @{LogName='System'; Id=51}` expose the mapping
  and events. Python binary reads identify the zero-filled report without dumping
  assets. Read-only `chkdsk D:` and `fsutil dirty query D:` returned access denied;
  storage reliability counters also denied CIM access.
- Limits/rollback: OS privileges prevented filesystem verification/repair in this
  session. No format, forced dismount, filesystem modification, deletion, guessed
  SQLite repair, or research re-extraction was performed. An elevated storage
  diagnosis and preservation of other important D: data precede any repair or
  regeneration. The zero-filled report has no original JSON content to recover;
  rebuilding it would require verified retained metadata or a new extraction.

### 2026-10-01: research navigation map and unavailable external imports

- Configuration: [navigation index](RESEARCH_INDEX.md),
  [generator](../runtime/research/build-research-index.py) SHA-256
  `02a2210bf4696269fcb4c36534a480454415887c94aa5ebef2e6f2320f2a1be9`,
  and [synthetic validation](../runtime/research/validate-navigation-index.py).
  The external metadata belongs to the previously recorded 180383 executable
  fingerprint `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  this navigation operation did not read or attach to the executable or a save.
- Trigger: build repository-source, corpus-file, and Ghidra-function navigation
  metadata with bounded FTS queries; source links are preserved with line numbers.
  Generated SQLite/JSON/Markdown outputs used a disposable local temporary directory
  because external inputs in D: could not be read reliably.
- Observed: 48 repository source files and 99 source-function entries were indexed.
  Corpus SQLite returned `disk I/O error`; its report could not be parsed as JSON;
  native report/export reads also failed. Failed imports were rolled back and
  reported, so no external asset or native-function counts were invented.
- Validation: synthetic fixtures passed complete import, one-result filtered search,
  executable-fingerprint/RVA preservation, rebuild, and rollback after a partially
  imported malformed native TSV. An initial check exposed permissive malformed-row
  handling; explicit required-field/RVA validation fixed it before the passing run.
- Limits/rollback: Python entries use AST, C entries use signature matching, and
  topic labels use keywords. None proves a game function's identity or runtime
  safety. No game, mod, bridge, corpus asset, or save was changed. Storage repair
  and final native-analysis results remain unresolved; the generated source map
  and import code remain reproducible without the external files.

### 2026-10-01: resumed offline research and Pirate model reference

- Build: installed executable 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  No save or running-game test was needed. The user was unavailable for live tests.
- Source/configuration: [research scripts](../runtime/research/README.md), pinned
  HGPAKtool/MBINCompiler above, Ghidra 12.1.4 ZIP SHA-256
  `ddac49f903da9d5bac833e5cc79395098b9c33cfd3279be5f31bd00387d2d4db`, portable
  Temurin JDK 25.0.4.1+1 ZIP SHA-256
  `00c847d804f4a78e9f04f2683faf14fed898535b177b7fc704486cb0284e9283`.
  The Adoptium API returned HTTP 403; the official GitHub release and its checksum
  provided the pinned JDK instead. No global Java configuration was changed.
- Trigger/observations: resumed the 97-PAK batch with delivery tables prioritized;
  all 14,759 Precache MBIN candidates converted/indexed successfully. Nine unit
  checks passed, including malformed interrupted XML and numeric index filtering.
  The Ghidra Java exporter compiled against the downloaded release with exit zero;
  full headless executable analysis was started separately and remains pending.
- Concrete data discovery: the three-table summarizer found reward `RS_S13_S4M6`,
  seven freighter AI model entries, and unchanged FreighterLarge generation bounds.
  Model `FREIGHTER_CAPITAL_PIRATE` references the actual Pirate scene; its existence
  was independently confirmed in the EntitySceneMBIN archive (821,912 bytes).
  Table and PAK hashes are recorded in [research decisions](RESEARCH_AND_DECISIONS.md#offline-corpus-and-native-analysis-build-180383).
- Offline reward experiment: [the Pirate variant](../runtime/mods/freighter_pirate_model_research/README.md),
  source SHA-256 `6dd9e3c84f7b2357811ce51290c3858d481a4cbac5bf0974e1f5bd395f2ff62b`,
  compiled/decompiled with exit zero. Assertions retained Pirate scene, requested
  seed, S inventory class, 10 × 12 cargo, 60 technology request, and zero cost.
- Limits/rollback: no game executable, bridge, installed mod, or save was changed.
  No offer was sent. Source variants are uninstalled; schema retention and model
  existence do not prove a Pirate/S-class offer, slot unlocking, or supercharging.
  The remaining archive conversions and native candidate exports are still pending;
  consult external reports for eventual results rather than treating launch as completion.
- Indexing correction: a full-scan FTS cleanup per asset slowed the first metadata
  indexing attempt. The exact corpus worker was stopped, then restarted with an
  ordinary archive/path-to-rowid key table; existing indexed rows were migrated.
  Migration, replacement, cross-archive isolation, and repeated-slot preservation
  passed the nine-test suite. Converted assets were retained.
- Conversion failure: `metadata/inputtest.mbin` (560,144 bytes) was rejected as
  invalid MBIN. Its header starts `cccccccc00000000` and names `TkInputFrameArray`.
  The failure is recorded; no guessed header repair or fabricated conversion was
  used. MetadataEtc's converter reported 49,946 conversions and one failure;
  index validation remains the authority for individual success records.
- Extended reward evidence: the generic table supplied concrete slots, gift
  weapon, installed-tech, and UI-message payloads, with IDs and bounded examples.
  These offline schema findings are documented in research decisions and are not
  advertised as tested capabilities.
- Checkpoint after the indexing correction: Precache had 14,759 successful XML
  index records; MetadataEtc finished with 49,946 successes and the one input-test
  failure. All 49,947 MetadataEtc binary assets extracted successfully. The batch
  advanced to EntitySceneMBIN, SHA-256
  `58958536e58dfaeb81e0423b5508c7d3dbf3713bac09e857577feb275d9f2627`.
  No remaining PAKs are declared complete at this checkpoint.
- Native analysis checkpoint: Ghidra remained active beyond the requested analysis
  timeout, with its main thread waiting for `ConstantPropagationAnalyzer` parallel
  work. Its diagnostics also reported missing PDB, an invalid embedded PNG, and
  failed disassembly paths. These are recorded analysis limitations, not game
  crashes or verified function identities; final native exports remain pending.

### 2026-10-01: resumable bulk-data corpus

- Source/configuration: [bulk-game-data.py](../runtime/research/bulk-game-data.py),
  HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5, development Python 3.14.7, and
  MBINCompiler 7.04.1-pre3 SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`.
- Trigger/conditions: read-only scan of installed `GAMEDATA/PCBANKS`; no save read,
  runtime attachment, reward trigger, mod installation, or executable write.
  Compiler conversion uses explicit MBIN input/MXML output and an empty exclude
  filter, so its default geometry/language exclusions do not silently omit data.
- Observed: four reward/inventory-related tables converted successfully and a
  separate `.GEOMETRY.MBIN.PC` candidate produced validly named `.GEOMETRY.MXML`.
  Unit checks passed for traversal/drive/alternate-stream rejection, XML symbol
  extraction, malformed XML rejection, and observed geometry output naming.
  An isolated end-to-end D: validation corpus extracted and converted all six
  files in `NMSARC.MeshPlanetSKY.pak` (archive SHA-256
  `f7ae7fd21fe7c93bed2f269b474bcb25014f105cdd4129c393731430f3eefebb`). A second run
  reused all six records without invoking conversion, and an FTS query for
  `IndexCount` returned the corresponding generated MXML paths.
- Failed/revised approach: resolving every individual destination against the
  filesystem was too slow on a 49,947-entry archive. The pilot was stopped and
  replaced by lexical traversal rejection plus cached parent-directory containment
  checks during writes. The revised extraction recorded over 25,000 successful
  files without an extraction error before the user requested moving work to D:.
- Storage/rollback state: research tools were moved to
  `D:\NMS-Courier-Research\tools`. The partial C: corpus and small pilot outputs
  were relocated to `D:\NMS-Courier-Research\previous-pilot` because recursive
  deletion was rejected by automatic command review. A fresh full run was started
  against all 97 PAKs in `D:\NMS-Courier-Research\corpus`; the previous generated
  directory on C: no longer exists. Its `report.json` and
  `index.sqlite` are transient local evidence. Extraction/decompilation completion
  and compatibility across all MBIN types are not yet proven. Installed game files
  and saves were not changed; no old-build mutation was attempted on build 180383.

| Date | Experiment and trigger | Observed result | Boundary or rejected hypothesis |
| --- | --- | --- | --- |
| 2026-09-22/23 | Native XInput startup proxy, exact-build `cGcApplication.Update` hook | Game loaded and one read-only run observed 7,319 callbacks | A callback is not a delivery command channel. Python/pyMHF's earlier authentication did not reliably produce callbacks in later test processes. |
| 2026-09-23 | One native `cGcInventoryStore.Add` call for `FUEL1 ×500` | User saw a second Carbon stack; total went 15 → 515 and persisted after normal reload | No native pickup notification or automatic stack merge was proven. |
| 2026-09-23 | One-shot `GiveGenericReward` IDs for Units, Nanites, Quicksilver | User confirmed +1,000,000,000 of each, right-side native notifications, and normal-save persistence | The test DLL uses named events, not the authenticated Electron command channel. |
| 2026-09-23 | First freighter-specific reward from normal gameplay | Free acquisition offer opened; user accepted C-class freighter. Units balance stayed unchanged. Read-only owned inventory later showed 35 valid main and 13 valid technology slots. | Reward's S class and 120 layout values did not configure the offer. The 21-position technology grid was not 21 unlocked slots. |
| 2026-09-23/24 | Startup with a separate `FreighterOfferTest` DLL | NMS showed a hang/modification error before startup/hook diagnostics. No offer was sent. Known-good DLL was restored. | Passing the isolated fixture did not prove safe game startup. Do not reinstall this rejected DLL unchanged. |
| 2026-09-24 | Scoped live generation-table values set to 120/60 and S=100 only during reward dispatch | One offer remained C class, 35 cargo positions, 21 technology grid positions. User declined. Original table bytes were observed after the call. | The reward callback was too late or ignored these generation fields. This is not a per-offer solution. |
| 2026-09-24 | Explicit reward inventory width 10, height 12, `NumSlotsFromTech=60`, FreighterLarge override | One offer showed C class, 120 cargo grid positions and 30 technology grid positions. User closed it without accepting. Owned freighter remained C/35/13. | Cargo grid dimensions affected UI; 120 valid cargo slots, S class, 60 technology slots, and supercharged slots were not proven. The C-class technology cap in the extracted table is 30. |
| 2026-09-24 | Fresh-process repeat of the explicit offer, one event in PID 13152 | Before dispatch, the loaded owned freighter was C/35 main and 13 technology valid slots, and the frontend store was empty. During the open offer, the user confirmed C/120 cargo/30 technology. The frontend stores read C class, 120 valid main-grid bits and 30 valid technology-grid bits; the player-state main store also temporarily read C/120 while the offer UI was open. The user declined, then manually closed the game. | The player-state header is not a reliable ownership check while this preview is open. The process ended before a post-decline read, so this repeat did not prove what was restored or saved. No crash was reported, and no second event was dispatched. |
| 2026-09-24 | Preflight for a new class-generation-window test in PID 8544 | New process had a ready callback and unused reward event. With the frontend offer stores empty and **before any new dispatch**, the player-state freighter main store read C/120 while its technology store still read C/13. The original test script's C/35/13 precondition would have rejected this state. The user then closed the game to leave; no class probabilities or reward were changed in this process. | The user later clarified that they had replaced their freighter with a previous C/120 offer. The read was therefore consistent with the reported ownership change; it was not evidence that declining an offer changed the save. |
| 2026-09-24 | Fresh-process read-only preflight in PID 17828 | Verified executable, installed DLL, and reward patch hashes; callback and one-shot event were ready. After the save loaded, the player-state freighter stores read C/120 valid cargo bits and C/13 valid technology bits; all three frontend offer stores remained empty 1 × 1 placeholders. The user clarified they had accepted a prior C/120 offer and replaced the original freighter. No reward or class-probability mutation was triggered during this read. | This explains the changed owned-cargo reading. It does not prove that the new class-window experiment can yield S class, 60 technology slots, or supercharged slots. |
| 2026-09-24 | First class-window script attempt in PID 17828, before reward dispatch | The temporary probability write was issued, but its readback failed because PowerShell could not resolve the generic `SequenceEqual` overload. `finally` issued the baseline restoration; independent read-only inspection then found all four probability rows at their original values, frontend offer stores empty, and one-shot state still `0`. The verifier was replaced with byte-by-byte comparison. | **No offer was sent.** The exception was a verifier defect, not evidence about freighter class generation. Do not infer a reward outcome from this attempt. |
| 2026-09-24 | Corrected class-generation window in PID 17828, one explicit reward event | Exact-build preflight passed with owned C/120/13 and an empty frontend offer store. The script temporarily set the four shared economy class-probability rows to S=100, signaled one reward, observed frontend C/120/30, and restored the original rows. A separate read-only inspection verified all original probabilities and the offer's C/120/30 inventory headers; the user supplied a screenshot confirming C/120/30 in the game. The one-shot state became `2`. The user declined; a subsequent read still showed owned C/120/13. | Temporarily changing those probability rows **did not produce S class** for this offer. It does not identify whether class was selected before the window or by a separate path. The frontend stores retained stale C/120/30 headers after decline, so nonempty headers alone cannot prove an offer remains open. |
| 2026-09-24 | Temporary frontend offer-class probe in PID 26640 | A fresh exact-build process loaded the same disposable save with owned C/120/13 and empty offer stores. One explicit reward event opened C/120/30; the user kept the offer open. [The probe script](../runtime/native/asi/probe-freighter-offer-class.ps1) passed its active-offer preflight, set only the two frontend inventory class fields to S for eight seconds, read both fields as S on every second, and restored both C fields. Independent post-probe inspection found owned C/120/13, frontend C/120/30, and baseline class probabilities. The user reported the visible badge remained C throughout, then declined. A further read confirmed owned C/120/13; the frontend technology-store element count fell from 2 to 0. | The two observed frontend class headers are not sufficient to update the already displayed class badge. This does not rule out an earlier initialization/copy path or a separate UI model. No S-class offer or ownership was achieved. The stale C/120/30 frontend headers again remained after decline. |
| 2026-09-24 | Read-only reference-save comparison in PID 26640 | The user loaded a separate, previously modified reference save in the same verified process. The owned freighter main and technology inventories read C class; both had 10 × 12 grids and 120 valid bits. The technology store contained 540 `TechBonus` special-slot entries, covering exactly 120 unique coordinates inside the grid. Freighter cargo index 9 was empty and carried an S class header, which did not match the visible main/technology C class. No Courier event or process-memory write was performed in this save. | This demonstrates that this save can load 120 valid technology positions and 120 unique technology-bonus positions, but the 540 entries include duplicates and do not prove a clean vanilla generation path, an S-class freighter, or Courier delivery. The user is independently changing this reference save to S for a before/after comparison; Courier must still use a live delivery path. |
| 2026-09-24 | User-edited reference save reloaded in PID 4548, read-only comparison | The user independently changed the reference freighter to S with a save editor and reloaded it. The same exact executable and installed Courier test files were present; no Courier event was signaled. The owned main and technology inventories changed from C to S, while both retained 10 × 12 grids with 120 valid bits. Technology retained 540 `TechBonus` records over 120 unique in-grid coordinates. The user confirmed the visible freighter badge now shows S. | This verifies the reference save's S presentation and the live header values after an external save edit. It is **not** a Courier delivery method or evidence that changing an already open offer's headers will update its cached badge. Courier did not edit this save. |
| 2026-09-24 | Offline exact-executable frontend signature search | [The read-only locator](../runtime/native/asi/locate-frontend-hooks.py) used the pinned NMS.py `cGcFrontendManager` signatures and required the build 179666 executable hash. It found one `.text` match for `QueueFrontendPage` at RVA `0x3EB4D0` and one for `RenderPage` at RVA `0x900710`. No running process or save was touched. | Unique signature matches are research candidates, not live-verified function identities, safe hook sites, or a class setter. No DLL using these addresses has been compiled or installed. |
| 2026-09-24 | Offline frontend call-site analysis and read-only reference-save queue check | The hash-checked locator found two possible direct calls to `QueueFrontendPage`; disassembly with [the pinned-executable function inspector](../runtime/native/asi/inspect-executable-function.py) confirmed a call at RVA `0x1062E0F` with page argument `5`. The candidate queue routine writes a three-entry ring. A new optional queue read in the running S-class reference save, PID 4548, showed all three entries empty (`-1`), next index `0`, and owned S/120 cargo/120 technology unchanged. No Courier event, process write, or save edit occurred. | Static call proximity and a page number do not identify the freighter-offer path. The queue was observed only while idle, not during offer creation. Byte-level call-site candidates require instruction-boundary checks; the disassembled `0x1062E0F` call passed that check. No new hook has been installed. |
| 2026-09-24 | External read-only frontend watcher baseline in PID 4548 | [The exact-hash-checked watcher](../runtime/native/asi/watch-freighter-offer.py) polled the reference save for two seconds at a requested 5 ms interval: 347 samples, one initial state, no transition. All three queued pages were `-1`; both frontend offer stores were empty 1 × 1 placeholders, class header C, zero elements. No game-memory writes, reward signal, or save access occurred. | This confirms the watcher's idle baseline on the reference save, not its ability to capture a brief offer transition. The next observation belongs on the disposable save before and during one new offer; a missed page transition is possible with polling. |
| 2026-09-24 | Disposable-save offer timing watch, one explicit reward in PID 17696 | The installed executable (`b7913f26…`), bridge (`f20d9b41…`), and reward EXML (`62840d28…`) matched the pinned full hashes above. Loaded-save read showed owned C/120 valid cargo/13 valid technology, personal Carbon 515, empty frontend stores, and unused one-shot state `0`; the new no-signal preflight passed. The watcher started before one `COURIER_QS` event. Across 8,591 samples in 55 seconds, it logged one transition at 22,165 ms: queue index `0→1` and frontend store 0 changing from 1 × 1 to C/10 × 12/120. Every captured queue entry remained `-1`, so the page number was missed. The user confirmed the resulting offer visually as C/120 cargo/30 technology. A separate read found frontend store 2 at C/10 × 3/30 valid bits. The event reached state `2` and was not repeated. The user declined; owned state remained C/120/13, while stale frontend C/120/30 headers persisted. | Queue-index movement coincides with offer creation, but does not prove page `5` or identify the class initialization function. The first watcher version accidentally sampled frontend store 1 as “technology”; after correction it reads all three stores. The frontend technology element count changed from 2 to 0 while the user still reported the offer open, so that count is **not** a reliable active-offer guard. No S, Pirate model, 60/120 technology slots, or supercharged offer was delivered. |
| 2026-09-24 | Offline audit of four supplied mod archives and default-seed source update | Inspected the exact user-supplied ZIPs without installing or copying third-party assets: OnlyS SHA-256 `7326f3b9f4cbfde3f866f50df76870cf32937a1a26731aa6183bad19ee027c19`, SquareSCSlots `469913b90e97e591760fc551496e883b34a8f80999e61b033fcf72a3061caeab`, Season Rewards Unlocker `f460b115497c863f41da5bca3876ce4e7b3406fe8a4f203c696665b2514912d6`, Meta-Mod `9e03f6604fb10a248f8e499b7a6658253684b9bc297b788b1e2f4f90630fb771`. Read Lua source, packaged fragments/assets, and target MBIN paths. OnlyS variants change shared generation tables; Season and Meta wire in-game menu actions to `GcRewardAction`. The two uninstalled Courier reward source variants now contain the requested seed `0x1AD0003900054` as decimal `471690548084820`. No running process, installed EXML, DLL, or save was changed by this audit. | These archives do not prove an external per-offer class/model setter. SquareSCSlots does not raise the freighter supercharged-slot count beyond four. Meta-Mod's custom-seed generator is commented out. The Courier source still uses the ordinary procedural freighter scene; the seed does not prove Pirate type. The updated reward source has not been compiled, installed, or tested in game. Full analysis is in [runtime research](RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666). |
| 2026-09-24 | Offline `NumSlotsFromTech=120` reward and full-copy inventory-table control | MBINCompiler 7.04.0.1 round trips retained 120 in the reward, S technology cap 120, and FreighterLarge 10 × 12 technology bounds in the control | Serialization is not in-game support. The full-copy control includes global generation changes and was never installed. |
| 2026-09-24 | Sparse named `INVENTORYTABLE.EXML` array targeting check | Round trip placed requested FreighterLarge values into the first SciSmall array entry | Sparse inventory-table patch was removed from the repository and must not be installed. Use complete ordered data or a verified property-targeted builder. |

## Next reproducible gate

The specific freighter offer can be opened free of charge from ordinary gameplay, but its class is still generated as C. Determine the native path that creates or initializes **that particular offered freighter**. Use read-only inspection before any targeted mutation. Verify S class, 120 **valid/unlocked** cargo slots, and 60 valid technology slots in the offer and after acceptance. Only then assess a 120-technology experiment, because the vanilla S cap is 60 and the game may clamp or reject larger grids. Supercharged slots are a separate field and require separate evidence. Do not repeat a one-shot event in the same process or install a broad all-freighters generation patch to make this test appear successful.

The [class-generation window script](../runtime/native/asi/signal-freighter-class-window-test.ps1) now has a recorded negative live result: an S=100 window surrounding reward dispatch still yielded a C-class offer, and the original probability bytes were restored. `-PreflightOnly` checks the exact-build conditions without writing or dispatching. Do not repeat the same class-probability hypothesis. Investigate where the particular freighter's class is initialized or copied into the offered inventory; test any proposed hook on this verified build and keep global generation unchanged outside a bounded diagnostic. No automatic retry of the consumed one-shot event is permitted.

The [offer-class probe](../runtime/native/asi/probe-freighter-offer-class.ps1) also has a negative live result: both temporary frontend inventory class fields read S for eight seconds, but the user's badge remained C. The probe restored the original values and did not change the owned freighter. Do not repeat this same two-field mutation as a class solution. The active-offer marker (technology-store element count) dropped to zero after prior decline and rejected stale headers during the PID 17828 preflight; it is a diagnostic guard, not a full UI-state API. The next research target is the actual game state or function that sets the visible offered class before the offer screen opens, with read-only instrumentation first.
