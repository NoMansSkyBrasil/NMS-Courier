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

## What the game's ship and multi-tool materials use (2026-10-09)

Counted over the 7,792 material files under `models/common/spacecraft` and
`models/common/weapons/multitool` of build 180836 (decoded corpus), to know
what the workshop still does not draw.

| Material feature | Materials | In the workshop |
| --- | --- | --- |
| Diffuse map (`_F01_DIFFUSEMAP`, `gDiffuseMap`) | 5,849 | Drawn, with the seed's texture layers and palette |
| Normal map (`_F03_NORMALMAP`) | 3,682 | Not used |
| Masks map (`_F25_MASKS_MAP`, `gMasksMap`): metal and roughness | 3,546 | Not used; unpainted metal looks grey (seen on a multi-tool) |
| Unlit (`_F07_UNLIT`): lights and glows | 2,227 | Shaded like any surface |
| Vertex data (`_F21_VERTEXCUSTOM`) | 1,564 | Not used |
| Colourisable (`_F53_COLOURISABLE`, `gColouriseMaskMap`) | 773 | Not used; the mask says where a colour goes |
| Several textures in one (`_F55_MULTITEXTURE`) | 630 | Not used; which picture of the set a part shows is not established |
| Occlusion map (`_F22_OCCLUSION_MAP`) | 510 | Not used |
| Parallax (`_F20_PARALLAX`) | 500 | Not used |
| Second diffuse map (`_F16_DIFFUSE2MAP`, `gDiffuse2Map`) | 57 | Drawn from application 1.16.1, tinted as a whole |

The order of work this gives: the masks map, the colourise mask and the
multi-texture sets, each checked on a seed seen in the game.

## How the game combines the layers of a texture (2026-10-09)

Read from the game's own shader, not inferred. The shaders of build 180836
are compiled SPIR-V in `NMSARC.Shaders` (25,859 files); the one that builds a
procedural diffuse texture is `shaders/code/bin/pc/texture_frag_combine_diffuse_0.spv`.
It was decompiled to GLSL with Khronos SPIRV-Cross, built from source into
`%LOCALAPPDATA%\NMSCourier\research-tools\spirv-cross`:

```bash
spirv-cross texture_frag_combine_diffuse_0.spv --version 450 --vulkan-semantics --output combine.glsl
```

The shader takes up to eight source textures and, per layer, a recolour
value (`gRecolourNVec4`, its fourth number is 1 when the layer is tinted), the
layer's average colour (`gAverageColourNVec4`), a multiply switch
(`gMultiplyLayer`) and which layer is the base alpha layer
(`gBaseAlphaLayer`). For each layer in use, source 1 first:

1. Hue, saturation and brightness of the texel, of the average and of the
   recolour are taken from the stored values (no conversion first).
2. Tinted colour: hue = `fract(texel hue - average hue + recolour hue)`;
   saturation = `min(texel, recolour)`; brightness =
   `texel + 10^(-10 * (texel - 0.5)^2) * 0.47662675 * (recolour - average)`.
3. Texel, recolour and tinted colour are turned to linear light (power 2.2;
   2.4 above 1).
4. Layer colour = `mix(texel, mix(tinted, texel * recolour, multiply), recolour.w)`.
5. Layer alpha = `clamp(alpha - 0.004, 0, 1) * 1.00401604`.
6. The base alpha layer replaces what is below and sets the picture's alpha;
   any other layer is mixed over the result by its alpha and leaves the
   picture's alpha.
7. At the end the picture is turned back (power 1 / 2.2).

`apps/desktop/src/renderer/src/lib/model-surface-painter.ts` does exactly
this from application 1.17.1. Its two remaining inputs were traced and are
the game's own from application 1.17.2:

- **The multiply switch** is a field of the texture alternative in the
  texture list: `Multiply`, one byte at `+0x54` of the 0x60-byte record. The
  routine at `636c40` copies it to the texture build job (`+0x1e0`). Seven of
  the game's 1,527 lists use it, among them the fighters' `primary` and
  `secondary` lists (alternatives `STEALTH`, `METALBOLT`, `SEVENTEEN`).
- **The average colour** is, in order: the alternative's own
  `AverageColour` (four floats at `+0x00`) when its `OverrideAverageColour`
  (`+0x55`) is set, which only building and grass lists do; otherwise the
  texture's average, which the job asks the texture for (parameters `0x2c5`
  to `0x2c7`, served at `1897490`). The texture loader (`1895ae0`) takes it
  from the file: **the four bytes at `0x38` of the DDS header are blue,
  green, red, alpha of the average**, written by the tool that made the
  file. All 2,155 starship and weapon textures of build 180836 carry it.
  Only when those bytes are zero does the loader compute one, and then not as
  a mean: for the older block formats it reads the single block at the end
  of the file as a BC1 colour block and keeps its first pixel (`1897540`).

