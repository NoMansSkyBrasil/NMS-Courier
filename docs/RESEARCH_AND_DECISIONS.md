# Research evidence and architecture decisions

Status: source research, local transport/packaging evidence, and one live read-only diagnostic callback. The one-shot Carbon command passed offline tests, but two live attempts timed out before dispatch; no game mutation has occurred. A code-mod bridge feasibility review is recorded below.

## 1. Evidence rules

Source availability does not establish compatibility with the installed game. A declared binding is not a proven arbitrary item-delivery API. Repository metadata identifying a license is an audit starting point, not a complete transitive redistribution review.

Record exact revisions for game-related research. Verify pinned dependency artifacts rather than assuming upstream HEAD equals the packaged release. Do not copy proprietary service code or incompatible open-source code. Preserve original notices for incorporated dependencies.

## 2. Inspected game/runtime references

| Reference | Observation | Consequence |
| --- | --- | --- |
| NMS.py b41bf9e6fdff1c833b77d805bb0c8da555c4ced4, data/types.py | `cGcRewardManager.GiveGenericReward` accepts reward, mission, seed, and flags plus output-related parameters; it has no arbitrary item ID + quantity input pair | Trace dispatch and downstream inventory calls; a reward ID is not an item ID |
| Same upstream source | Partial `cGcPlayerState` includes inventory fields, but the installed NMSpy 147803.1 wheel does not expose inventory-store types | Observation aid only; validate layout against the selected executable |
| Same revision, inventory_test.py | Demonstrates reading and directly modifying `mStore` and valid-slot bits | Does not prove a native insertion function or exact-build behavior; do not use direct structure mutation as the delivery path |
| Same revision, pyproject.toml | Declares pymhf[http_api,gui]==0.2.4 and plugin entry points | Preserve metadata and inspect actual pinned dependency behavior |
| Same revision, pymhf.toml | Visible GUI, paused startup, executable-relative data/log defaults | Override through verified configuration for integrated desktop behavior |
| pyMHF HEAD 2ca33d677f7cdeda904d4e714aee721fd03ff8db | Dependencies include native hooking/injection packages | Private distribution requires native dependency closure |
| PyPI metadata for pyMHF 0.2.4 | Includes pyrun-injected==0.2.0, pywin32, cyminhook, pymem and other dependencies | Evaluate exact wheels and native loading |
| PyPI files for pyrun-injected 0.2.0 | Windows x64 wheels listed for CPython 3.9 through 3.13 | A compatible injector wheel exists for CPython 3.11, but this is not a verified full stack |
| Current NMSpy project documentation | Declares support for Python 3.9–3.11 and says Python 3.14 is unsupported | Select CPython 3.11.9 for B0; do not treat injector support alone as compatibility |
| pyMHF inspected main.py | Contains an already-running-process path and transfers module paths | Supports investigating attach-after-launch; private bundle still unverified |
| pyMHF inspected injected.py | Interactive execution server on 127.0.0.1:6770; optional HTTP server on 0.0.0.0:5000 | Must remove/disable unwanted endpoints in release integration |
| pyMHF main/injected code | Terminal shutdown interactions and socket logging exist | Disabling endpoints may require lifecycle/logging adaptation |
| NMS-Newton ad23813767f0ae5a963d9d3dd261c59a63454e2a | `interactions.py` hooks `GiveGenericReward` and branches on reward flags and a specific built-in mod reward ID | Evidence for observing or intercepting that reward path, not an arbitrary item grant API |
| NMS-Newton repository metadata | License not identified in the earlier query | Do not incorporate without explicit license review |
| pljeroen/nmstoolkit README | Save editing and Corvette/extraction features; preview limits described | Reference for definitions, not runtime delivery evidence |
| MBINCompiler docs | Version-sensitive MBIN conversion using MXML | Separate converter from PAK extraction; bundle compatible tools |
| HGPAKtool 1.1.3 metadata and README | MIT Python package; project documents PAK reading for post-5.50 NMS data and a self-contained Windows binary | Candidate PAK extractor for a private catalog worker; pin, audit, and test against the selected build before inclusion |
| nmstoolkit 7019f561aa3522ae0b77c171cc1777761be2ac67 external review | Its documented extraction targets distinguish Product, Substance, and Technology tables and use multiple language MBIN files | Add those paths as catalog discovery candidates; no code, data, or save-editing behavior is incorporated |
| vectorcmdr/NMSE local checkout, inspected 2026-09-22 | Its extractor separates filtered PAK reading, MBIN conversion, localization generation, typed parsing, and DDS-derived icon generation; its documentation also describes title, reward, recipe, customization, creature, and Space POI data sets | Adopt only the architectural lessons: staged jobs with explicit timeout/coverage, raw localization keys beside resolved strings, and an independently reviewed local image cache. Do not import its code, generated catalog data, tools, or save behavior. Reject its runtime tool downloads because NMS Courier packages reviewed dependencies before distribution. |
| Local Steam installation, inspected 2026-09-22 | `Binaries/NMS.exe` reports file and product version `179666`; SHA-256 is `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb` | This is an observed candidate build, not a supported runtime build. No adapter, injection, or game mutation is authorized by this observation alone. |
| Private runtime import probe, inspected 2026-09-22 | The bundled CPython 3.11.9 imported `nmspy`, `pymhf`, and `pyrun_injected` using only packaged resources; `fastapi` and `uvicorn` were absent | Confirms a limited offline import gate. It does not prove DLL closure on a clean machine, attachment, listener behavior after injection, or game compatibility. |
| Local runtime bridge package, tested 2026-09-22 | Windows x64 ZIP built; manifest records 20 wheels and 1,282 runtime files; packaged import verification, five Python protocol tests, and a current-user Windows Named Pipe loopback passed with private interpreters | Validates packaging and transport; the separate live attachment/callback result is recorded below. Clean offline machine and delivery function remain unverified. |
| Direct Python live diagnostic probe, 2026-09-22 | Private CPython discovered PID 1972 at the Steam installation root, matched the diagnostics-only SHA-256 allowlist, and authenticated the injected module. The pyMHF log then reported NMSpy import errors for `pymhf.utils.partial_struct` and `Loaded 1 mod and 0 hooks`; no callback arrived. No delivery or save access occurred. | Add a version-checked compatibility shim for the pinned NMSpy 147803.1 and pyMHF 0.2.4 package pair, restage only after the game process exits, and repeat the callback test. This result does not establish game-hook compatibility. |
| Direct Python live diagnostic probe after shim, 2026-09-22 | PID 15808 on Steam build 179666 authenticated and loaded 3 mods and 5 hooks. NMSpy called the registered `MAIN_LOOP` callback without arguments; Courier's callback required `_this`, so pyMHF removed it. Its exception handler then changed the callback set during iteration and the NMSpy singleton after-hook was disabled. | Match Courier's callback signature to NMSpy's zero-argument contract. The source fix is now restaged and its regression test passes; a new game process is required to verify a callback. No delivery or save access occurred. |
| Direct Python live diagnostic probe after callback fix, 2026-09-22 | PID 27340 on Steam build 179666 authenticated over the restricted pipe, loaded 3 mods and 5 hooks, and emitted `callback_ready`; the pyMHF log contained no hook error. | Confirms process discovery, package imports, hook registration, and a live main-loop callback for diagnostics only. The build is not enabled for delivery; no mutation or save access occurred. |
| Corrected native inventory signature and layout check, 2026-09-22 | A direct masked-byte scan of the on-disk 179666 `.text` section found one match each for NMS.py b41bf `cGcInventoryStore.Add` (RVA `0x4CE130`), constructor (`0x4CA2A0`), `GetElement` (`0x4C35B0`), `Remove` (`0x4CEAB0`), `cGcPlayerState` constructor (`0x56E960`), `cGcGameState` constructor (`0x2CE9E0`), and `cGcApplication.Data` constructor (`0x2C6E00`). It found one `GiveGenericReward` match (`0xF0BD70`), six matches for the less-specific `GiveReward` pattern, and zero matches for the currency-award patterns. Disassembly confirms `cGcApplication.Data` constructs game state at `+0xE70`, game state constructs player state at `+0xAAD0`, and the player-state helper initializes 33 inventory stores beginning at player-state `+0x910`. The source revision is explicitly for build 179105, so these results are 179666-specific evidence from the executable, not an upstream compatibility claim. |
| Read-only live inventory snapshot, 2026-09-22 | A separate private-Python probe rechecked PID 27340, the executable path, and SHA-256 `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb`. It located the loaded image by matching its in-memory `.text` bytes to disk, followed the game-data pointer chain, and decoded the vector header from the NMS.py layout. The first personal inventory contained 115 `FUEL1` Carbon with `MaxAmount` 9999; its dimensions and vector metadata were internally consistent. The probe used `ReadProcessMemory` only; it did not call a native function, modify memory, open the inventory UI, or access a save file. |
| Delivery status after native inventory check, 2026-09-22 | The active in-game module is still diagnostics-only and its Named Pipe accepts only diagnostic output. No item delivery command exists in that loaded module; no game mutation has occurred. | Implement a one-operation exact-hash test command on the verified main-loop callback. Keep the build out of general support until the live quantity change and persistence are observed. |
| One-shot Python Carbon test implementation, 2026-09-22 | Added a direct `--test-deliver-carbon` mode restricted to the exact 179666 executable hash and one `local_player` `FUEL1 ×500` request. The host dispatches once after `callback_ready`, enforces a deadline, and reports unknown after any post-dispatch response loss. The injected callback revalidates the executable signature, reads the personal inventory, calls the native `cGcInventoryStore.Add` binding, and requires an exact live quantity delta before reporting success. Synthetic-layout, command-contract, callback, host-state, Python syntax, and Windows Named Pipe loopback tests pass. The currently loaded process still has the earlier diagnostic-only module. | Restart the game to load the updated injected module, then execute this one-shot test while the character is in normal gameplay; the inventory screen and another player are not required. Confirm live quantity and normal-save persistence before broadening support. Do not retry if a response is lost until the inventory is inspected. |
| Live Carbon attempt during warp, 2026-09-22 | PID 5996 on the allowlisted Steam 179666 executable authenticated and loaded 3 mods and 5 hooks, but no main-loop callback reached the host within 60 seconds. The host emitted `CALLBACK_TIMEOUT` with `dispatched:false`; the game remained open and no native call occurred. | Treat the result as a pre-dispatch rejection. Repeat only on a fresh process after a callback-path change; never infer delivery from authentication. |
| Live Carbon attempt while stationary, 2026-09-23 | PID 22340 matched the same exact executable hash, authenticated, loaded 3 mods and 5 hooks, and remained responsive. The callback again timed out after 60 seconds; operation `97702aa8-45b2-4f67-80d9-ee23ad00c378` was rejected with `dispatched:false`. No native insertion or inventory mutation occurred. The source now registers both `MAIN_LOOP` before and after callbacks, reports the phase, and keeps one shared command drain. An isolated private-runtime stage passes 36 Python tests and the Windows Named Pipe loopback. | Diagnose the callback lifecycle rather than repeating the unchanged late-attach attempt. Normal-save persistence remains unverified. |

