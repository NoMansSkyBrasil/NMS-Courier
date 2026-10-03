# Runtime experiment log

This is the short entry point for resuming exact-build research. Detailed reasoning belongs in [runtime research](RESEARCH_AND_DECISIONS.md), implementation contracts in [protocol and runtime](PROTOCOL_AND_RUNTIME.md), and current tasks in [TODO](../TODO.md). Entries describe observations, not general compatibility claims. All live tests used the user's disposable local save; none used save-file editing.


## 2026-10-02: service-client, public tooling and independent .NET assessment

- Build/context: installed research target 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  This pass did not inspect or mutate a running game. The user will test later.
- Source/configuration: supplied HTML SHA-256
  `cc289ebd09f65a3cd88b856e8c9a32949f0e6e516c6e80f1d62869cf9f0b4340`,
  five pinned public repositories, selected raw files and read-only public pages;
  exact revisions/hashes and bounded tooling are documented in
  [the service assessment](METAIDEA_SERVICE_RESEARCH.md). SDK 10.0.400,
  `InspectNativeCandidates.cs`, built-in PEReader/SHA-256; no NuGet packages.
- Trigger/save conditions: static HTML/code parsing, bounded HTTPS GETs and five
  offline PE candidates. No service POST, login, downloaded-script execution,
  plugin installation, save access, callback arming or game mutation.
- Observed: ship commands include class options; freighter commands do not.
  Sharing Center multitools explicitly require the extender. Public Transcender
  documentation describes native exchange popups and claim/buy handling. Public
  builders patch data files rather than expose the private bot. The independent
  C# reader validated candidate bytes/unwind starts at f12240, f27cd0, f31490,
  8e3a10 and 4cea20. Python independently matched all five entry byte sequences
  and unwind bounds. Three static-client tests and three native-index tests passed;
  refreshed navigation has 66 source files, 143 functions and no import warnings.
- Not proven/rejected: private backend, multiplayer replication, free claim,
  freighter S/configuration, exact DLL implementation and runtime ABI remain
  unknown. A site label or missing option is not an engine-wide impossibility.
  Large pages exceeded web-reader limits; bounded direct GETs succeeded. Initial
  exploratory output hit console encoding limits, so UTF-8 output was used.
  Negative C# cases initially threw uncaught InvalidDataException; explicit
  handling corrected them and both now reject with exit 1 and no stack dump.
- Rollback: none required. All third-party snapshots/reports remain external.
  Only Courier research tooling, documentation and TODO priorities changed;
  no installed game files, disk settings or delivery outcomes changed. No private
  bot backend or MetaIdea extender implementation is planned.

## 2026-10-02: bounded capability metadata and handler mapping

- Build: 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Source/configuration: exact-name scanner, ten GcReward names, pinned NMS.py
  database, Capstone 5.0.5, Ghidra 12.1.4/JDK 25.0.4.1+1;
  metadata seeds SHA-256 `3ccbb33c619978c6f9d59fa1d7880f2f7b232e448446639c296e0b9f957edeb5`,
  handler seeds SHA-256 `10600b0934648b58557fc7bd3f972a372b753729a29fd59d8038bd3c20899397`.
- Trigger/save conditions: two offline -noanalysis exports, two CPUs, existing
  external project; 17 seconds each. No save, process attachment or runtime command.
- Observed: all ten names present; ten metadata and nine handler exports completed,
  bringing the index to 65 unique candidates. Nine exact getter/tag comparisons
  connect dispatcher branches to slot, upgrade, technology and unlock handlers.
  FreighterSlot opens an upgrade purchase window with a cost reference;
  UpgradeShipClass updates class and regenerates three owned ship inventory stores.
  See [native acquisition research](NATIVE_ACQUISITION_RESEARCH.md).
- Not proven/rejected: InventorySlots metadata reference is a split-function
  fragment, so no tag/handler was inferred. An exploratory label regex initially
  stopped at the earlier word candidate; exact GcReward labels corrected the report.
  Slot tokens/windows do not prove unlocked slots; recipe, install, unlock and
  acquisition remain distinct. No ABI, free claim or persistence proof.
- Rollback: none required; bounded external exports and repository research only.
  No disk commands, D: access, installed-file changes or live mutation. A local
  documentation edit initially failed decoding UTF-8 under the default codepage;
  the explicit UTF-8 edit succeeded without touching game data.

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

### 2026-10-02: explicit class-observation arming installed

- Build: the same verified 180383 executable. Process 19008's completed observer
  could not sample the NPC trade screen opened afterward. The user reported B;
  the supplied screenshot shows the ship named Voz de Kamots with a B badge.
  This is UI evidence only, not correlation with earlier argument counters.
- Source/configuration: `callback_observer_180383.c` now waits for a random,
  process-specific local event before enabling the class candidate detour.
  `signal-class-observer.ps1` requires the exact executable fingerprint, intended
  installed DLL hash, matching log PID, awaiting status and validated event name.
  The event starts observation only; no reward, class or inventory command exists.
  Awaiting time is bounded to 30 minutes; sampling remains ten minutes from the
  signal. Fixture-only startup bypass remains excluded from production.
