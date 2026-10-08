# Model workshop

Status on 2026-10-08: **implemented in application 1.10.0, offline only.** The
workshop reads the selected installation's own archives and never touches the
running game, the bridge or a save. Nothing here was compared with the running
game seed by seed yet.

Older research (exporter, palettes, texture layers) is in
[model preview research](MODEL_PREVIEW_RESEARCH.md); this note owns what the
application itself does.

## What the user sees

The page has three tabs.

| Tab | What it does |
| --- | --- |
| Build | Choose category, type, parts and (for painted starships) the main paint colour. The application looks for a seed that has them and shows the model. |
| View a seed | Choose category and type, type a seed or draw a random one, and see the model, its paint colours and the parts it drew. |
| Model file | The earlier tools for a GLB file the user brings (part visibility, tints, palettes, appearance recipes). |

For a starship, "Get this one in the game" opens Starships, "Get a new one",
with the type and the seed filled in.

## Categories and types

Checked on 2026-10-08 against the game's part lists (`*.descriptor.mbin`,
build 180836) and against the type lists of the community customizer at
`nms.center` (read on the same day), which the project owner knows to agree
with the game.

| Category | Type | Game scene |
| --- | --- | --- |
| Starship | Fighter | `spacecraft/fighters/fighter_proc` |
| Starship | Hauler | `spacecraft/dropships/dropship_proc` |
| Starship | Explorer | `spacecraft/scientific/scientific_proc` |
| Starship | Shuttle | `spacecraft/shuttle/shuttle_proc` |
| Starship | Solar | `spacecraft/sailship/sailship_proc` |
| Starship | Exotic (ball and squid) | `spacecraft/s-class/s-class_proc` |
| Starship | Living ship | `spacecraft/s-class/bioparts/bioship_proc` |
| Starship | Interceptor | `spacecraft/sentinelship/sentinelship_proc` |
| Multi-tool | Standard (pistol, rifle, experimental, alien) | `weapons/multitool/multitool` |
| Multi-tool | Royal | `weapons/multitool/royalmultitool` |
| Multi-tool | Sentinel | `weapons/multitool/sentinelmultitool` |
| Multi-tool | Sentinel B | `weapons/multitool/sentinelmultitoolb` |
| Multi-tool | Atlas | `weapons/multitool/atlasmultitool` |
| Multi-tool | Staff | `weapons/multitool/staffmultitool` |
| Multi-tool | Atlas sceptre | `weapons/multitool/staffmultitoolatlas` |
| Freighter | Regular | `spacecraft/industrial/freighter_proc` |
| Freighter | Capital | `spacecraft/industrial/capitalfreighter_proc` |
| Freighter | Small | `spacecraft/industrial/freightersmall_proc` |
| Freighter | Tiny | `spacecraft/industrial/freightertiny_proc` |
| Freighter | Pirate | `spacecraft/industrial/piratefreighter` |

The site lists the same eight starship types and the same seven multi-tool
types. For freighters it lists regular, capital and the living frigate; the
game's files also have the small, tiny and pirate ones.

Part lists that exist in the game and are not offered:

- Special multi-tools with a list of their own: `retromultitool`,
  `rodmultitool` (fishing rod), `swarmmultitool`, `switchmultitool`,
  `staffmultitoolbone`, `staffmultitoolruin`, `staffnpcmultitool`,
  `gravitygun`.
- Special fighters: `fighterclassicgold`, `rasamamagold`.
- Frigates (`frigates/livingfrigate*`, `supportfrigate`), the police
  freighter, the legacy freighter lists and `freighter_a`. Frigates belong to
  their own area.

## How it works

Everything is in `apps/desktop/src/main/model-workshop/`, one file per thing:

| File | Contents |
| --- | --- |
| `game-model-files.ts` | Opens the installation's model archives on demand and serves one file by game path. |
| `binary-table.ts` | Bounds-checked reading helpers shared by the three readers. |
| `part-list.ts` | Reader of a part list (`.descriptor.mbin`). |
| `scene-graph.ts` | Reader of a scene graph (`.scene.mbin`). |
| `geometry-streams.ts` | Reader of mesh positions and triangles (`.geometry.mbin.pc`, `.geometry.data.mbin.pc`). |
| `seed-part-selection.ts` | Which parts a seed selects (port of `runtime/research/evaluate-descriptor-seed.py`, empty caller context). |
| `scene-model.ts` | Builds a binary glTF model from a scene, keeping only the selected parts. |
| `model-workshop-service.ts` | The three requests of the interface: model of a seed, choices of a type, seed for chosen parts and paint. |
| `model-workshop.game.test.ts` | Checks against a real installation; runs only with `NMS_COURIER_GAME_ROOT` set. |

