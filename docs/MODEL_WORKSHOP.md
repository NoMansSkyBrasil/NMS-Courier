# Model workshop

Status on 2026-10-08: **implemented in application 1.14.0, offline only.** The
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
| Build | Choose category, type, parts, any colour the model takes from the game's palettes and any texture layer in which a seed chooses (base texture, decals). The application looks for a seed that has them and shows the model. |
| View a seed | Choose category and type, type a seed or draw a random one, and see the model, its paint colours and the parts it drew. |
| Current system | With the game running: the seed of the star system the player is in and the ships the game generated for it, read by the bridge; each opens in "View a seed". |
| Model file | The earlier tools for a GLB file the user brings (part visibility, tints, palettes, appearance recipes). |

For a starship, "Get this one in the game" opens Starships, "Get a new one",
with the type and the seed filled in. A link can open the workshop directly:
`#models?tab=view&category=starship&kind=fighter&seed=0x5EEDC0DE70FAE007`
(`tab` is `build`, `view` or `file`).

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
| Multi-tool | Atlantid (the Atlas-styled one) | `weapons/multitool/atlasmultitool` |
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
| `texture-list.ts` | Readers of a material's diffuse texture (`.material.mbin`) and of a texture list (`.texture.mbin`). |
| `texture-selection.ts` | Which alternative of each texture layer a seed selects (port of `runtime/research/evaluate-texture-options.py`, merged mode). |
| `model-workshop-service.ts` | The requests of the interface: model of a seed with its painted surfaces, one texture, choices of a type, seed for chosen parts, colours and base texture. |
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
| Texture list | `e40c000031c3f04c087fe55d0cc74825` |
| Material | `e40c00008ad43747a9f1e538fccced2c` |

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

### Checked against a table of fighter seeds

The same site carries a table of 1,809 fighter seeds, each keyed by the
CRC-32 of the identifiers of the parts the seed draws, joined in drawing order
(decal parts included). Sixty-four of its pairs were compared on 2026-10-08
and are a test: all sixty-four seeds draw exactly the recorded parts.

Two things were learned on the way:

- The table was made with an older game version. Its three mecha wing
  alternatives are named `_WINGSJ_FULLLOD0`, `_WINGSJ_MIDLOD0` and
  `_WINGSJ_LOWLOD0`; build 180836 names them without the suffix. The test
  adds the suffix before taking the checksum.
- A group is skipped when one of its alternatives was already chosen
  elsewhere in the model, and that comparison is by the identifier as the
  part list spells it. The research port compared identifiers with the level
  suffix removed; that skipped a cockpit decal whenever a wing decal had the
  same name apart from its suffix (K wings with the E cockpit) and failed
  three of the sixty-four seeds. Never skipping failed two.

Only fighters have such a table on the site.

### Standard multi-tool: what decides pistol, rifle, experimental, alien

The standard multi-tool scene has one part list for all of them. Its first
group has two alternatives: a rare one (weight 1 against 20) under which a
second group chooses between the starter, the experimental (`Pristine`) and
the alien model, all rare; and the normal one, under which the gun mode
(two alternatives), barrel, stock, magazine, screen and side accessory are
drawn. Both groups can be chosen in Build. With a seed alone the experimental
and alien models are therefore rare. The game also has a stat class per
multi-tool (pistol, rifle, experimental, alien); whether it forces the
matching model when it builds one (the traversal has a way for a caller to
force an alternative) is not established, so a seed shown here as a normal
model may be given another model by the game for an experimental or alien
multi-tool.

### Seed for chosen parts

No way is known to compute a seed from its parts, so the application tries
random seeds and keeps the first whose choices match, at most six million
tries or twenty seconds. The paint colour is checked only for seeds whose
parts already match. A combination that is rare (many nested choices plus a
colour) may not be found in that time; the interface says so.

### Colours, textures and decals

A material names a diffuse texture; that texture's list holds up to eight
layers, each with alternatives (for the base layer of a fighter: coating,
painted, panels) and each alternative with the palette family and sample it is
tinted with. Decals are layers too (logo, number, letter, small sign).

For a seed the application:

1. walks the model and collects the texture lists in the order their
   materials are first met: a node's own mesh, then its children, then the
   scene a reference node refers to;
2. merges the layers of all lists by layer name and group and draws one
   alternative per merged layer with the model seed
   (`texture-selection.ts`);
3. draws the palette with the model seed (the existing palette port) and
   gives each chosen alternative its sample;
4. hands the interface, per material, the stack of textures and tints; the
   interface draws the stack on the graphics card (the textures are BC1 and
   BC7, decoded by the card) and puts the picture on the material
   (`renderer/src/lib/model-surface-painter.ts`).

The five colours of a painted starship, by role, are samples of the palette
file `metadata/simulation/solarsystem/colours/basecolourpalettes.mbin`
(SHA-256 `3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`,
the same bytes in builds 180383 and 180836):