- Validation: strict native compilation and PowerShell parsing passed. The armed
  fixture forwarded 400 original calls before signaling with zero sampled class
  arguments, then 400 more original calls after signaling, with 80 in each bucket.
  All eight arguments and original returns were preserved; both original
  functions had 800 calls. Production fake PID 24304 logged unsupported build,
  forwarded all 400 original Update calls and created no observer log. The signal
  script rejected process 19008 without signaling because the user had closed
  it before the check. This verifies absent-process rejection, not the intended
  expired-status branch; that separate branch remains untested.
- Prepared production DLL SHA-256:
  `f22a1d533ff54465bb775da2c910c2fe18b8ecf200e9fb20562a1ec6b89ce9d7`.
  External staging: `class-observer-armed-180383-20261002`. After the user closed
  NMS, executable, old DLL, prepared DLL and backup hashes were verified. The old
  automatic observer was preserved as `previous-automatic-class-observer.dll`,
  the new DLL installed, and destination readback matched. MODS remains empty.
  The user was invited to reopen and prepare an NPC comparison before signaling.
- Not proven: NPC comparison correlation, S-class
  freighter delivery, price, ownership or persistence. Merely reopening a cached
  offer may not invoke the stat-generation candidate.
- Live arming: new process 23212 reported the exact executable fingerprint,
  awaiting status and 6,115 Update callbacks after the user confirmed loaded-save
  station readiness. The hash-guarded script signaled observation once. The next
  read confirmed both hooks observing, class hook status zero and all class
  counters initially zero; Update then reached 7,162 calls. Immediate class-log
  reading raced its creation, but the subsequent diagnostic confirmed activation;
  no second signal was sent. The NPC comparison sequence is recorded below.
- NPC observation: the user opened a B-class comparison with sampling active.
  The first read showed 0/1/2/3/other counts 9/3/6/0/0 and 14,110 Update calls.
  Before a requested single close/reopen of the same B comparison, the sample
  was 12/3/9/0/0 with 17,121 Update calls. Other buckets changing while discussing
  a B screen show why aggregate counters cannot identify a particular entity.
  No class mutation or purchase occurred in this experiment. A B badge is not
  evidence that every captured argument in that interval belongs to that ship.
  After the user confirmed a single close/reopen of the same B screen, counters
  were 18/12/15/0/0 with 28,327 Update calls. Final timed removal reported
  `observation_complete`, hook status zero, 21/12/18/0/0 and 31,846 Update calls.
  This completes the observation window, not an S-class delivery test. Caller
  attribution is required before a generation change can be scoped safely.
- Rollback: retain the previous observation DLL and exact-hash backups; replace
  only with NMS closed. No data patch or save change is part of this experiment.

### 2026-10-02: bounded class caller tracing fixture-tested and installed

- Target fingerprint: build 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  The completed aggregate B-screen observation above motivated caller capture.
- Source/configuration: `class_observer_180383.c`, `.S`, and
  `tests/class_observer_fixture.c`; `ClassObserver180383` mode retains explicit
  arming, the existing verified prologue and the ten-minute sampling limit.
  Prepared production DLL SHA-256:
  `f9379312f6676d03634cf29a239c1744df59164761d8dfcd13d84ba87a01f0fa`.
  The detour records the existing return address and unchanged R9D value into
  DLL-owned storage, preserving scratch registers, flags and stack arguments.
  No game object dereference, reward dispatch, class change or save access occurs.
- Bound: 2,048 records, no allocation or file I/O in the detour. Atomic reservation
  and publication prevent a partial record from being consumed by the worker.
  Excess calls are counted as dropped samples and still forwarded. The worker
  publishes relative executable caller addresses in a separate TSV; callers
  outside the executable are labelled `external` without writing raw addresses.
- Tests: strict LLVM 23.1.2 compilation passed. The armed fake-host fixture first
  made 400 calls with no records before signaling, then collected 400 calls with
  80 per argument bucket. A further 2,000 calls preserved arguments and returns;
  all 2,800 original calls completed. Published TSV had 2,048 rows, 2,400 attempted
  samples, 352 dropped and two distinct fixture caller RVAs (400 and 1,648 rows).
  The production-mode DLL rejected fake NMS PID 3512 as `unsupported_build` while
  its 400 original Update calls completed normally.
- Failed setup: the first fixture was named `class-fixture.exe`, so the executable
  identity gate rejected it and the host returned 11 when its expected log was
  absent. Renaming the isolated host to `NMS.exe` resolved this fixture setup error;
  the identity check was retained. Fixture-only build bypasses remain forbidden
  for game deployment.
- Not proven: the captured caller does not identify a particular entity by
  itself, and no S/Pirate/max-slot freighter was delivered.
