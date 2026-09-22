# Self-contained Windows distribution

Status: required design and acceptance plan. No runtime bundle has been built or tested yet.

## 1. End-user contract

The user acquires one complete application package, extracts or installs it, and opens NMS Courier. They do not install Python, pip, uv, Node.js, pnpm, .NET, SQLite, Visual Studio, compiler tools, or MBINCompiler separately.

Required runtime files and approved third-party tools are assembled on our build machine and distributed as private application resources. The first launch must not download dependencies or run a package manager. A missing bundled dependency is a packaging defect, not a request for the user to install something globally.

This does not mean one physical executable. A folder containing an executable and private resources is a valid plug-and-play distribution. It also does not promise support for every Windows/game version: the supported OS baseline and game builds must be documented and tested.

### Distribution formats

1. **Complete Windows x64 ZIP:** extract the entire archive into a writable local location and launch the application. No application installer is required. Application data uses the normal per-user data directory by default.
2. **Offline per-user NSIS installer:** installs the same payload and optional shortcuts without adding global runtimes. No web/bootstrap installer. No automatic machine-wide elevation requirement.

A ZIP is portable as an application payload; it is not initially a promise that all user data travels beside the executable. A fully portable data mode would require a separate writable-path and migration design.

## 2. Dependency ownership

| Dependency | Developer/build machine | End-user package |
| --- | --- | --- |
| Node.js | Pinned version for pnpm/build tools | Electron's own runtime; no standalone Node prerequisite |
| pnpm | Install/build/test workspace | Not needed or invoked |
| CPython | Controlled interpreter for resolving/building dependencies | Private tested CPython distribution |
| uv/pip | Resolve, fetch, stage approved packages | Not needed or invoked |
| Python packages | Locked wheel set and reviewed builds | Preassembled modules, metadata, extensions, DLLs |
| SQLite | Native driver built for Electron | Driver/native binary bundled; no server |
| .NET for catalog conversion | SDK may be needed to build a tool | Self-contained tool if required; no global .NET prerequisite |
| PAK/image tools | Build or acquire approved artifacts | Ship required tool and native dependencies locally |
| C/C++ build tools | Needed only if approved native builds require them | Never compile on the user's computer |
| Native runtime DLLs | Audit redistributable requirements | App-local files where supported and redistribution-approved |
| Game assets | Read from a test installation for local validation | Read from user's installation; not bundled |

Do not use the presence of a working NMS installation as proof that all our DLL dependencies are installed globally. Measure the actual dependency closure.

## 3. Python strategy

### Primary candidate: private CPython embeddable distribution