### Code-mod bridge feasibility, 2026-09-23

This review distinguishes game-data mods from executable code mods. MBINCompiler and AMUMSS prepare game-data changes that NMS loads as mods; that format does not itself provide an arbitrary per-request inventory API or a local IPC endpoint. For NMS 5.5 and later, AMUMSS documents mod subdirectories in `GAMEDATA/MODS`; the user's installed game has that directory and no legacy `GAMEDATA/PCBANKS/MODS` directory. NMS.py explicitly describes itself as a Python hooking/modding framework, recommends running through `pymhf run nmspy`, and allows Python mods in the game's `GAMEDATA/MODS` directory. That illustrates the distinction: the files may reside in the game mod folder, but pyMHF is still the code loader. Our injected `courier_mod.py` is already a code mod on that stack. Moving it into the mods directory without changing its lifecycle would not remove pyMHF or repair a missing callback. A standalone DLL placed only in `GAMEDATA/MODS` is not a verified game-native executable mod format; use a separately validated startup loader.

The earlier wording was too broad if read as denying native item grants from data mods. Data mods can change the game's reward and interaction definitions, and the game itself grants items when those definitions trigger. The user's post-5.58 guide documents EXML patches and MBIN replacements in `GAMEDATA/MODS`, including the limits of hot swapping. The community interaction reference lists `GenericReward`, and its action-trigger reference describes `GcRewardAction`, `GcPlayerNearbyEvent`, and `GcFireSimpleInteractionAction`. Those references describe game-triggered behavior, not a verified channel for external per-request commands. The interaction wiki describes NMS 2.1-era definitions; each field must be checked against the installed build before use.

