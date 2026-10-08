# AI continuation guide

**Checkpoint 2026-10-06 late night (Claude Code).** Two increments, both
offline:

1. *Seed viewer path.* `export-scene-glb.py` turns any corpus scene into a GLB
   for the desktop Model workshop and, with `--seed`, keeps only the parts the
   descriptor traversal port selects. All ship, multitool and freighter scenes
   export; seed `0x7` was rendered for sixteen of them. Read
   [model preview research](MODEL_PREVIEW_RESEARCH.md#native-scene-export-and-seed-selected-renders-2026-10-06).
   Next: bind the palette ports to the placeholder materials (colored
   preview), compare one render with an in-game entity of known seed, look at
   `freightersmall_proc`, then move conversion into the application.
2. *Installed technologies.* The selection routine and the procedural upgrade
   generator are ported and compared with the original code. Read
   [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md#selection-port-compared-with-the-original-2026-10-06-later).
   Final counts: 36,000 selection cases and 14,640 instance-aware cases
   (`instances-v2-*`), 0 differences, across freighter stores, every ship
   class argument, the multitool and the exosuit; reports are in
   `default-technology-port-matrix-20261006`. Next: natural caller
   arguments, the boosted-roll percentage, then the base-stat generator
   (`4cea20`, read but not ported: one draw per entry of the class row,
   `value = unit * (max - min) + min`, table selected by `4ce9b0`).

3. *Base stats* are ported and instruction-compared (71,264 cases):
   [inventory class research](INVENTORY_CLASS_RESEARCH.md#base-stat-generation-ported-2026-10-06-offline).
4. *Colored previews*: `export-scene-glb.py --palette-seed` paints materials
   with the base palette port (flat color, most probable texture option).
   The next real algorithm to close for colors is the seeded, model-wide
   texture option choice (paint style) with its natural resource order and
   seed; see [model preview research](MODEL_PREVIEW_RESEARCH.md#colored-seed-previews-2026-10-06-later).

5. *Reference check.* Three public seeds reproduce their recorded shapes in
   the workshop after a level-suffix fix; colors need real layer textures.
   Renders made before that fix must be redone. See
   [the comparison table](MODEL_PREVIEW_RESEARCH.md#comparison-with-public-reference-seeds-and-two-corrections-2026-10-06-night).
   Next bounded step: extract the layer DDS files of the fighter and hauler
   texture lists, composite by selected option and palette sample, export UVs.

6. *Textures (2026-10-07).* The exporter bakes selected layer textures into
   embedded PNGs and the workshop accepts them. Imaging tools live in
   `%LOCALAPPDATA%\NMSCourier\research-tools\python-imaging`. Open for colors: why fighter `0xA547AB958C97E439` renders yellow
   accents where the public note records red (alternate palette branch,
   texture seed, order). See
   [baked textures](MODEL_PREVIEW_RESEARCH.md#baked-layer-textures-in-the-workshop-2026-10-07).

7. *Names (2026-10-07).* The game's own name routines run under emulation
   and reproduce two names known from the game:
   [name generation research](NAME_GENERATION_RESEARCH.md).
8. *Natural generation order (2026-10-07).* One wrapper (`4ccfa0`) draws
   class, layout, technologies and base stats from the same seed:
   [inventory class research](INVENTORY_CLASS_RESEARCH.md#one-wrapper-one-seed-natural-generation-order-2026-10-07-offline).
   Next: read the wrapper's callers for the seed they pass; resolve the ship
   palette question; move scene conversion into the application.
9. **Corvette delivery is no longer deferred (2026-10-07).** A live run
   produced an owned S corvette with 120 + 120 slots, all technology slots
   special, from a user export, through the game's own build reward
   `R_BIGGS_NEW`, with a static research mod supplying the layout and the
   validation switch. Read
   [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md) from "The game's
   own creation route" onward. Next: replace the mod by per-request memory
   steps, test restart persistence and a save without a corvette. Still
   deferred: reading the installed game's
   files directly (which also covers in-application scene conversion); see
   `TODO.md`.
10. *2026-10-07, later.* Purchase setup passes the entity seed to the
    generation wrapper, and the palette's primary paint sample agrees with
    seven public references. Open in "seed profile" terms: a single tool that
    prints class, slots, technologies, base stats and name for one seed
    (the ports exist separately; now `evaluate-seed-profile.py`; still unported: the layout routine
    `4ce460` and `4d5690`), and color placement.

11. *2026-10-07, last.* Slot count and grid are ported (121,836 cases);
    builds 180383 and 180836 have identical code for 28 routines and
    identical data for 8,289 members; the freighter name matches exactly in
    Brazilian Portuguese. See
    [inventory class research](INVENTORY_CLASS_RESEARCH.md#build-180836-same-code-same-data-2026-10-07-offline).
    Still open: color placement on ships (waiting for an in-game picture of
    the user's seed-0 hauler; render in
    `E:/NMS-Courier-Research/preview-models/owned-20261007`), valid grid
    positions (`4cfe20`), unread wrapper call sites.

12. *Documentation format (2026-10-07, user rule).* Everything is Markdown.
    The 108 former `.tsv` selections and tables and the two `.txt` asset
    lists under `runtime/research` are now Markdown data tables with the same
    base names; `markdown_data.py` parses them, and
    [the data file catalog](DATA_FILE_CATALOG.md) links every data file,
    including the JSON fixtures that keep their format. The rule is in
    `AGENTS.md`.

13. *New user requests (2026-10-07), planned only:* in-place upgrades of
    owned ships, the exosuit and multitools, and delivery of ordinary ships
    from plain exports. See
    [owned inventory upgrade notes](OWNED_INVENTORY_UPGRADE_NOTES.md).

14. *In-place upgrades work live (2026-10-07).* Class by the game's own
    rewards; full 10 x 12 grids and all-special technology slots written to
    the current ship, the equipped multitool and the exosuit. Read
    [live bridge operations](LIVE_BRIDGE_OPERATIONS.md) first (how requests
    are sent and what is a native call versus a direct write), then
    [owned inventory upgrade notes](OWNED_INVENTORY_UPGRADE_NOTES.md).
    Installed DLL: `37eecaaf...f1fa`. Open: restart persistence of multitool
    and exosuit, per-request corvette layout without the mod, ordinary ship
    delivery.

15. *Organization rules (2026-10-07).* One domain per file and exactly 14
    interface languages are now rules in `AGENTS.md`. Requests to the
    research profile go through the per-domain scripts in
    [`runtime/native/asi/signal/`](../runtime/native/asi/signal/README.md)
    (not yet used live; the combined script was removed). Pending: split the
    profile DLL source per domain, translate eleven languages (`TODO.md`).

16. *Technology delivery (2026-10-07).* Three modes (one, several, all) and a
    permanent never-deliver list for defective and internal entries. Read
    [technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md). Offline work is
    complete; installed DLL is now `4cea02b7...f6b3` (after the owner's review of
    the block list). Next bounded step: with
    the game open on a copied save, run
    `runtime/native/asi/signal/signal-technology-180836.ps1 -PreflightOnly`,
    then one ID with `-ShowAlert`. *Done later the same day:* one, then all 205,
    taught live by the profile's counters; the owner's confirmation of the
    catalogue and the save-and-reload check are still open.

17. *Other known lists (2026-10-07).* Glyphs, words, recipes, products,
    specials and fish were triaged offline in
    [known lists triage](KNOWN_LISTS_TRIAGE.md): what is useful, what the
    game's own routine refuses, and the 14 repeatable specials that must
    never be marked known. Nothing delivered. Upgrade-module products are not
    learnable (technology notes). The owner put expedition, Twitch and
    platform rewards in scope and added fossils and raw materials; all are
    triaged, none built. Next: glyphs.

18. *Slots and account scope (2026-10-07).* One save folder, several slots,
    account data shared by all; the test save is **slot 3** (`save5.hg`,
    `save6.hg`). Read
    [live bridge operations](LIVE_BRIDGE_OPERATIONS.md#saves-slots-and-account-data)
    before any live action; name the slot in every record.

19. *Recipe delivery (2026-10-07).* Built and installed, not run live. Read
    [recipe delivery notes](RECIPE_DELIVERY_NOTES.md). Installed DLL is now
    `22cf6a82...f545`. Next bounded step, with the game open on slot 3:
    `runtime/native/asi/signal/signal-recipe-180836.ps1 -PreflightOnly`, then
    one ID, then `-All`.

20. *Slot-side rewards and slot identification (2026-10-07).* Read
    [reward redemption notes](REWARD_REDEMPTION_NOTES.md). The owner wants
    the active slot changed and the account data left alone. Installed DLL is
    now `3c7a6fcc...4269` (recipe, redeem, fish and fossil requests, none run
    live).
    Fish do have a per-slot record and a game routine (not built);
    fossil bones are account-level seen products. Next, with the game open on slot 3:
    `runtime/research/identify-loaded-slot.py`, then the recipe test, then
    one decoration-type season reward.

21. *Profile source split (2026-10-07).* The research profile is now one file
    per domain in `runtime/native/asi/profile_180836/`
    ([file map](../runtime/native/asi/profile_180836/README.md)), built with
    `-Mode Profile180836`. Installed DLL: `2bd83437...ca78`. Older notes that
    name `freighter_class_180836.c` or `FreighterClass180836` describe the
    earlier single file. The status file is `native-profile-180836-<PID>.log`.

22. *Live deliveries to slot 3 and product recipes (2026-10-07).* Recipes
    (1,684) and the fishing record (220) were delivered live; the fossil
    account request was withdrawn. Product recipes are classified and built
    but not installed: read [product delivery notes](PRODUCT_DELIVERY_NOTES.md).
    DLL `a6c01dbc...ecda` is installed (game closed, nothing sent to it yet);
    the saved slot 3 files hold 1,684 recipes and 220 fish. The 108
    catalogue items and 91 craftable technology products were then taught
    live to slot 3, then all 1,067 build parts (known products 601 -> 1,802;
    saved by the 21:19 autosave). The game then crashed in the graphics
    driver module, cause unknown: first check that slot 3 loads and the
    research terminals are stable. Installed DLL is now `68fd60bc...d5a7`
    (adds class `research_tree`, 106 hidden products the terminals offer; sent
    to slot 3 in process 17548: 1,905 known products, saved and confirmed on
    screen by the owner). Open: five freighter rooms became known unrequested; corvette
    part unlocks are not products.

23. *Character customisation (2026-10-07).* Read
    [customisation unlock notes](CUSTOMISATION_UNLOCK_NOTES.md): 263 products
    of class `customisation` are mapped. A known product does not open an
    option; the slot-side special routine does. All 263 were sent with
    `signal-customisation-180836.ps1 -All` (262 changed), confirmed on screen
    and in the automatic save (274 known specials). Titles: only an account
    list is known; a slot route would go through statistics.

24. *Network-player delivery, evidence only (2026-10-07).* The owner showed
    that the reference service delivers to unmodified clients, account-wide;
    see "What the reference shows about delivery to another player" in the
    [reference feature catalog](REFERENCE_FEATURE_CATALOG.md). Not started;
    the first study is which multiplayer messages make a peer run a reward.

25. *Account scope (2026-10-07, evening).* The owner accepts account-level
    results. The `redeem` event was found to unlock specials on the account
    as well as in the slot; back up both account files before using it. What
    each account list needs is tabulated in
    [reward redemption notes](REWARD_REDEMPTION_NOTES.md#what-can-be-done-on-the-account-state-on-2026-10-07).

26. *Account emptied for testing (2026-10-08).* The owner emptied
    `accountdata.hg` with an editor and authorised emptying the unlock lists
    of the settings file (backup `20261008-before-settings-list-reset`). This
    was test preparation only and had no effect: the game started with the
    full account and rewrote both files, so the account is restored from
    outside the machine. Testing an account route on a lacking account needs
    an offline start or another account. See the experiment log.

The user asked on 2026-10-06 for complete algorithms for **all** ship,
multitool and freighter categories (normal, capital, pirate), not single
example seeds, and pointed at the workshop as the place to check results.

Product direction restated by the user (2026-10-06): seeds must be understood
completely for ships, freighters and multitools so the frontend can generate
good entities by intent, not only by typed seed. The per-property status table
and work order are in [the category ledger](SEED_CATEGORY_LEDGER.md).

Newest research note: [default technology](DEFAULT_TECHNOLOGY_RESEARCH.md),
2026-10-06. Table facts are confirmed (for example Plasmatic Warp Injector is
`F_HDRIVEBOOST2`, Freighter, VeryRare; the test reward's teleporter is rarity
Impossible), and the native selection routine `4cef50` now **runs under
emulation** with the original table (`emulate-default-technology.py`):
freighter results are complete under stated assumptions, ship and multitool
results lack the procedural table. The user ranks natural default technologies for freighters, ships
and multitools as very important. Next: port and compare `4cef50`, then decide
between calling it natively at delivery and an explicit list.

**Fifth live result, 2026-10-06 evening:** scene, model seed and home seed per
request work; the user now owns an S pirate freighter (120 cargo, 120
all-special technology slots) and three offers were sent in one process. Open:
the visible model updates only after restart (flags `+0x461`/`+0x463` and
`543690` are the leads), the natural technology loadout, base-transfer effects.
Installed DLL: `f36ba9d6...`.

**Persistence confirmed, 2026-10-06 evening:** the delivered freighter kept S,
120 cargo and the all-special technology grid after save and restart. Built and
awaiting a first run: per-request scene, model seed and home seed plus
repeatable dispatch (DLL `f36ba9d6...`). Target example: pirate scene with
model seed `0x8C968767B3282F13` and home seed `0x175000B001FFD`.

Next user-requested target (not started): per-request freighter category and
seeds, starting with the pirate capital freighter example recorded in
[inventory class research](INVENTORY_CLASS_RESEARCH.md#next-target-requested-by-the-user-freighter-category-model-and-seeds-2026-10-06).
Restart persistence of the fourth live result is still to be confirmed first.

**Fourth live result, 2026-10-06:** with DLL `99a887a3...` the user accepted an
offer and now owns an S freighter showing 120 cargo and 120 technology slots,
all technology slots special, default technologies kept. One run; restart
persistence is the next check, then the same defaults for ships, multitools
and the exosuit, appearance/seed selection, and a repeatable command path
(the user requires many requests per session in the final bridge). Details:
[inventory class research](INVENTORY_CLASS_RESEARCH.md).

**Third live result, 2026-10-06:** the offer showed S, 120 cargo, 120
technology slots, all technology slots special. Accepting did **not** carry
the technology store to the owned freighter (`carry_applied=0`); a revised DLL
`99a887a3...` with relaxed recognition and caller diagnostics is built and
awaits a run. Read the carry log fields first after the next acceptance.

**Second live result, 2026-10-06:** class S plus 120/60 offer grids shown on
build 180836; the first accepted S freighter stayed S after restart (user
report). Built but **not yet run**: all technology slots special, 12-row
technology grid, acceptance-time technology carry (DLL `ec4da1c7...`). See
[inventory class research](INVENTORY_CLASS_RESEARCH.md) for rules, hashes and
risks before signaling. User defaults: S, all slots, all technology slots
supercharged, default technologies kept.

**Live result, 2026-10-06:** the `FreighterClass180836` profile produced an
S-class freighter offer on build 180836 in one run (log and screenshot recorded
in [inventory class research](INVENTORY_CLASS_RESEARCH.md)). The profile DLL
`b3fcecf7...` is currently installed in the game directory. Open items:
acceptance/persistence check and unlocked slot counts (user wants all cargo
and technology slots). Each new process allows one dispatch; never retry.

Latest increment, 2026-10-06 (Claude Code): the user approved the installed
build **180836** (SHA-256 `13d5060d...cc3499`) as target and standing
commit/push to `main`. [Inventory class research](INVENTORY_CLASS_RESEARCH.md)
now holds the 180383-to-180836 relocation table, the acceptance-time class copy
and an **untested** request-scoped freighter class profile
(`runtime/native/asi/freighter_class_180836.c`, production DLL `b3fcecf7...`,
fixture passed, not installed). Next action is the proposed live validation in
that note, with the user present on a disposable save; do not install or signal
unattended and never repeat its one-shot dispatch. The reference-site feature
backlog is [the feature catalog](REFERENCE_FEATURE_CATALOG.md).

Newest checkpoint: [inventory class research](INVENTORY_CLASS_RESEARCH.md),
2026-10-06 (Claude Code). **Read its environment section before running any
tool:** Steam replaced the installed `NMS.exe` on 2026-10-05 (new SHA-256
`13d5060d...cc3499`, not build 180383); the exact 180383 executable was
recovered to `E:\NMS-Courier-Executables\180383\NMS.exe`; Ghidra, the JDK,
Unicorn and pinned references physically live under Codex's packaged-app
directory `%LOCALAPPDATA%\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\NMSCourier`.
Recovered: seed plus solar-system wealth row to C/B/A/S class (`4cfd10`), the
wrapper type filter (`4ccfa0`) and the static reason the specific-ship freighter
reward stays C (`8e3a10` kind 3 passes class 0). 619 original-instruction
comparisons, zero mismatches. Not established: natural freighter purchase path,
live row source, any class-setting API. Next steps are listed in that note.
The appearance checkpoints below remain valid for build 180383 only.

Newest checkpoint: [explicit colors](CUSTOMISATION_COLOR_RESEARCH.md) and
[category ledger](SEED_CATEGORY_LEDGER.md), 2026-10-05. Lookup/quantizer/overlay
have 309 original-instruction matches. Catalog: 293 descriptor sources with
per-option unfiltered draw intervals, 343 textures. Latest user priority is ships,
multitools and freighters; further NPC work is deferred, preserving 33 recursion
matches and 11 joined traces. Begin at the ledger's exact next steps. Every AI
must maintain the portable handoff rule in [AGENTS.md](../AGENTS.md).
Owned-tool `UseLegacyColours` now maps to the palette-task flag through runtime
`+2bd`, exported `+281` and its named metadata literal. Explicit research/search
inputs are connected and three-category regression passes. Next inspect
the checked `552730` callers `8ebad1`/`13f8340`: one reads a frame byte, the
other supplies literal 1. Identify their contexts from existing bounded windows;
do not repeat the closed metadata link or assign every tool the same flag.

Newest algorithm checkpoint: [palette task routing](PALETTE_TASK_ROUTING.md).
The file-backed magenta fallback is recovered, with 404 native-literal matches.
Sixteen initial-dispatch comparisons verify flag/bank selection; search accepts
task inputs and rejects precomputed/mode-5 inference. Ship/tool/freighter
integration passes. Next trace threshold initialization and source flags/bank
population per category; do not repeat the closed matrices.

Latest stages 4–5 implementation: [appearance search and recipes](APPEARANCE_SEARCH_AND_RECIPE.md).
Bounded constraints-to-candidate search and hash-bound preview recipes are
implemented and rendered-tested. Native DDS/mask/shader reproduction and a
complete inverse remain open; do not report these stages as fully complete.

Latest owning checkpoint: [packed scene materials and seed context](PACKED_SCENE_SEED_CONTEXT.md).
Latest implemented input connection: [category input pipeline](ENTITY_INPUT_PIPELINE.md).
Use `evaluate-entity-inputs.py` for supplied owned ship/tool/freighter and ship
purchase inputs; it preserves separate model/palette/material pairs and supports
seeded or explicit pieces. Six joined traces pass; this is offline, not renderer
IPC or live memory reading. Unknown category routes remain unsupported.
Use its exact factory/collector associations and reproduction commands. Native
comparisons: 353 material/context/reference cases, 74 explicit recursion cases,
192 filter-cache cases and 102 ALTID cases;
nineteen joined scene traces use explicitly supplied context inputs. Read its
acceptance ledger before saying gates 1–3 or natural resource loading are complete.

Checkpoint: 2026-10-04. This repository-local entry works with any AI that can
read Markdown; it does not depend on a globally installed Codex skill. Root
[AGENTS.md](../AGENTS.md) routes here. User conversation is Portuguese; repository
documentation/code/diagnostics are English. Read this guide first, then only the
owning documents for the selected task.

## Current objective and boundaries

Latest active scope: implement gates 4–5 (rendering and whole-entity inverse
solving), authorized after the input pipeline checkpoint. Begin at
[appearance search and recipes](APPEARANCE_SEARCH_AND_RECIPE.md), then
[recursion and owned inputs](SEED_RECURSION_AND_OWNED_INPUTS.md)
and the latest block in [the handoff](SEED_RESEARCH_HANDOFF.md). These supersede
the older next-target paragraphs below: complete descriptor recursion has 273
matching cases, the loaded-node collectors are identified, and the named owned
freighter palette field is connected. Natural whole-scene resource resolution and
all acquisition/preset contexts remain open. Do not claim universal completion.

Recover the procedural appearance algorithm, prioritizing ships, multitools and
freighters; frigates and NPCs are deferred: resource/category, descriptor pieces, palette
inputs, texture alternatives, decal selection and material masks. Ultimately
support accurate local previews and desired appearance delivery. The user
specifically requires user-selected parts/colors/decals to a matching seed,
not a random generator or catalog alone. See the exact-result boundary in
[priority catalog](PRIORITY_APPEARANCE_CATALOG.md). The user
permits offline analysis and existing preview inspection while unavailable for
live tests. Do not infer permission to mutate a remote/unattended game.

Delivery remains through verified live game functions; save editing is never a
shortcut. Unknown builds receive no mutations. No D: access, storage repair,
BitLocker changes or repeated full extraction is part of this work. Read existing
bounded reports/indexes instead. Preserve uncertain one-shot outcomes.

Latest checkpoint: [ordered multi-resource selection](MERGED_TEXTURE_SELECTION_RESEARCH.md)
joins original wrapper/collector/selector instructions in 390 isolated cases,
including both payload slots and the unnamed-layer exception. Next identify the
concrete virtual `+0xd8` resource-vector producer called by `62f420` and correlate
natural order with selected descriptor references. Do not repeat the completed
matrix or assume alphabetical resource order. Full appearance inversion is open.
The [REA/Ghidra assessment](REA_GHIDRA_ASSESSMENT.md) records the new two-helper
export, rejected cache/reference-count leads, pinned external tooling and exact
tool-path correction. Follow concrete object construction rather than treating
generic resource lookup as a seed/material selector.

Superseding continuation: [material/descriptor/category context](APPEARANCE_CONTEXT_RESEARCH.md)
identifies `18dae90 -> node(+1c8).virtual(+20)`, aggregate `1833ec0` and material
leaf `1839e10`. Fifteen loaded-tree fixtures and 360 explicit descriptor contexts
match original instructions. Source setter `5417f0` connects message resource
and palette pairs to the freighter cache. Do not call the three broad boundaries
complete: loader child order, full recursion/filter acquisition, all variants and
the owned HomeSystemSeed writer remain unclosed. The original research selections
and bounded emulator are committed; proprietary evidence remains external.

Resumed detail: `18ddc70` appends selected/factory-created children in packed
input order; `21f4a0` preserves insertion; `2d698c0` checks 31-byte uppercase IDs
then a 15-character fallback. The first 413-case comparison found that off-by-one;
corrected 420-case comparison passes. Use `scan-scene-child-fields.py` for bounded
offset leads, treating its 14 skipped fragments and every candidate explicitly.

## What exists, what has actually been established

| Area | Evidence status | Owning reference |
| --- | --- | --- |
| Electron foundations/private runtime | Implemented; clean offline end-user acceptance still open | [Project plan](PROJECT_PLAN.md), linked architecture/distribution specifications |
| Carbon and three currencies | Historical exact-build live success, native currency notifications and normal-save persistence | [Experiment log](EXPERIMENT_LOG.md); do not extend to newer builds |
| Free freighter offer | Historical C/120 cargo/30 technology offer; S/all-supercharged/Pirate delivery not established | [Native acquisition](NATIVE_ACQUISITION_RESEARCH.md), experiment log |
| Runtime observation on newer build | Observation evidence only, distinct from migrated delivery | Project plan and experiment log |
| Integer PRNG, weighted choice, immediate child mixer | Selected x64 windows checked by isolated emulation; full caller schedules incomplete | [Inversion/emulation](SEED_INVERSION_AND_EMULATION.md) |
| Child inverse | Zero-to-four initializer preimages for one immediate child branch; not a whole appearance inverse | Same note; `invert-child-seed.py` |
| Descriptor traversal | Implemented bounded default-path candidate; missing refs, filters and draw order documented; no full game oracle | [Seed research](PROCEDURAL_SEED_RESEARCH.md); `evaluate-descriptor-seed.py` |
| Base palette schedule | Implemented partial 66-family/five-sample candidate; alternate branch and entity inputs not universally verified | Same note; `evaluate-base-palettes.py` |
| Ship/tool/freighter/frigate/NPC inputs | Selected source fields/callers recovered; natural NPC generation incomplete | [Entity seed flow](ENTITY_APPEARANCE_SEED_FLOW.md) |
| Planet/fauna/flora inputs | Separate child streams, overrides and category gaps | [Planet/fauna flow](PLANET_FAUNA_SEED_FLOW.md) |
| Texture/decal channels | Restricted fresh single-resource selector compared against original instructions: 468 cases, 18 resources/35 layers; native collector/merged order still open | [Texture flow](APPEARANCE_TEXTURE_SEED_FLOW.md), [selector emulation](TEXTURE_SELECTOR_EMULATION.md), [coverage](SEED_RESEARCH_COVERAGE.md) |
| 3D workshop | GLB mesh visibility, orbit/zoom and tint implemented and rendered-tested; native DDS masks/current geometry conversion incomplete | [Preview research](MODEL_PREVIEW_RESEARCH.md) |
| Complete requested parts/colors/decals-to-seed generator | Not established | Never label partial evaluators or arbitrary mesh tinting as this capability |

Consult the historical [handoff](SEED_RESEARCH_HANDOFF.md) for the detailed
identification method. It is a chronology/checkpoint, not a claim that every
listed function is a safe live API.

## Locate existing evidence efficiently

1. Check `git status --short` and the latest commits; preserve unrelated work.
2. Read [research navigation](RESEARCH_INDEX.md) and
   [source/function map](RESEARCH_SOURCE_FUNCTIONS.md). Find the exact script,
   native stage or owning note before reading pseudocode.
3. Query external navigation SQLite/TSV using the commands in
   [pipeline README](../runtime/research/README.md). The existing corpus index is
   `E:\NMS-Courier-Research\corpus\index.sqlite`, opened with `?mode=ro`.
   Use exact logical paths or narrow `LIKE ... LIMIT` queries. Ambiguous sources
   remain explicit; do not guess precedence.
4. Native exports are in `E:\NMS-Courier-Research\acquisition-180383`.
   Use each stage's `manifest.tsv` to locate `<rva>.c`. A launcher exit code or a
   filename label is insufficient evidence. Proprietary assets/pseudocode stay
   external; only original tooling, selections and findings belong in Git.
5. Reports are in `seed-analysis-180383`; preview evidence in `preview-models`.
   These are transient local evidence. Reproducible repository commands must
   remain sufficient to regenerate selected evidence if it is unavailable.

Exact offline executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Game path: `E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe`.
Verify both before another offline pass; this fingerprint grants no runtime ABI.

## How the research is performed

1. Follow data dependencies: category/resource table -> descriptor -> selected
   scene/material -> texture alternatives -> palette binding -> DDS/masks.
   Do not assume one seed controls every stage.
2. Locate native candidates from pinned public references and exact metadata,
   then direct callers. Distinguish loaders, serializers, cache keys, predicates
   and genuine consumers of random state. Record rejected hypotheses.
3. Resolve PE chained unwind roots before assigning incoming parameters. Export
   a small committed TSV using `analyze-acquisition-offline.py` with the existing
   Acquisition180383 project. One Ghidra writer at a time; no reimport/analysis.
   Keep fixed CPU/memory/time/output/free-space bounds.
4. Compare pseudocode with bounded disassembly for arithmetic, constants, branch
   conditions and source offsets. Neither inferred names nor public schemas are
   current-build ABIs. A byte stride alone does not prove a semantic type.
5. Port only a recovered, explicit branch. Keep unknown inputs/selection modes
   visible. Synthetic tests check tooling; independent arithmetic agreement
   does not replace native entity fixtures.
6. Use the current 3D workshop for visual checks. Separate neutral mesh tint from
   native texture-mask composition. Record model/data hashes and screenshot
   observations; arbitrary visual edits do not prove a matching seed exists.

Research Python/toolchain paths are developer-only. Do not add them as end-user
requirements or first-launch downloads. Commands and private-tool details live
in the pipeline and owning notes rather than being duplicated here.

## Next continuation

Start with [decal/texture selection research](DECAL_TEXTURE_SELECTION_RESEARCH.md).
The previous pass mistook the task's 32-byte input for selection context without
knowing its writer. The subsequent 63f290 export shows a hash-derived cache key
over already prepared records. State-5 62ebd0 preparation now reaches the actual
631310 selector through 62f940/62fba0 collection. The bounded first-pass tool
now has `--phase fresh-single` for final restricted rows and exit state;
the fallback/base-matching subset is compared in 468 native-emulated cases.
Read [the emulation continuation](TEXTURE_SELECTOR_EMULATION.md), then
[collector continuation](TEXTURE_COLLECTION_RESEARCH.md): unlinked IgnoreName
collection now agrees in 65 native-isolated cases. Continue linking collection
to the merged full selector and resource order plus natural caller correlation.
The [priority catalog](PRIORITY_APPEARANCE_CATALOG.md) maps 229 descriptor sources
and 131 texture resources with guards/references; it is declarative, not inverse.
The default owned ship/tool task seed chain is connected in that note. Do not
retrace 630d50/6308a0/63ae70 or mistake this subset for native material rendering.
Keep explicit customisation (11499c0) separate from natural seed generation.
The owning note records the latest resolved callees and remaining target.

For another category, use the exact source-writer continuation in its owning
entity/planet note. For runtime delivery, leave this offline branch and read the
project plan plus the relevant runtime specification/experiment before acting.

## Finish each meaningful increment

- Update the owning finding and [experiment log](EXPERIMENT_LOG.md): exact build,
  committed selection/configuration, trigger/save conditions (or offline),
  observations, failures, unknowns and rollback state.
- Update this guide's current continuation only when the target changes; avoid
  copying whole reports into AGENTS.md or growing a duplicate experiment log.
- Register completed native stages in `build-research-index.py`, then regenerate
  navigation and the source/function map. Preserve explicit import warnings.
- Run checks appropriate to changed tooling/UI; docs-only changes need no app
  build. Verify selection hashes/manifests and relative documentation links.
- Commit/push authorized meaningful increments without a PR. Use
  `Co-authored-by: Codex <267193182+codex@users.noreply.github.com>`; never put
  `@codex` in the subject. Verify remote ref and clean worktree before reporting.
- Tell the user the concrete result and remaining boundary. Never report a
  candidate, partial port or queued operation as complete game functionality.