Checked on the multi-tool `0x81E18111081140E1`: with the header averages the
wide bands of its second texture come out light orange beside the orange-red
stripes, as in the game; with a computed mean they came out one colour.

Also not established: which layer of a texture list the game passes as
source 1 (the workshop draws the last used layer first, which gives the
expected pictures), how the ubershader lays a second diffuse texture over the
first, and its use of the masks map. Those decide the remaining differences
seen on the multi-tool `0x81E18111081140E1` (top housing beige and front flap
black in the game, grey in the workshop; band colours).

## What the game's surface shader does with a material (2026-10-09)

The ubershader has 704 variants per pass, numbered by the material's flags as
bits (1 diffuse map, 2 skinned, 4 normal map, `0x8000` second diffuse map,
`0x1000000` masks map). All 704 of the deferred pass were decompiled and
indexed by the textures they read; the multi-tool's body is variant
`16777223` and its body with decals `16809991`
(`ubershader_frag_lit_defer_<n>.spv`).

Read from `16809991`:

- The second diffuse texture is sampled with the second pair of texture
  coordinates and laid over the first by its own alpha:
  `colour = mix(diffuse, diffuse2, diffuse2.a)`. The second masks map is mixed
  in the same way. This is what the workshop does since 1.16.1.
- **The masks map does not change the colour.** The colour written out is the
  diffuse colour. The masks go to the lighting pass: red times
  `gMaterialParamsVec4.x`, green as one or two surface terms depending on the
  material's dynamic flags, blue into a glow term, alpha times
  `gMaterialParamsVec4.y`. Which of them is metal and which roughness, and
  how the lighting pass uses them, is not read yet.

So the two differences left on the multi-tool `0x81E18111081140E1` are not a
missing texture step:

- **Front flap, black in the game, light grey in the workshop.** Its part of
  the body texture is bare light metal with a high green mask value. A
  surface the lighting pass treats as metal shows its surroundings instead of
  its own colour, which in the game's dark scene is black. The workshop
  lights every surface as painted. Needs the lighting pass.
- **Top housing, beige in the game, grey-blue in the workshop.** In the
  workshop it is the coating layer tinted with the Undercoat colour of the
  palette (first sample, `#b8bec7` for this tool). A beige there would be
  another Undercoat sample (the fourth is `#c8c4b9`) or another palette. Not
  established; a second multi-tool seen in the game would decide it.

Rejected by rendering: the two halves of the body texture being swapped (a
shift of half its width) gives large orange areas on top that the game does
not have.

## Legacy colours: the game's second palette generator (2026-10-09)

The owner's idea, confirmed in the executable, in a save and on two tools.
This replaces the "first child seed" rule of 1.16.1, which was wrong.

A multi-tool's saved data has `UseLegacyColours` (true for all three
procedural multi-tools of the owner's test save; false for the fixed reward
tools). The flag travels from the multi-tool (`+0x281`) through the palette
builder (`1149f50`) to the texture build job (`+0x1c9`), where `63a8ec`
chooses the generator:

| | Flag clear | Flag set (legacy colours) |
| --- | --- | --- |
| Routine | `62e2b0` | `630310` (per family `6305b0`) |
| Palette file | `basecolourpalettes.mbin` | `legacybasecolourpalettes.mbin` |
| Order | families 0 to 51, then redrawn and late families from child seeds | all 66 families in file order from one stream, then six redrawn from a child seed |
| Cell of a sample | by the family's mode (five cases) | second step's top three bits, plus eight times the first's unless the mode is 3 |
| A repeated colour | the next cell, no new draw | **drawn again with two more steps** while nearer than `DuplicateColourThreshold` (1.0, `gcenvironmentglobals`) to an earlier sample of the family; at most 64 draws |

The two files hold the same Paint and Undercoat tables; they differ in the
modes of earlier families. Because a redraw takes steps, every later family
moves on the stream, so the same seed gives other colours. A threshold of 1.0
keeps only colours far apart, which is why legacy palettes are contrasting.

The seed is the multi-tool's own `Seed` (`+0x248`); its resource seed
(`+0x218`) is used only when the first is not set (`5db8b6`).

Checked on the two tools bought in the game, standard type:

| Seed | Paint, first and fourth sample | Undercoat, first | In the game |
| --- | --- | --- | --- |
| `0x81E18111081140E1` | `#fbc85f`, `#ff9375` | `#cec8c1` | yellow grip, orange stripes, beige top housing |
| `0xB46E55097073F0AA` | `#ec5f4f`, `#fbc85f` | `#dad7d0` | red body with its cyan counterpart, white and yellow stripes |

`generateLegacyPalette` in
`apps/desktop/src/main/nms-adapters/base-palette-preview.ts` is the port; a
game-file test holds these colours. The beige top housing of the first tool,
open until now, is its Undercoat under this generator.

Not done: the same switch for starships (`ShipUsesLegacyColours` in the
save, per ship); the six families the legacy generator redraws from a child
seed (none is used by a starship or multi-tool layer).