- Installation: after the user confirmed NMS closed, absence of its process was
  checked twice. Executable, previous aggregate observer and prepared DLL hashes
  matched; the MODS directory contained no files. The previous DLL was backed up
  with hash readback, then the new DLL was copied and its installed hash verified.
  Loaded-save execution was subsequently observed in PID 20456: startup reported
  the exact executable fingerprint, Update hook status zero and 10,798 callbacks
  while awaiting the signal. After the user confirmed save readiness, the guarded
  script signaled once. The class hook reported `observing`, status zero, all five
  counters zero, and the caller TSV reported zero attempted/dropped samples.
  The process was responding. An NPC comparison was requested after this baseline;
  no class/offer correlation or mutation has been established in this process.
  With the user reporting a C comparison open, six records shared return RVA
  `0x4cd226`: three argument-0 and three argument-2 calls. A later sample during
  the requested alternative B comparison had 24 records (12/9/3/0/0), all from
  the same caller and no dropped samples. Continued sampling reached 33 records
  (15/12/6/0/0). These are interval snapshots, not per-ship event counts; multiple
  buckets changed and a unique B record has not been identified. No buying,
  exchanging or Courier delivery command was requested.
  A later status snapshot reached 39 calls (18/12/6/3/0), with hook status zero
  and the process responding. Argument 3 appearing in an ongoing sample is not
  evidence that the user's open B ship changed to S; no mutation occurred.
- Rollback: the completed aggregate-only observer, SHA-256
  `f22a1d533ff54465bb775da2c910c2fe18b8ecf200e9fb20562a1ec6b89ce9d7`,
  is preserved in external C: research staging. No data patch, game-memory
  mutation, save edit or disk-maintenance command was part of this work.

### 2026-10-02: observed class caller inspected offline

- Fingerprint: the same pinned build 180383 executable above. Source/configuration:
  `inspect-executable-function.py --build 180383`, existing PE section parser and
  Capstone 5.0.5; bounded unwind-aware inspection at `0x4cd226`, `0x4cd112` and
  `0x4cd14c`. The inspector now accepts only the two explicitly pinned build
  choices; its previous 179666 default is preserved.
- Trigger/conditions: follow-up to the read-only NPC caller samples in PID 20456;
  offline executable reads only, no native invocation or process/save write.
- Observed: `0x4cd221` calls wrapper `0x4ccfa0`, giving return RVA `0x4cd226`.
  The wrapper loads R9D from `[rdi+0x100]`, restores its frame and tail-jumps to
  stat generation `0x4cea20`. This explains why the live caller is outside the
  wrapper and locates an existing class input for ordinary inventory generation.
  Current-build slice inspection passed; using the old default against the new
  executable rejected the fingerprint with exit 2 before disassembly.
- Not proven: the observed source field is not a runtime-validated object layout
  or setter. Ordinary NPC observations do not establish the Courier freighter
  request path, S-class display, model, slots, price or persistence. Detailed
  findings and reproducible commands are in native acquisition research.
- Rollback: no install, class mutation or save change was made by this inspection.

### 2026-10-02: Utopia expedition S reward compared with freighter configuration

- Fingerprint: current build 180383, executable `671de226...` (full hash above).
  Source/configuration: hash-checked extracted reward MXML `8ed7ae90...`, Courier
  explicit freighter source `a797679f...`, updated read-only generation audit,
  and existing exact-build `setup-export/8e3a10.c`. Full source hashes and the
  field comparison are in native acquisition research.
- Trigger/conditions: user supplied an S-badge Utopia Speeder offer screenshot
  and requested comparison of the native expedition path. XML and existing
  pseudocode were read offline; no claim, purchase, grant or save edit was sent.
- Observed: `RS_S9_SHIP` and `RS_S9_COMPLETE` declare Fighter/S, gift and reward
  flags true, 36 layout slots and FgtLarge. Courier source also declares S but
  Freighter and gift false. Original `RS_S13_S4M6` declares Freighter/B. The
  ordinary supplied-inventory setup branch copies class and generates matching
  stats; the freighter branch lacks that observed class copy and supplies zero.
  The expanded audit produced bounded Utopia/freighter samples and found no
  Courier reward-ID collision with the original table.
- Sampling checkpoint: PID 20456 completed normally with both hook statuses zero,
  51 records, no dropped samples, 24/12/6/9/0 class arguments and 29,918 Update
  callbacks. The final TSV includes three argument-3 records at each of
  `0x8e47bb`, `0x8e47e5` and `0x8e4813`, matching the supplied-inventory ship
  reward branch, plus ordinary wrapper callers `0x4cd226` and `0x4cd351`.
  Earlier interval samples contained only the first wrapper; they must not replace
  the final trace. The specific Utopia offer remains uncorrelated without timing
  or entity evidence, but S-input reward-setup calls were observed live.
- Not proven: complete flag-to-ABI mapping, `IsGift` as a freighter class fix,
  request-scoped S/Pirate/max-slot generation, or persistence. No reward data or
  installed DLL was changed; the next native scope target is reward initialization.

### 2026-10-02: offline flag mapping and expanded capability inventory

- Build/source: pinned 180383 executable above; repository seed lists
  `reward-flags-180383.tsv` and `reward-fields-180383.tsv`, existing bounded Ghidra
  launcher, Ghidra 12.1.4 and JDK 25.0.4.1+1. The three-function rewardflags pass
  completed in 28 seconds; the two-function rewardfields pass in 17 seconds, all
  five manifest rows successful. No whole-program analysis or fresh extraction.