Binary layouts were read from the build 180836 files by comparison with their
MBINCompiler text in the research corpus, and each reader refuses a file whose
structure identifier is not the one it was written for:

| File type | Structure identifier (header bytes 8 to 24) |
| --- | --- |
| Part list | `e40c00004f2926401448d118940eff96` |
| Scene graph | `e40c0000477eb83dd8021f5963a896ad` |
| Geometry description | `e40c000020329c81a6f6de9aa96c1fda` |
| Geometry streams | `e40c0000545702401363b3a89568b4cc` |

The field offsets are in the comment at the top of each reader.

### Parts

A part list is a tree: groups of alternatives, each alternative with nested
groups and with the scenes it brings in, which have part lists of their own.
The seed picks one alternative per group. The interface offers every group in
which a seed can draw more than one alternative, nested under the alternative
it belongs to; a group with a single alternative is passed through. This is
the same tree the customizer site shows (for the fighter: thruster, wings,
dorsal fin under the wings, sub-wings under some wings, cockpit and nose under
the cockpit).

Parts are named by the game's identifiers (`_WINGS_` reads "Wings",
`_WINGS_A` reads "A"), because the game has no display text for them. The
community's nicknames (for example "Wings Vector") are not used.

### Seed for chosen parts

No way is known to compute a seed from its parts, so the application tries
random seeds and keeps the first whose choices match, at most six million
tries or twenty seconds. The paint colour is checked only for seeds whose
parts already match. A combination that is rare (many nested choices plus a
colour) may not be found in that time; the interface says so.

### Colours

Painted starships (fighter, hauler, explorer, shuttle, solar) take five paint
and five undercoat samples from the game's base palette file
(`metadata/simulation/solarsystem/colours/basecolourpalettes.mbin`, SHA-256
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`, the same
bytes in builds 180383 and 180836) with the model seed, by the existing
palette port. The first paint sample agreed with the hull colour of seven
public reference seeds
([model preview research](MODEL_PREVIEW_RESEARCH.md#primary-paint-color-against-seven-public-references-2026-10-07)).

On the model the colours are placed by material name only: `PRIMARY…` takes
the first paint sample, `SECONDARY…` the second, `TERTIARY…` the first
undercoat sample, metal and trim materials a dark grey. This is an
approximation; the game decides per pixel with layered textures and masks.

## Checks (2026-10-08)

With `NMS_COURIER_GAME_ROOT` pointing at the installed build 180836:

- Five seeds on four types select exactly the parts the research port selects
  (fighter `0x7` and `0xA547AB958C97E439`, hauler `0xD440D42921FFFF7A`,
  interceptor `0x7`, freighter `0x8C968767B3282F13`).
- All twenty types build a model that passes the workshop's own model check.
- A search for two nested fighter parts plus a paint colour finds a seed, and
  the model of that seed has those parts and that colour.
- The shortened palette schedule gives the same paint and undercoat as the
  full port for three seeds.

The rendered page was looked at in a test instance: a fighter with a chosen
orange was found after 227 tries and shown painted.

Reproduce:

```bash
cd apps/desktop && NMS_COURIER_GAME_ROOT="<game folder>" npx vitest run src/main/model-workshop
```

## Not done, and not proven

- Comparison with the running game: that a starship obtained with a seed looks
  like the workshop's model for that seed. The selection runs with an empty
  caller context; the game's callers may add forced or excluded parts.
- Textures, decals, texture layer choice (coating, painted, metal), second
  and decal colours as choices, glow and glass.
- Colours for the living ship, exotic, interceptor, multi-tools and freighters
  (their own palettes; freighters take colours from the star system).
- Pistol, rifle, experimental and alien multi-tools share one scene; what
  makes the game treat a seed as one or the other is not established.
- Class, slots, stats and the generated name of a seed.
- Glyph location search, which the customizer site offers.