The official Windows embeddable package is intended to be included with another application. It contains an interpreter and standard library, and supports restricted import paths. Third-party modules should be assembled with the application rather than installed by end users. [Python Windows documentation](https://docs.python.org/3/using/windows.html#the-embeddable-package).

Use a pinned ordinary GIL-enabled x64 build. CPython 3.11.9 is the initial candidate because NMSpy currently documents support through Python 3.11 and pyrun-injected 0.2.0 exposes a cp311 Windows x64 wheel. Python 3.11.9 is the last 3.11 release with official Windows binaries. All dependencies and in-process behavior must still be tested before selection.

### What must be included

- Interpreter executable and version-matched Python DLLs.
- Standard library and required built-in extension modules.
- Our runtime package.
- Exact NMS.py and pyMHF package versions/revisions.
- Their complete resolved dependencies, including native .pyd modules and helper DLLs.
- Package metadata required for entry-point discovery and importlib.metadata.
- Configurations, required data files, and licenses.
- Any approved native runtime dependencies needed by those binaries.

Do not prune package metadata or optional-looking assets without import/entry-point tests. NMS.py declares plugin entry points and its inspected dependency includes pyMHF GUI/API extras. Unused services should be disabled by a verified integration; deleting arbitrary files is not a dependency strategy.

### Build-time assembly sequence

1. Select exact Python patch, architecture, and ABI and verify the interpreter artifact checksum.
2. Resolve the complete dependency graph from the project lockfile in a controlled build environment.
3. Download a closed wheel set for the chosen Python/Windows target. Build any necessary wheel only on the build machine.
4. Preserve wheel hashes, source URLs, upstream revisions, licenses, and build provenance.
5. Stage the interpreter into an isolated build directory.
6. Install/unpack resolved wheel contents into that staging layout with correct wheel data placement and metadata. Do not assume a plain archive extraction handles every wheel layout.
7. Configure private import paths; explicitly include any required pywin32 directories/native loader paths.
8. Prevent importing from the working directory, user site-packages, or globally installed Python.
9. Test imports, metadata discovery, native DLL loading, and the project entry point using the staged interpreter.
10. Test the same bundle after moving it to a different path with spaces and non-ASCII characters.
11. Test in a clean environment with no development toolchain and no network.
12. Then prove injection/bootstrap and imports inside a supported NMS instance.

An environment built with uv can assist assembly, but copying .venv is not our distribution method. Virtual environments may contain absolute paths and interpreter references that are not relocatable.

### Import and DLL isolation

Use the embeddable distribution's path-control mechanism and tested bootstrap configuration. Any necessary site processing must be explicit and restricted; do not enable arbitrary user .pth execution just to make imports succeed.

Launch our private executable by absolute path with a structured argument list and no shell. Sanitize inherited Python-related variables. Use controlled DLL search directories. Child-only environment changes must not modify the user's PATH or registry.

Inside the game process, verify the injector's interpreter discovery, DLL loading, sys.path transfer, and metadata resolution separately. The inspected pyMHF source transfers paths from the launcher, so a contaminated development environment can conceal packaging defects.

If the game already contains another Python runtime/mod integration, detect and handle that combination explicitly. Do not load incompatible interpreters blindly or claim support without testing.

### Alternatives if the primary candidate fails

1. A relocatable private CPython distribution with the required conventional layout, fully bundled and audited.
2. A small, documented patch to the open-source integration for explicit interpreter/module paths or disabling unsafe auxiliary services, with license notices and regression tests.
3. A different verified bootstrap mechanism behind our adapter, with the architecture decision recorded.

Do not solve a failed private-runtime proof by silently requiring global Python. Freezing a launcher with PyInstaller/Nuitka is not proof that an injected interpreter will locate its DLLs/modules. A one-file self-extracting executable is not the initial strategy because stable on-disk runtime paths and loaded DLL lifetimes matter.

## 4. Native dependencies and auxiliary tools

### Electron and SQLite

Build/rebuild the SQLite native addon for the selected Electron ABI and Windows x64. Preserve the resulting native binary outside compressed-only paths where required. Test it with the packaged Electron runtime, not only ordinary Node.js. [Electron native modules](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules).

### Python native extensions

Inventory all .pyd and DLL files, their architecture, dependent libraries, and load paths. Test pywin32, cyminhook, pymem, pyrun-injected, and every native transitive dependency from the selected lockfile. Do not run a global pywin32 registration/postinstall process on the user's machine as a repair step.

### Catalog tools

PAK extraction, MBIN conversion, and image decoding are separate capabilities. Choose audited tools and package the complete dependencies for each enabled feature.

If using a .NET converter, produce or acquire a verified self-contained win-x64 build. “Single-file” alone does not prove that .NET is bundled; confirm the publishing mode and test without a global runtime. [Microsoft deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/).

Visual C++ app-local redistribution depends on the specific binary and permitted redistributable files. Audit and package only approved files; if an artifact requires an unsupported global installation, replace/rebuild that artifact or treat distribution as blocked. Do not claim the requirement is solved by bundling an installer the user must run. [Microsoft redistribution guidance](https://learn.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files?view=msvc-170).

### Why executables stay outside ASAR

ASAR is not a normal filesystem for every native operation. External executables, Python modules needing real paths, native extensions, and helper DLLs will be copied as real resources. Do not rely on transparent temporary extraction for long-lived injected dependencies. [Electron ASAR limitations](https://www.electronjs.org/docs/latest/tutorial/asar-archives).

## 5. Proposed release layout

```text
NMS-Courier/
  NMS Courier.exe
  ... Electron distribution files ...
  resources/
    app.asar
    app.asar.unpacked/
      ... native Node modules when required ...
    runtime/
      runtime-manifest.json
      python/
        python.exe
        ... version-matched interpreter DLLs and standard library ...
        ... explicit private import-path configuration ...
        site-packages/
          nms_courier_runtime/
          nmspy/
          pymhf/
          ... complete dependencies and metadata ...
      config/
        runtime-defaults.toml
    tools/
      catalog/
        ... approved PAK, MBIN, and image tools ...
    licenses/
      ... original notices and dependency inventory ...
```

This layout is conceptual. Exact DLL names/import-path filenames derive from the pinned interpreter and verified loader, not guessed values in documentation. Use Electron's resolved resources path in production and one centralized development path resolver.

runtime-manifest.json records bundle version, platform/architecture, Python version/ABI, dependencies and revisions, file hashes, required entry point, protocol compatibility, build provenance, and license inventory. Hashes detect corruption; release signing establishes authenticity. A manifest shipped beside modified files is not independent proof of trust.

## 6. Runtime startup and shutdown

1. Open the application UI without depending on game or runtime readiness.
2. Resolve resource and writable data locations.
3. Validate manifest compatibility and essential bundle files; cache expensive integrity checks using a defensible invalidation strategy.
4. Detect game instance and known build before loading integration code.
5. Start the private launcher by absolute path, without a visible console, with logs redirected locally.
6. Supply approved config and an ephemeral session credential through a protected channel, not logs or public command-line secrets.
7. Load the runtime through the verified mechanism and establish the Named Pipe handshake.
8. Publish readiness only after build, protocol, adapter, player, and capability checks.
9. On failure, keep the UI usable and show an actionable diagnosis.

Only load our controlled mod set. Do not auto-discover arbitrary user mods as part of this application's runtime startup.

Closing Electron must not terminate NMS. Unstarted work can be cancelled; a native call cannot be safely interrupted arbitrarily. An injected runtime may remain loaded but inactive until game exit. Do not delete/replace its resource directory while DLLs are loaded. Manual app updates must defer replacement until affected processes close.

## 7. Upstream services are a release gate

The inspected pyMHF revision contains an interactive execution server bound to 127.0.0.1:6770 and an optional HTTP path that starts on 0.0.0.0:5000 when mods expose endpoints. There is also socket-logging infrastructure. This is source evidence, not a claim that these services ran on this computer.

Our packaged integration must disable/remove the arbitrary execution terminal and unwanted HTTP/log listeners through verified configuration or a maintained minimal patch. Simply not using those endpoints from Electron is insufficient. Do not assume an upstream disable flag exists until confirmed.

If upstream lifecycle depends on these services, design and test the replacement shutdown/logging path. Prefer native configuration when available; otherwise record the patch, upstream revision, license, rationale, and regression tests. No distribution is accepted with an unauthenticated general-purpose execution endpoint.

Inspect actual sockets in the final package. Our application command channel remains Named Pipe; any unavoidable temporary loopback bootstrap must be explicitly justified, access-controlled, and documented before acceptance. Never accept an unintended public listener.

## 8. Writable data and repair

Use application-owned per-user directories for databases, cache, logs, session files, and future backups. Treat installation resources as immutable. Runtime configuration overrides must redirect upstream writes away from the game installation and read-only application resources.

When a bundle file is missing/corrupt: disable affected features, preserve user data, identify the component, and offer reinstall/re-extraction from the complete verified package. Do not auto-download a random DLL or ask the user to run pip.

Manual upgrades preserve user data, run versioned DB migrations, and refuse unsafe downgrades. No auto-updater initially. Uninstallation must not remove unrelated Python installations or game files. User data removal is a separate explicit choice.

## 9. Clean-machine acceptance matrix

| Scenario | Required result |
| --- | --- |
| No Python/Node/pnpm/uv/pip/.NET developer tools | UI and shipped capabilities run from private resources |
| Network disabled from first launch | No dependency downloads; useful local operation |
| No NMS installed | UI opens and explains installation selection |
| Compatible NMS installed | Catalog and runtime use bundled dependencies |
| Unsupported NMS build | Browsing works, runtime mutation blocked |
| Application path contains spaces/non-ASCII | Launch, imports, tool execution work |
| Read-only installation directory | All mutable data goes to user data |
| Hostile/mismatched global Python environment | Private runtime behavior unchanged |
| Standard Windows account | No blanket elevation requirement |
| Missing DLL/package file | Accurate bundle error, no global-install workaround |
| Existing different Python/mod runtime in game | Explicit compatibility handling, no blind double injection |
| Game still open during application update | No replacement/removal of loaded runtime files |
| ZIP moved after application/game exit | New resource paths resolve without old absolute references |
| Reinstall/manual upgrade | Preferences/library remain, migrations tested |

Use both a clean Windows VM for dependency isolation and a real supported game environment for attachment/delivery. UI smoke tests alone do not validate the embedded runtime.

## 10. Completion standard

Plug and play is verified only when the distributed artifact passes the matrix without developer caches, globally installed runtime packages, network downloads, or manual recovery commands. Until then it is a design requirement, not a marketing claim.