| Role | Family | Sample of five |
| --- | --- | --- |
| Main colour | Paint | first |
| Second colour | Paint | fourth |
| Decal colour 1 | Paint | third |
| Decal colour 2 | Paint | second |
| Undercoat | Undercoat | first |

Not exact: the tint itself. A layer is recoloured in hue, saturation and
brightness toward its sample by the rule the research took from community
descriptions, not from the game's shaders. Mask, normal and glow maps are not
used; lighting is the workshop's own.

A freighter takes its colours from its home star system, so the workshop
asks for a second seed for freighters and draws the palette with it; the
texture choices still use the model seed. Without a home seed a freighter is
drawn untinted. For the pirate freighter of 2026-10-06 (model seed
`0x8C968767B3282F13`, home seed `0x175000B001FFD`) the colours equal the
ones the research recorded for that home seed (a test). Colours cannot be
chosen for a freighter in Build: they do not depend on its own seed. A link
carries the home seed as `home=`.

The home seed is the system's address in the universe
([where each seed comes from](SEED_ORIGINS.md#freighter-home-system-seed)), so
the workshop shows the portal address and galaxy a home seed stands for and
accepts a portal address with a galaxy number instead of the seed.

### Compared with an independent tool

The community customizer at `nms.center` shows, as its default result, what
its author's tooling computes for fighter seed `0x5EEDC0DE70FAE007`. Read on
2026-10-08 (the page only; no request to its server), compared with the
application's result for the same seed:

| What | Site | Application |
| --- | --- | --- |
| Parts | `_ENGINE_B`, `_WINGS_A`, `_ACC_A`, `_COCKPIT_A`, `_ANOSE_A`, `_NOSEA_BASELOD0`, `_LOGO1_A2`, `_NUMBER4_A4`, `_NUMBER3_A3`, `_LOGO2_A3`, `_NUMBER2_A3`, `_NUMBER1_A2` | the same twelve, in the same order |
| Main colour | Paint 18, 0.976 0.925 0.067 | the same |
| Second colour | Paint 1 (group Alternative3), 0.902 0.902 0.902 | the same |
| Undercoat | Undercoat 49, 0.435 0.447 0.435 | the same |
| Decal colour 1 | Paint 47 (Alternative2), 0.243 0.561 0.792 | the same |
| Decal colour 2 | Paint 2 (Alternative1), 1 0.875 0.710 | the same |
| Base layer | `PAINTED`, Paint, Alternative4 | the same |
| Paint layer | `PANELS`, Paint, Primary | the same |
| Letter decal | `A1` | the same |
| Number decal | `C9` | the same |
| Logo decal | `L` | the same |
| Small sign decal | `C` | the same |

The site numbers palette colours from 1; the application's are from 0. The
comparison is a test (`model-workshop.game.test.ts`). It is one seed of one
type.

## Checks (2026-10-08)

With `NMS_COURIER_GAME_ROOT` pointing at the installed build 180836:

- Sixty-four fighter seeds draw the parts an independent table records.
- Five seeds on four types select exactly the parts the research port selects
  (fighter `0x7` and `0xA547AB958C97E439`, hauler `0xD440D42921FFFF7A`,
  interceptor `0x7`, freighter `0x8C968767B3282F13`).
- All twenty types build a model that passes the workshop's own model check.
- A search for two nested fighter parts plus a paint colour finds a seed, and
  the model of that seed has those parts and that colour.
- The shortened palette schedule gives the same paint and undercoat as the
  full port for three seeds.
- Fighter seed `0x5EEDC0DE70FAE007` gives the parts, colours and texture
  choices of the table above, and its textures can be fetched while any
  other texture path is refused.

The rendered page was looked at in a test instance for all twenty types (seed
`0x1234567890ABCDEF`): each shows a recognisable, textured model. Over five
seeds per type no scene was missing, no geometry unreadable and no mesh
without triangles. A search for a chosen decal and one for a living ship's
body colour find a seed whose model has them.

Reproduce:

```bash
cd apps/desktop && NMS_COURIER_GAME_ROOT="<game folder>" npx vitest run src/main/model-workshop
```

## Not done, and not proven

- Comparison with the running game: that a starship obtained with a seed looks
  like the workshop's model for that seed. The selection runs with an empty
  caller context; the game's callers may add forced or excluded parts.
- The exact recolouring of a layer, masks, normal maps, glow and glass.
- A search for a home system seed with chosen freighter colours.
- Whether the game forces the experimental or alien model for a multi-tool
  of that stat class (see above).
- Class, slots, stats and the generated name of a seed.
- Glyph location search, which the customizer site offers.

## Compared with the running game (2026-10-09)

One multi-tool bought in a station, seed `0x81E18111081140E1`, standard type:
the parts are the same; from application 1.16.1 the colours are those of the
game (the palette of a multi-tool is drawn with the first child seed of its
seed) and the bands of its second diffuse texture are in place. Unpainted
metal is still shaded plainly. Details and what was rejected:
[where each seed comes from](SEED_ORIGINS.md#the-stations-multi-tool-bought-2026-10-09).