| Tool supplied by the user | Verified role | Courier relevance |
| --- | --- | --- |
| [MBINCompiler](https://github.com/monkeyman192/MBINCompiler) | Converts build-sensitive MBIN data to editable MXML and back. Since Worlds Part II, it outputs MXML, which can be minimized and named EXML for a game-data patch. | Best direct tool to inspect the current reward schema; no runtime command receiver. |
| [AMUMSS](https://github.com/HolterPhylo/AMUMSS) | Processes author-side Lua scripts into game-data mods; its README explicitly says it is a script processor, not a mod manager. | Useful for generating and maintaining many data changes, not Lua execution inside the running game. |
| [ModBuilder](https://github.com/cmkushnir/ModBuilder/) | The exact repository linked by the user currently contains a license and a one-line `Test` README, with no inspected NMS implementation. | Do not select this repository as a ready-to-use build tool. |
| [NMSModBuilder](https://github.com/cmkushnir/NMSModBuilder) | The separate NMS-specific application browses game data and uses C# scripts plus a matching `libMBIN.dll` to produce modified assets. Its README has an AGPL notice with an additional competing-product provision. | Optional authoring/research tool; review its license before any integration or redistribution. It does not establish an in-game IPC bridge. |

Read-only local proof: HGPAKtool 1.1.3 extracted the installed build's `METADATA/REALITY/TABLES/REWARDTABLE.MBIN`; MBINCompiler v7.04.0-pre1 produced MXML. The `PLANTER_CARBON` entry is a 100%-chance `GcRewardSpecificSubstance` for `FUEL1` with `AmountMin=40` and `AmountMax=80`. A minimal [Carbon reward data-mod probe](../prototypes/data-mod/README.md) changes those two amounts to 500 in an EXML patch. The XML parses, but it has not been installed, loaded, or triggered in the game. The converter's version query returned `Unknown MBIN version`, so the successful conversion is not a general version-compatibility guarantee.

This establishes a practical two-part test. First, trigger a known game reward with an isolated data mod and observe the exact local inventory delta and normal-save persistence. Then test separately whether a desktop request can reach a loaded mod and invoke a selected reward without a player interaction or save edit. EXML hot reload is not assumed to provide that second part: the supplied guide says only some values hot reload, ALT+Tab is used to trigger it, and some values remain locked or never reload. It also supplies no mechanism for targeting another player; multiplayer delivery remains independent research. Do not replace the native startup bridge decision until a command ingress and target semantics are actually demonstrated.

The current Courier host sets `start_exe:false` and supplies the PID of a game already running. The inspected pinned pyMHF launcher has a separate branch that starts the game when no instance exists, then injects the mod. Starting with the game may change callback timing; this is a hypothesis, not a demonstrated fix. The source now registers both sides of `MAIN_LOOP`, but that change has only passed offline tests. Further late-attach retries must be driven by new evidence, not repeated unchanged.

The user has since clarified that the desired alternative is a native DLL loaded before the save opens, without Python in the delivery path. This is a distinct prototype from early-loading the existing Python mod. On the exact local executable with SHA-256 `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb`, a read-only PE `.text` scan found exactly one match for NMS.py's `cGcApplication.Update` hook pattern at RVA `0x2D7500`. NMS.py's `singletons.py` attaches its `MAIN_LOOP` callbacks to that function. The pattern/RVA match is static evidence only; the native function prototype, hook safety, thread context, and execution frequency require live verification before any inventory mutation.

NoMansSky.Api offers a C# `OnUpdate` hook and limited player-inventory support through Reloaded II, but its own README calls the project work in progress. GitHub repository metadata showed its last code push on 2023-06-04; neither current build 179666 support nor a working Carbon insertion is established. ReNMS documents a native C++ plugin system but explicitly requires NMS Fractal 4.13, so it is not a current-build bridge. Reloaded II documents loading native x64 DLL mods, making a narrowly scoped native Courier plugin a plausible alternative, but the loader and the exact-build hook/inventory ABI still require separate proof.

Further loader research favors a simpler, private native loader proof before committing to Reloaded II:

| Evidence | Result | Limit |
| --- | --- | --- |
| Local 179666 `NMS.exe` PE import table | Imports `WINHTTP.dll!WinHttpGetIEProxyConfigForCurrentUser`; the adjacent `Binaries/winhttp.dll` path is currently absent and `winhttp.dll` is not a KnownDLL on this Windows installation | Static import evidence does not prove a proxy loader will survive NMS startup |
| Ultimate ASI Loader v9.7.4 x64 release | Official asset `Ultimate-ASI-Loader-NoPDB_x64.zip` has GitHub-published SHA-256 `e5860e7d9a1805267535b65749575b5e406cc6ea3325c7392189c578815045d1`; its x64 PE exports the WinHTTP function imported by NMS | Do not install the binary until startup compatibility and rollback are defined |
| Ultimate ASI Loader tag v9.7.4, commit `6b440669144c4a0bef5718ab155df160d231cd42` | The loader searches a `scripts` folder relative to its own location, calls `LoadLibrary` on `.asi` files, then invokes an optional `InitializeASI` export | Exact load timing relative to the game's Steam stub and game initialization needs live proof |
| Local executable disassembly | The candidate `cGcApplication.Update` prologue at RVA `0x2D7500` begins `push rbx; sub rsp,20h; call ...`; `cGcInventoryStore.Add` at `0x4CE130` initially reads its item argument from `r8` and its store from `rcx` | This supports hook/signature analysis; it does not prove the detour, full ABI, callback thread, or insertion outcome |

The first candidate layout was `Binaries/winhttp.dll` (reviewed x64 proxy) and `Binaries/scripts/NMSCourier.asi` (our own C DLL). Its default initialization crashed an isolated fixture, so it is inactive. The current launch-only candidate is our own `Binaries/xinput9_1_0.dll` proxy. NMS imports `XInputGetState` and `XInputSetState` from that DLL; our proxy forwards the complete four-function interface and matching ordinals to the System32 original. Neither layout modifies `NMS.exe` or needs NMS.py, Python, or an end-user compiler in the game process. The future installer must detect conflicts, record hashes, remove only its own files, and disable on a game update. Never overwrite an existing proxy from another mod.

The first implementation is a narrower [read-only C startup probe](../runtime/native/asi/README.md), not a delivery bridge. The hash-verified llvm-mingw 20260922 toolchain built both `NMSCourierStartupProbe.asi` and an XInput proxy. The ASI entry and wrong-executable/wrong-build rejection passed a local harness. The reviewed v9.7.4 loader archive was extracted, and its x64 DLL exports the NMS-imported WinHTTP function. An isolated executable that immediately called that function crashed with `0xc0000005` under the loader's default lazy initialization; the same executable without the proxy exited normally. The loader's `dontloadfromdllmain=0` setting passed five isolated runs but moves more work into `DllMain`, so the WinHTTP files were removed before NMS launch. The custom XInput proxy forwards to the real System32 DLL and starts the read-only executable-hash probe after the first XInput call, outside `DllMain`. Its fake-NMS fixture observed both DLLs, normal no-controller return, and ten consecutive normal exits; one earlier Toolhelp32 module-enumeration assertion failed without a crash. The installed startup-only proxy hash `713f70f35f147fdc97bd275904b75cadd570c7bfde790c251fb2194c0d6186b7` produced `exact_build_startup_observed` from live PID 10972, which remained responsive through later checks. No native runtime callback has been observed.

The next read-only callback build vendors unmodified MinHook v1.3.4 source at commit `c3fcafdc10146beb5919319d0683e44e3c30d537` with its license. Only the exact executable SHA-256 and an exact 16-byte in-memory prologue at `cGcApplication.Update` RVA `0x2D7500` permit the hook. The detour increments an atomic count and forwards the original call; a worker logs counts for 180 seconds, then disables the hook. An isolated fixture observed 390 hooked callbacks and 400/400 original calls, and a fake executable with the production-mode DLL was rejected before any hook. This does not yet establish NMS callback safety or game-thread semantics; live deployment awaits closure of the current process and a fresh launch.

Reloaded II remains a fallback loader. It has an official C++ native-mod template and `ModNativeDll64` configuration, but adds a loader/runtime and separate mod-manager integration. Its own documentation describes launch-via-manager and Steam/ASI alternatives. The project should not depend on the older NMS-specific C# API or a modified/unpacked game executable.

Selected prototype direction: a small native x64 Courier bridge loaded at game startup through the current XInput proxy, initially with a read-only heartbeat over an authenticated local pipe. A candidate hook is the exact-build `cGcApplication.Update` match above; the inventory call remains the separately identified `cGcInventoryStore.Add` at RVA `0x4CE130`. Keep `DllMain` minimal and start later work only after an exported call. Verify the expected in-memory target bytes before installing a detour and leave the game untouched if Steam startup or another mod changed them. Keep pipe I/O and parsing off the game thread and execute only a bounded, validated command at a verified safe callback. First prove proxy loading, repeated frame callbacks, and a read-only inventory snapshot. Only then attempt one `FUEL1 ×500` insertion and verify the observed delta and ordinary save persistence. Do not treat proxy loading or pipe acknowledgement as delivery. Do not change or redistribute `NMS.exe`; bundle reviewed runtime dependencies and preserve the exact-build gate. This is a prototype direction, not a claim of native bridge compatibility.

Primary references: [MBINCompiler](https://github.com/monkeyman192/MBINCompiler), [AMUMSS](https://github.com/HolterPhylo/AMUMSS), [NMS.py](https://github.com/monkeyman192/NMS.py), [pyMHF launcher](https://github.com/monkeyman192/pyMHF/blob/2ca33d677f7cdeda904d4e714aee721fd03ff8db/pymhf/main.py), [NoMansSky.Api](https://github.com/gurrenm3/NoMansSky.Api), [ReNMS](https://github.com/sonny-tel/renms), [Ultimate ASI Loader](https://github.com/ThirteenAG/Ultimate-ASI-Loader), [v9.7.4 loader source](https://github.com/ThirteenAG/Ultimate-ASI-Loader/blob/6b440669144c4a0bef5718ab155df160d231cd42/source/dllmain.cpp), [v9.7.4 release](https://github.com/ThirteenAG/Ultimate-ASI-Loader/releases/tag/v9.7.4), [Windows DLL search order](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order), and [Reloaded II native mods](https://github.com/Reloaded-Project/Reloaded-II/blob/master/docs/NativeMods.md).

NMS.py and pyMHF advertise MIT in inspected metadata. The original project intends MIT. Audit all incorporated code, transitive binaries, licenses, and redistribution requirements before release.

The pyMHF listener observations are from the stated HEAD. Recheck the 0.2.4 release artifact before deciding the exact integration patch/configuration. No network service was started during this planning research.

## 3. Packaging research

- Official Python offers a Windows embeddable distribution for private application use, with controlled import paths and vendored dependencies. This does not automatically make injection compatible.
- Electron native addons must match its runtime/ABI; ordinary Node import success is insufficient.
- ASAR has native execution/filesystem limitations; Python and tools need real packaged paths.
- .NET supports self-contained deployment; verify the actual converter artifact rather than assuming a single executable includes the runtime.
- uv manages development/build Python environments; it is not an end-user prerequisite or substitute for an audited release payload.

## 4. Decision register

| ID | Decision | Reason | Revisit trigger |
| --- | --- | --- | --- |
| ADR-001 | Electron desktop with local renderer | Required desktop experience and controlled privileges | Platform requirement changes |
| ADR-002 | No Fastify/HTTP application backend initially | IPC + Named Pipe meet current needs; HTTP adds an unnecessary layer | Concrete separate HTTP client requirement |
| ADR-003 | Standard official shadcn visual treatment | Explicit user preference | Explicit design change request |
| ADR-004 | Private bundled runtime, no first-launch installs | Plug-and-play requirement | Never weaken silently; change implementation if proof fails |
| ADR-005 | Separate launcher, injected runtime, and game adapter | Isolation of packaging and game-specific assumptions | Verified upstream design requires adjustment |
| ADR-006 | One data worker owns SQLite writes | Keep sync native DB work away from renderer/main latency | Measured bottleneck |
| ADR-007 | Explicit unknown operation outcome | Game memory and local DB are not transactional together | Stronger verified game operation acknowledgement |
| ADR-008 | Save Editor separate from runtime delivery | User-requested future feature and distinct data risks | Feature-specific design review |
| ADR-009 | English repository documentation/comments | Explicit user instruction and consistent collaboration | Explicit user revision |
| ADR-010 | B0 packaging gate before M1 acceptance | Catch interpreter/native prerequisites early | No routine bypass |
| ADR-011 | ZIP and offline per-user installer | No separate prerequisites; stable runtime files | Verified user deployment needs |
| ADR-012 | No stock upstream execution console in release | Narrow application command model and local-only guarantees | Only a separately specified authenticated developer tool, not normal release |

Fastify is a low-overhead HTTP framework, but there is no HTTP workload to optimize here. UI speed depends on main-thread work, data access, rendering, and native-call behavior. [Fastify project](https://github.com/fastify/fastify).

## 5. Unresolved evidence gates

| Question | Resolution method | Blocks |
| --- | --- | --- |
| Which adapter can safely support the observed build 179666? | Match source research and controlled runtime observations to the exact executable fingerprint | M1 and M2 |
| Which native path accepts item/quantity? | Observe game reward/inventory call chain | M2 |
| Which exact-build reward path produces Carbon, and what inventory call applies it? | Trace local reward data and downstream calls after the M1 callback is verified | M2 |
| Which callback/thread is safe? | Instrument and validate context/lifetime | M2 |
| Does embeddable Python support this injector? | B0 + actual in-process import/load proof | M1 acceptance |
| Are all DLL prerequisites private? | Dependency inventory and clean-machine execution | Plug-and-play claim |
| Can unwanted upstream endpoints be disabled cleanly? | Inspect pinned code/config; patch only if necessary | Runtime release |
| Which PAK/image tools are distributable? | HGPAKtool is a candidate; complete source, binary/dependency, license, and selected-build review | Complete M3 package |
| Is insertion partial or atomic? | Space/stack adversarial cases in game | Accurate delivery contract |
| What proves remote receipt? | Native transfer observation and receiver test | Courier outcome wording |
| Which save formats permit lossless round-trip? | Future SE0/SE1 corpus | Save Editor writing |

## 6. Primary references

- [Python Windows embeddable distribution](https://docs.python.org/3/using/windows.html#the-embeddable-package)
- [Electron security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron performance](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Electron ASAR archives](https://www.electronjs.org/docs/latest/tutorial/asar-archives)
- [Electron native modules](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)
- [electron-vite guide](https://electron-vite.org/guide/)
- [electron-builder](https://www.electron.build/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [uv Python versions](https://docs.astral.sh/uv/concepts/python-versions/)
- [Microsoft .NET deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/)
- [Microsoft Visual C++ redistribution](https://learn.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files?view=msvc-170)
- [shadcn Sidebar documentation](https://ui.shadcn.com/docs/components/sidebar)
- [NMS.py bindings](https://github.com/monkeyman192/NMS.py/blob/b41bf9e6fdff1c833b77d805bb0c8da555c4ced4/nmspy/data/types.py)
- [NMS.py inventory example](https://github.com/monkeyman192/NMS.py/blob/b41bf9e6fdff1c833b77d805bb0c8da555c4ced4/example_mods/inventory_test.py)
- [NMS.py dependency manifest](https://github.com/monkeyman192/NMS.py/blob/b41bf9e6fdff1c833b77d805bb0c8da555c4ced4/pyproject.toml)
- [NMS.py configuration](https://github.com/monkeyman192/NMS.py/blob/b41bf9e6fdff1c833b77d805bb0c8da555c4ced4/nmspy/pymhf.toml)
- [pyMHF dependency manifest](https://github.com/monkeyman192/pyMHF/blob/2ca33d677f7cdeda904d4e714aee721fd03ff8db/pyproject.toml)
- [pyMHF launcher](https://github.com/monkeyman192/pyMHF/blob/2ca33d677f7cdeda904d4e714aee721fd03ff8db/pymhf/main.py)
- [pyMHF injected runtime](https://github.com/monkeyman192/pyMHF/blob/2ca33d677f7cdeda904d4e714aee721fd03ff8db/pymhf/injected.py)
- [pyMHF 0.2.4 metadata](https://pypi.org/pypi/pymhf/0.2.4/json)
- [pyrun-injected 0.2.0 metadata](https://pypi.org/pypi/pyrun-injected/0.2.0/json)
- [NMS-Newton interaction example](https://github.com/monkeyman192/NMS-Newton/blob/ad23813767f0ae5a963d9d3dd261c59a63454e2a/interactions.py)
- [nmstoolkit](https://github.com/pljeroen/nmstoolkit)
- [MBINCompiler](https://github.com/monkeyman192/MBINCompiler)

The installed shadcn skill and MCP were consulted in the initial planning pass. No component or dependency was installed during planning.