- Conditions: user requested offline research and no further live tests today.
  Existing C: tools and E: project/corpus were used. No game, DLL, patch or save
  mutation; no disk repair, encryption changes or D: access.
- Observed: serializer `0x24f00d0` names payload +0x24d IsGift, +0x24e IsRewardShip,
  +0x24c FormatAsSeasonal and +0x24f UseOverrideSizeType. Bounded ASCII reference
  resolution and exact wrapper disassembly show core `param_10` is IsRewardShip,
  not IsGift. Gift status reaches core argument 9/object +0x21 separately.
  The earlier gift-controls-class hypothesis is rejected after stack-forwarding
  verification; the freighter branch still lacks the analogous S-class copy.
- Expanded evidence: the existing route collector now inventories concrete recipe,
  expedition-unlock, item and repair payloads in two corpus tables. External report
  `delivery-capabilities-20261002.json` records source/script hashes and scoped
  counts. The owning route assessment distinguishes module/recipe/installation,
  unlock/claim/acquisition, expansion tokens/actual valid slots and class/stats.
- Not proven: production ABI, free freighter class/ownership fix, multitool delivery,
  targeted/maximal slot expansion, complete expedition unlocking, or current-build
  delivery compatibility. Static field offsets are not approved runtime setters.
- Rollback: no installation to roll back. External manifests, failed hypotheses
  and reports retained; reproducible scripts/seeds and documentation are committed.

### 2026-10-02: offline multitool reward chain and serializer mapping

- Fingerprint/tools: same pinned 180383 executable, Ghidra/JDK and bounded launcher
  above. Exact source lists are `weapon-metadata-180383.tsv`,
  `weapon-handler-180383.tsv`, `weapon-serializer-180383.tsv` and
  `weapon-fields-180383.tsv`. Passes completed in 17/16/16/17 seconds respectively;
  six new functions exported successfully without a whole-program scan.
- Trigger/conditions: user requested study of future multitool delivery; offline
  metadata, existing dispatcher pseudocode, bounded exact PE disassembly and
  name resolution only. No resource request, native call, purchase or save write.
- Observed: SpecificWeapon named metadata uses tag 0x5f82ff34. Getter 0x24cc6b0
  checks it, dispatcher 0xf19c30 selects handler 0xf31490, which calls core setup
  0x8e3a10 with item-kind 1 and queues 0x26. Field serializer 0x24da180 names
  +0x1c1 IsGift, +0x1c2 IsRewardWeapon and +0x1c0 FormatAsSeasonal. The reward flag
  reaches core argument 10; its branch copies the supplied class and computes
  corresponding stats. Native acquisition research owns the detailed chain.
- Rejected scan interpretation: a preliminary 64-byte getter slice included the
  target tag in neighboring leaf functions. Exact entry disassembly confirmed
  only 0x24cc6b0; no neighboring address was exported or treated as a getter match.
- Not proven: safe callable ABI, free/no-UI ownership, full inventory or S-class
  multitool delivery on this build. Resource readiness and selection remain gates.
- Indexing/validation: new named stages are imported as pseudocode_unverified.
  Three native-index tests passed, including all six new stage names, focused
  success/failure preservation and invalid-fingerprint rejection. Name resolution
  passed positive IsGift/IsRewardShip assertions and rejected a fake executable.
- Rollback: no installation or live mutation; external outputs retained. No new
  tools, disk repair, D: access or additional game extraction was required.

### 2026-10-02: class-selection argument observer installed

- Build: 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  The user clarified that the naturally encountered C ships were consistent with
  the system's economy, resolving that reported global-generation suspicion.
  The separate reported Starborn Runner acquired-class discrepancy is not
  independently resolved by that clarification.
- Source/configuration: `build-probe.ps1 -Mode ClassObserver180383`,
  `callback_observer_180383.c`, `class_observer_180383.c` and `.S`, MinHook 1.3.4,
  llvm-mingw 20260922 / LLVM 23.1.2. Class candidate RVA `0x4cea20`, exact first
  32 bytes `48895c241048896c2420565741564881eca0000000488bf14963e9488d8c24d0`.
  Offline disassembly copies R9D into RBP, and existing exported pseudocode uses
  that fourth argument to index class-dependent stat segments. This is an
  observation target, not an approved callable delivery API or class setter.
- Trigger/conditions: assembly detour counts R9D values 0, 1, 2, 3 and other,
  preserves flags and all argument registers/stack arguments, then tail-jumps
  into MinHook's original trampoline. It makes no helper call and does not
  dereference game objects or change arguments. The callback logs every two
  seconds and removes both hooks after ten minutes. No reward events/data patch
  or inventory/save access are present. Class input counters are not proof of
  an entity's visible or resulting owned class.
- Fixture failure: an empty Update stub was too short for MinHook and rejected
  with hook status 8; class counters remained zero. The fixture stub was replaced
  by a counted original function. This did not involve the real game. An initial
  PowerShell compiler invocation also failed parsing an unquoted comma-containing
  linker option, before execution; quoting that option resolved it.
- Fixture result: 400 original generator calls and 400 original Update calls,
  80 inputs in each bucket, eight arguments and original return values preserved.
  Strict compilation passed. The production DLL rejected fake executable PID
  21360, forwarded 400 Update calls and produced no class hook log.
