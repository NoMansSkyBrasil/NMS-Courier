# Research evidence and architecture decisions

Status: source/documentation research, not runtime verification. Observations below were collected on 2026-09-21 unless stated otherwise.

## 1. Evidence rules

Source availability does not establish compatibility with the installed game. A declared binding is not a proven arbitrary item-delivery API. Repository metadata identifying a license is an audit starting point, not a complete transitive redistribution review.

Record exact revisions for game-related research. Verify pinned dependency artifacts rather than assuming upstream HEAD equals the packaged release. Do not copy proprietary service code or incompatible open-source code. Preserve original notices for incorporated dependencies.

## 2. Inspected game/runtime references

| Reference | Observation | Consequence |
| --- | --- | --- |
| NMS.py b41bf9e6fdff1c833b77d805bb0c8da555c4ced4, data/types.py | cGcRewardManager.GiveGenericReward binding exists, with reward/mission/seed/message/inventory-related parameters | Investigate dispatch and downstream calls; not proof of item + amount |
| Same source | Partial cGcPlayerState includes inventory fields | Observation aid; validate layout per installed build |
| Same revision, inventory_test.py | Explicitly incomplete; mutates inventory structures directly | Not the final native-validation delivery mechanism |
| Same revision, pyproject.toml | Declares pymhf[http_api,gui]==0.2.4 and plugin entry points | Preserve metadata and inspect actual pinned dependency behavior |
| Same revision, pymhf.toml | Visible GUI, paused startup, executable-relative data/log defaults | Override through verified configuration for integrated desktop behavior |
| pyMHF HEAD 2ca33d677f7cdeda904d4e714aee721fd03ff8db | Dependencies include native hooking/injection packages | Private distribution requires native dependency closure |
| PyPI metadata for pyMHF 0.2.4 | Includes pyrun-injected==0.2.0, pywin32, cyminhook, pymem and other dependencies | Evaluate exact wheels and native loading |
| PyPI files for pyrun-injected 0.2.0 | Windows x64 wheels listed for CPython 3.9 through 3.13 | CPython 3.13 is a candidate, not yet a verified full stack |
| pyMHF inspected main.py | Contains an already-running-process path and transfers module paths | Supports investigating attach-after-launch; private bundle still unverified |
| pyMHF inspected injected.py | Interactive execution server on 127.0.0.1:6770; optional HTTP server on 0.0.0.0:5000 | Must remove/disable unwanted endpoints in release integration |
| pyMHF main/injected code | Terminal shutdown interactions and socket logging exist | Disabling endpoints may require lifecycle/logging adaptation |
| NMS-Newton ad23813767f0ae5a963d9d3dd261c59a63454e2a | interactions.py hooks GiveGenericReward | Reference for observation, not proof of arbitrary delivery |
| NMS-Newton repository metadata | License not identified in the earlier query | Do not incorporate without explicit license review |
| pljeroen/nmstoolkit README | Save editing and Corvette/extraction features; preview limits described | Reference for definitions, not runtime delivery evidence |
| MBINCompiler docs | Version-sensitive MBIN conversion using MXML | Separate converter from PAK extraction; bundle compatible tools |

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
| Which game build/distribution is available? | Inspect selected installation when runtime work is authorized | Compatibility proof |
| Which native path accepts item/quantity? | Observe game reward/inventory call chain | M2 |
| Which callback/thread is safe? | Instrument and validate context/lifetime | M2 |
| Does embeddable Python support this injector? | B0 + actual in-process import/load proof | M1 acceptance |
| Are all DLL prerequisites private? | Dependency inventory and clean-machine execution | Plug-and-play claim |
| Can unwanted upstream endpoints be disabled cleanly? | Inspect pinned code/config; patch only if necessary | Runtime release |
| Which PAK/image tools are distributable? | Capability and license review | Complete M3 package |
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