- Installed DLL SHA-256:
  `3f2ce882e975313d3a4381ba75aec23e62fcca8f922c1322bebcd000ad5d208a`.
  Installation required closed game, matching executable/source hashes, absent
  destination proxy and no MODS files. Readback matched. Process 19008 then
  logged exact-build startup, Update hook status zero and class hook status zero;
  its first sample had 653 callbacks and no class candidate invocations yet.
- Not proven: live class argument samples in loaded-save generation, which
  object/flow reaches this candidate, S-class delivery, visible badge, stats,
  slots, ownership or persistence. Await gameplay observations before mutation.
- Loaded-save observation: the user confirmed loading the disposable save.
  The next class sample had argument 0 twice, argument 1 twice and argument 3
  once, with no other arguments and hook status zero. Update reached 18,164
  callbacks and the process remained responsive. This confirms candidate
  execution with multiple inputs, not that they belong to particular NPCs or
  the requested freighter. A controlled NPC comparison remains pending; opening
  an existing owned inventory may not invoke this generator.
  Final ten-minute sample: `observation_complete` in both logs, class hook
  status zero, 0/1/2/3/other counts 8/2/0/1/0, Update count 29,296 and callback
  thread 23208. The timer expired while the user was locating an NPC ship;
  no controlled comparison-screen correlation was established in this window.
  Do not attribute later visible classes to these completed counters. Future
  observation should allow explicit arming after gameplay readiness rather than
  consuming the entire sampling window during startup/travel. No mutation was
  attempted and there is no unknown delivery outcome to retry.
- Rollback: remove only this exact-hash proxy while NMS is closed. Prior observer
  and reward files remain in the external generation-isolation backup. No data
  patch was restored, and no save or global class table was changed.

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


## 2026-10-02: Armed current-build reward argument collector

- Build 180383 executable SHA-256:
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Exact sources: `reward_observer_180383.c/.S`, `callback_observer_180383.c`,
  startup verifier, XInput proxy and existing MinHook; mode RewardObserver180383.
  LLVM 23.1.2 / llvm-mingw 20260922; warnings as errors.
- Target: offline candidate f12240 and pinned 24-byte prologue. Explicit random
  event arming; 30-minute arm wait, ten-minute observation; 512 immutable records
  containing caller address and ten raw register/stack slots. No game pointer
  dereference, native dispatch, save access or data patch.
- Simulation passed ten distinct arguments, weighted return, pre-signal exclusion,
  buffer bound, overflow forwarding and timed hook removal. 610 original calls
  reached the capacity assertion; another passed after removal. Existing class
  regression PID 18104 passed 2,048-record bound and 2,800 forwarded calls.
- Production rejection PID 9528: 400 forwarded Update calls, exit 0,
  unsupported_build startup diagnostic, no observer log. This is fixture evidence.
- Installation: game closed; executable and prior bridge SHA-256
  `f9379312f6676d03634cf29a239c1744df59164761d8dfcd13d84ba87a01f0fa`
  matched; GAMEDATA/MODS empty. Installed production DLL SHA-256:
  `1cb8ed07471d9ec2f36d566bf3a8a95616b91191123114fa9e8a72a4ea7a8040`.
  Backup/manifest preserved at
  `%LOCALAPPDATA%/NMSCourier/diagnostics/reward-observer-install-20261002181204`.
  Rollback requires NMS closed and installed hash still matching; restore only
  that verified prior DLL. No other game file was replaced.
- Not proven: live collector startup, reward ID contents, manager, full ABI,
  calling thread, readiness or acquisition. Upper bits of narrow arguments may
  be unspecified. No current-build ship, multitool or freighter delivery occurred.
- Next gate: disposable save, arm collector, observe one ordinary native reward
  or expedition offer without buying; correlate caller/arguments before preparing
  a separately gated delivery. No repeated mutation is authorized by a trace.
- Navigation: 70 source files, 147 source functions, 194,641 corpus paths,
  65 native candidates, no warnings. A documentation append initially failed
  because Windows default cp1252 could not decode existing UTF-8; explicit UTF-8
  corrected the append, with no game or storage operation involved.


## 2026-10-02: Procedural descriptor and native seed-algorithm research

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Sources: `inspect-procedural-descriptors.py`, extended metadata scanner,
`descriptor-metadata-180383.tsv`, `scan-native-callers.py`; existing corpus and
Ghidra 12.1.4 / JDK 25.0.4.1. Offline trigger only; no save/process prerequisite.

Five descriptor assets yielded 109 conditional groups and 398 option nodes.
Sentinel accounts for 62 groups/190 options. Nested ancestor conditions and
empty descriptor behavior passed synthetic checks. Eight metadata candidates
were exported successfully in 46.1 seconds, no failures; selected exports expose
serialization and field hashing, not a confirmed appearance PRNG. Direct caller
scan of two metadata hash candidates found two instruction-checked edges in
already inspected fragments, not a model generation function. GcSeed had no
metadata string match. MetaIdea's pinned Ship Creator preview traversal does not
provide a demonstrated seed evaluator. Record these negative findings rather
than porting an unrelated hash or bundled random helper.

Evidence: external `seed-analysis-180383/descriptor-choices.json`,
`seed-analysis-180383/metadata-callers/`, `acquisition-180383/descriptors-export/`.
Scope and sources: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).
No installed executable, bridge, patch or save changed; prior observation DLL
remains installed. Exact seed evaluation, inversion, colors, class and natural
location mapping remain unimplemented/unverified. No delivery occurred.

The user's follow-up Sentinel screenshot was mapped to 24 exact descriptor IDs
in `sentinel-parts-example.json`. Current corpus validation matched all 24 with
no missing/ambiguous IDs or ancestor conflicts. Negative checks rejected
WINGS_V+WINGS_H, SKIRT_B+TEETH_A and a nonexistent ID. These checks validate
conditional metadata only; no seed was derived or evaluated. External result:
`seed-analysis-180383/sentinel-user-constraints.json`.

## 2026-10-02: Procedural generation chain and assembly arithmetic replay

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only; no loaded save, live trigger or runtime mutation required.
Sources/configuration: bounded public signature terms CreateGenerationTask,
AddResource and ParseData; pinned NMS.py database and supplied nms.center HTML
hashes in [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).
Committed `procedural-*-180383.tsv` lists reproduce six Ghidra stages on the
existing Acquisition180383 project using Ghidra 12.1.4/JDK 25.0.4.1, max CPU 2.

CreateGenerationTask produced a unique candidate at 1149fe0; AddResource and
ParseData did not match. Six stages exported 15 candidates, all successful,
in 31/19/19/19/19/19 seconds. Traced descriptor preparation through 2d63bf0
and weighted group selection 2d67800. Literal windows resolved xRARE/xNEVER/
xWEIRD, _PLAYER_ and LOD. Name markers affect selection weights in this branch;
raw XML Chance is not sufficient. Explicit choice preparation is separate from
automatic selection. Task submission/construction copies inputs and does not
establish a worker vtable or appearance PRNG by itself.

Implemented experimental seed initialization, multiply/carry advance,
unfiltered weighted choice and reference-child seed mixing. Capstone 5.0.5
disassembly confirmed three arithmetic windows, including a split unwind fragment
that the first-fragment scan missed. A fail-closed instruction interpreter replayed
all three windows for 1,005 fixed/generated seeds (3,015 comparisons) without
mismatch. Three boundary/choice tests passed. No native instructions were executed.

Static HTML inspection found remote seed evaluation and configuration CRC32 keys,
not a client-side inverse algorithm. No remote API, authentication or private
service was used. External evidence: generation-signatures, selector-assembly.json,
selector-child-assembly.json under seed-analysis-180383; six procedural export
directories under acquisition-180383.

Not proven: original ship seed propagation, complete filtered/override selection,
reference traversal order, textures/colors, appearance equivalence with live NMS,
inverse search, natural locations or delivery. Keep proprietary exports external.
Rollback: none needed; game executable, installed bridge, patches and saves were
not changed. No disk repair, storage setting or BitLocker operation occurred.

Navigation rebuilt: 76 source files, 173 source functions, 194,641 data paths,
88 native candidates and no import warnings. Native index regression checks
include the new stages and retain their unverified status.

## 2026-10-02: Appearance category coverage and color-path investigation

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline trigger only, no save prerequisites. Configuration: committed fourteen-root
`procedural-categories-180383.json`, existing descriptor inspector's new bounded
manifest input, `inspect-appearance-fields.py`, texture signature terms and
`procedural-texture-180383.tsv`. Ghidra 12.1.4/JDK 25.0.4.1; no native execution.

Fourteen additional cTkModelDescriptorList assets yielded 340 groups/986 option
nodes. Reproduction through the CLI retained the same asset contents. Pirate root
has one option referencing a scene; standard/capital freighters have nested groups
and many references. These counts are metadata coverage, not total appearances
or proof of runtime category equivalence. Four texture/customisation palette assets
were inspected successfully with recorded XML hashes. Freighter and multitool
texture selectors expose different palette families/color slots. The initially
guessed industrial texture path lacked the shared/ directory and had no exact
index match; a bounded filename query found the correct path. A Windows rg glob
argument failed with error 123; a corrected directory search completed without
storage changes.

Texture Load/LoadFromDds signatures were unique at 1893960/1894020. Both candidates
exported in 30 seconds with no failures; inspected Load is DDS/pixel loading, not
verified procedural color selection. Do not treat this route as a color decoder.
Descriptor initialization collision 0 versus 0x1000100000001 was confirmed in
the recovered arithmetic and regression-tested for 100 draws. This does not prove
whole-entity/color equality. Other category/resource/input channels remain unknown.

Evidence and category counts: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md),
external category-descriptors-reproduced.json, appearance-fields.json,
texture-signatures and proceduraltexture-export. Complete forward appearance,
color algorithm, inversion, location and per-category runtime support remain
unverified. Rollback: none; installed game/bridge/mods and saves unchanged.

## 2026-10-02: Special reward seed identity and native palette branch

Build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only; no save conditions or game trigger. Configuration: new bounded
reward preset/catalog and appearance graph scripts, Capstone 5.0.5 arithmetic
region 600000..660000, four committed native TSV seed lists, Ghidra 12.1.4 /
JDK 25.0.4.1, existing pinned PE and external corpus. No native instructions ran.

Reward catalog: 89 specific-ship records, one source, XML SHA-256
`8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`.
Phoenix reward R_TGA_SHIP01 specifies WRACERSE.SCENE.MBIN, decimal seed 6,
source class S, Royal category and gift/reward flags. Other gift=true rewards
specify A: gift alone does not explain S. Small seeds belong with their model
resource, not a universal seed-to-entity catalog. No reward was dispatched.

Mixed dependency graph stopped at its 256-node ceiling (671 edges); preserved
the partial report. Separate Phoenix and Pirate roots completed with 39/50 and
255/567 nodes/edges. Optional descriptor/texture misses remain not_indexed,
not corpus extraction errors. No archive precedence or runtime load order inferred.

Arithmetic scan produced 81 raw occurrences and 19 instruction-checked candidates.
Stage proceduralarithmetic exported three of four candidates; 61f4e0 failed,
with no more specific reason in its headless log. No retry. Palette stages exported
62cbb0/62c960 and 2277f0 successfully. Candidate 62c480 fills 66 palette rows,
using the recovered RNG; row generation selects indices with two draws, remaps
color-count modes, resolves fallback palettes and tests prior RGB colors.
The Freighter family reuses the saved pre-Paint RNG state. Threshold bytes resolve
to float32 2^-32. Complete RGBA/collection/caller propagation is not implemented.

Direct caller scan found 20 checked edges to 62c480; all 20 fragments exported in
40 seconds. Their category roles and ABIs remain unverified, especially split
fragments with unknown registers. Public schema checks use MBINCompiler commit
0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c, linked in the owning specification.
Initial master raw-source paths returned 404; corrected pinned development paths
worked. A broad FTS output caused a terminal encoding error; bounded path-only
queries replaced it. An unavailable helper filename and a wrong log filename
were corrected through the existing source map/artifact directory. No disk error.

Validation: six primitive boundary/mode tests, three asset-inspector tests and
three native-index tests passed. Existing assembly replay passed 3,015 comparisons
for 1,005 seeds; it covers the earlier integer windows, not palette branch/RGBA
equivalence. New scripts preserve precision, explicit ambiguity/budgets and missing
status. Evidence and formulas: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).

Not proven: full forward appearance, inverse seed search, live color equivalence,
natural spawn location or new runtime delivery capability. Rollback: none needed;
game executable, installed bridge/mods and player saves unchanged. No disk repair,
BitLocker changes or D: access occurred. Proprietary data/pseudocode stays external.

Final research suite: all 28 tests passed. Navigation regenerated with 82 source
files, 193 source functions, 194,641 data paths and 117 native entries, including
one retained export failure; no import warnings. Diff whitespace check passed.

## 2026-10-02: Base palette evaluator, assembly replay and alternate route

Same build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only, no save or game trigger. Source/configuration: evaluate-base-palettes.py,
new palette assembly replay, original basecolourpalettes MBIN fingerprint
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`,
three new branch/material seed lists, same Ghidra/Capstone/JDK tools.

Implemented candidate 66-family base schedule using exact float32 MBIN colors,
mode lookup remapping, index retries, saved Paint/Freighter state and reseeded
special families. Input seeds 0x6 and 0x1ad0003900054 each yielded 330 colors.
These are explicit base-collection traces, not verified entity color inputs.
Inactive base families remain the native default branch when fallback is the
same base collection; arbitrary collection fallback is not implemented.

First row disassembly only covered a prologue. Inspection of split body 62cbde
recovered draw/mode instructions and SSE reduction B²+(G²+R²). Corrected the
initial Python reduction order; preserved its old Pirate report as superseded,
and generated base-palette-pirate-seed-v2.json. Independent interpreter checks:
1,000 two-draw windows and 320 mode-selection windows passed. RGBA and full
scheduling have synthetic tests but no assembly replay or live comparison.

Worker seed path was traced through an aggregate copied by 227a40, including a
16-byte seed-shaped field at input +0x10/task +0x138. Default descriptor preparation
preserves the source seed; explicit-ID preparation disables its seed flag. Task
flag 1c9 chooses an alternate color branch 62e4e0/62e780. Unlike the first route,
the alternate retries consume fresh random draws and compare square-root RGB
distance with a runtime global. No name or ABI inferred from these offsets.

Three branch exports succeeded in 18 seconds, alternate row export in 19 seconds,
and two material-stage candidates in 26 seconds. All six succeeded. Candidate
630d50 is an asynchronous texture request/cache, not established color binding;
6381b0 is task removal/freeing, not color application. These rejected routes are
retained in the owning specification and index.

Routine failures: an initial read treated SQLite's extracted status 'ok' as a
filename; corrected by using the known XML sibling path with hash/size checks.
Searching a prologue-only assembly report for scalar multiplies found none;
the actual body uses packed SSE operations. Two documentation patch contexts
did not match and were corrected without changing game/storage artifacts.
An old report.json filename guess was corrected to candidates.json. No disk I/O
failure, disk command, repair, D: access or runtime mutation occurred.

Validation: all 31 research tests passed. New tests verify retry termination/RNG
consumption, RGB-only comparison, strict threshold boundary and schedule reuse.
Full appearance, caller seed channels, alternate collection, material binding,
inversion and game equivalence remain unresolved. Evidence is external under
seed-analysis-180383 and the three new native stage directories. Rollback: none;
installed executable/DLL/data mods/player saves unchanged.

Follow-up structural evidence: descriptor_tree now preserves ordered child model
lists, validated across fourteen roots with unchanged 340 groups/986 options.
Native selector predicates show that absent referenced descriptors may still
consume mixed seeds, all-xNEVER child lists can be skipped, and _PLAYER_ children
restart from the original seed input. Literal checks confirm LOD/_PLAYER_/empty
prefix bytes. These are traversal rules to port, not a finished recursive evaluator.
The synthetic ordered-child-list test passes. No additional game changes occurred.

## 2026-10-02: Default descriptor evaluator and rejected public-viewer oracle

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline inputs only; no save loaded or runtime trigger. Configuration: new
evaluate-descriptor-seed.py, fourteen-category manifest plus five initial roots,
seed 0x7 and requested Pirate seed 0x1ad0003900054. Sources are hash-recorded
converted corpus descriptors; XML is bounded and SQLite remains read-only.

Implemented the unfiltered default candidate traversal, including ordered child
lists, Name weights, raw candidate-ID suppression, LOD normalization, missing
reference seed consumption and _PLAYER_ restart. Sentinel seed 0x7 yielded
22 IDs across eight calls. Nineteen roots yielded 18 traces and one unsupported
case, with 183 successful decisions; the fourteen-root CLI independently
reproduced 13 traces and the same unsupported Capital freighter reference:
`MODELS/EFFECTS/LIGHTS/LIGHT_BLUE.SCENE.MBIN{7}`. No annotation was guessed away.
These are experimental predictions, not observed ships or renderable previews.

Initial exact-path SQLite lookups rescanned metadata for each reference and were
slow. Replaced them with one bounded in-memory descriptor metadata map per CLI
batch, preserving per-root resource/byte/call budgets. Earlier runs completed;
an exact-process check for an obsolete command found no process to stop. No
disk/storage error or repair occurred. One documentation patch context failed
and was corrected. A guessed older export filename was absent; actual artifacts
were located through stage manifests instead.

Texture callback stage exported 6308a0 and 63ae70 in 97.8 seconds, both successful.
Their observed cache payload/readiness and async loader behavior rejected the
hypothesis that these functions directly establish final shader color binding.

Public C# NMSMV was inspected at commit
ee2ed17e79ff82ec4cfd069f33fcd2234e443e03, limited to two source files (10,472 and
10,508 bytes). Its uniform System.Random descriptor choices and palette draw
schedule differ from recovered native arithmetic. Rejected it as a seed oracle;
its descriptor/reference organization remains a structural clue only. Source
copies are external, no third-party code or assets vendored. Links and exact
limitations are in the owning procedural seed specification.

Not proven: whole traversal equivalence, filtered/prefix/customisation routes,
final color/material application, inverse search, universe spawn mapping or new
delivery support. Rollback: none needed; game executable, installed DLL/data
patches and all player saves remain unchanged. No D: access, disk command,
repair or BitLocker change.

Resource lookup follow-up: Ghidra stage proceduralresourcelookup timed out at
306.3 seconds with no manifest, log limited to Java option startup lines. Its
owned process tree was stopped by the launcher's existing limit; no retry or
disk command. The unavailable stage is now a separate native_analysis_run
navigation record, with checked fingerprint, rather than disappearing silently.

New bounded fragment inspection recovered seven unwind fragments (504
instructions), their byte hashes and fixed path-format literals. The PE import
table independently identifies thunk 33e0fc8 as VCRUNTIME140.dll!strrchr. Loader
2d5caa0 clears the final extension and rebuilds an MBIN path, explaining removal
of the numeric annotation on the Capital reference. Added this audited limited
reconstruction to the descriptor loader while retaining requested source paths.
The follow-up fourteen-root run yielded 14 experimental traces, including
Capital; original unsupported reports remain preserved. Still no live oracle.

Added synthetic PE import tests, numeric-annotation/path-scope tests and a
transactional source-only navigation refresh test. Source refresh preserves
data/native records and import warnings, avoiding another 194,641-row corpus
import for code-only changes. Repository and corpus/storage boundaries remain
unchanged; proprietary instructions/literals and third-party sources stay external.

Final validation: all 42 research tests passed. Navigation contains 87 source
files, 233 source functions, 194,641 data paths, 125 native function candidates
(including one retained export failure) and one unavailable analysis-run record.
No import warnings. This is metadata and offline evidence, not runtime support.
Arithmetic replay again passed 3,015 integer-window comparisons and 1,320
palette draw/index comparisons. RGBA, recursive selection and whole appearances
are not covered by those assembly replays. Review preserved the existing raw
32-byte `--literal` interface while adding bounded string/import inspection;
the raw threshold window was re-read without native execution.
