# Changelog

Two things are versioned separately, both with `major.minor.patch`:

- **Application**: the desktop program. Version in `apps/desktop/package.json`
  (and the root `package.json`).
- **Bridge**: the DLL inside the game that performs the deliveries. Version in
  `runtime/native/asi/profile_180836/bridge_version.h`, written to the bridge's
  status file as `bridge_version`, and listed with the SHA-256 of the built
  file in `apps/desktop/src/main/research-bridge/bridge-version.ts`.

The application shows both on the "Game and bridge" page and says whether the
installed bridge is the one it was built with. Rules for raising a version are
in `AGENTS.md` ("Versions").

## Application 1.8.1 (2026-10-08)

Development only; nothing changes for a delivery.

- Fix: after a code change the running development window often went blank
  and had to be closed. Two causes: the main process and the preload were not
  rebuilt while the page was (the page then called a method that did not
  exist yet), and the locale module could not be refreshed in place because
  it exported a component together with other things. `pnpm dev` now watches
  the main process and the preload and restarts the application when they
  change; the provider component has a file of its own
  (`i18n/locale-provider.tsx`, everything else in `i18n/locale.ts`).
- A page that fails now shows the failure and a reload button instead of a
  blank window.

## Application 1.40.0 and bridge 1.30.0 (2026-10-10)

- Added (owner request): "Find a planet" can search **around you, in any
  galaxy**. Choose what the planet should be like and for how long to
  search; the game itself looks through the star systems around you,
  nearest first, a little every frame while you keep playing, and the
  planets appear as they are found. It stops when the time is up, when you
  press Stop or when you leave the system.
- Added: a planet found this way shows its grass colour, and the colour can
  be filtered (green, teal, blue, purple, pink, red, orange, yellow, pale).
- Bridge 1.30.0 (`fcc396a542bd77ec51fcf8f2be527bb82484db779eb5389d735a22d4485be0cb`): request `planets`. It calls the game's own system
  and planet generators and reads their answers; it writes nothing. See
  [the notes](docs/PLANET_FINDER_NOTES.md#the-search-around-the-player-bridge-1300-application-1400).
- Fixed: the ready-made list gave most variants the weather of their
  biome's plain variant (a swampy lush planet read as a plain lush one).
  2,424 of its 28,287 planets changed weather.
- Not tried in the running game yet.

## Application 1.39.0 (2026-10-10)

Every page was opened and read again; these are the faults found.

- Fixed: the "what it covers" card and the diagnostics card stayed visible
  with internal names switched off (a component's own display rule won over
  the hiding rule).
- Fixed: category badges showed the game's internal words in English
  (`shop`, `catalogue_technology`, `Suit`, `Legendary`, a bare `23`). They
  now read in the 14 languages, with the game's own words where it has one
  (exosuit, multi-tool, starship, freighter, exocraft, Minotaur, Nautilon,
  living ship, Sentinel interceptor); an expedition reads "Expedition 23";
  a list with a single category shows no badge.
- Added: the "Saves" page was empty. It now shows when the game last saved
  each slot and the safety copies made before changes, with a button that
  opens their folder. Read only.
- Changed: "Game and bridge" shows the same coloured notice as the other
  pages (with the install button when needed), coloured states, and says
  "Connection with the game"; the developer's diagnostics card is hidden
  unless internal names are on.
- Changed: waiting technologies name each exocraft as the game does
  (Roamer, Nomad, Colossus, Pilgrim, Dragonfly, Nautilon, Minotaur), from
  the game's exocraft list.
- Changed: areas not built yet are dimmed and marked "Planned" in the
  sidebar; a page with a single action says "Send to the game" instead of
  "Deliver everything".

## Application 1.38.2 (2026-10-10)

- Changed: shorter, plainer texts on the remaining long pages (corvettes,
  words, missions, glyphs, travel, the model workshop, the dashboard and
  the legacy colours option), in the 14 languages; the delivery cards no
  longer mention the "research bridge".
- Changed: the category badge of every list has a steady colour of its
  own.

## Application 1.38.1 (2026-10-10)

- Changed: the grey state line inside every card is gone; the coloured
  notice above the card already says what to do next.
- Changed: the "Experimental" badge now reads "In testing" (and its
  equivalent in each language).
- Changed: the texts of the Standings and Milestones pages are one or two
  plain sentences each.

## Application 1.38.0 (2026-10-10)

Owner requests after a review of the interface for lay users.

- Added: the application installs its own files into the game. When the
  bridge or the data file is missing or older, a notice with an "Install"
  (or "Update") button appears on the dashboard and on every delivery page
  and goes away once they are in place. It never installs while the game
  runs and never replaces a file of the same name that is not ours. The
  files travel with the application in `apps/desktop/resources/bridge`.
- Added: setting "Show internal names" (off by default). Identifiers, the
  raw answer of each request and the "what it covers" card are hidden unless
  it is on.
- Changed: the sidebar has more groups, each with its own colour: Items
  and currencies, Travel, Equipment, Knowledge, Progress, Appearance,
  Rewards. Status cards, the footer and the "verified / experimental"
  badges are coloured; the next thing to do (choose the folder, install,
  open the game) is one coloured notice instead of a grey line.
- Not done yet: shorter texts on the older pages (milestones, standings,
  missions, equipment). Listed in `TODO.md`.

## Application 1.37.0 and bridge 1.29.0 (2026-10-10)

- Added (owner request): page "Waiting technologies" under "Deliver". It
  looks through the exosuit, the multi-tool in hand, every ship, the
  freighter and every exocraft for technologies that still ask for
  components (the gear in the corner) and has the game finish one, the ones
  of an inventory, or all. The components are not spent. Damaged-slot and
  internal entries are never finished. In the 14 languages.
- Bridge 1.29.0 (`77f4876da12d74168150e32dfdbd84857dcf3aed9b218983959acfc77cfc46e3`): request `install`. Listing only reads; finishing
  calls the game's own install routine once for each technology (a native
  call, no direct write). See
  [the notes](docs/TECHNOLOGY_INSTALL_NOTES.md).
- Not tried in the running game yet; the page is marked experimental.

## Application 1.36.0 (2026-10-10)

- Fixed: the planet finder called infested planets something else (the
  owner's own planet read "jungle" while the game shows it infested). The
  research tool was missing the game's second list of biome files, which
  decides the infested planets; the list of 28,287 planets was made again
  and the owner's system now reads as the game shows it (see
  [finding planets](docs/PLANET_FINDER_NOTES.md#checked-against-the-running-game-2026-10-10)).
- Added (owner request): each planet now carries its system's economy and
  whether pirates control it, shown on the row; a "System" filter (any, no
  pirate systems, pirate systems only).
- Changed: variant names come from the biome file each biome and subtype
  pair loads (`runtime/research/biome-variants.md`), since the game reuses
  one subtype name for different things: flower fields, rocky, tentacles and
  bubbles are told apart, "jungle" is only the lush one, the same subtype
  in other biomes reads "Renewed (Worlds)".
- Changed (owner rule, now in `AGENTS.md`: the interface is for lay users):
  storms, sentinels, extreme weather and pirate systems are coloured badges
  with an icon and a word, each biome has a colour dot, the texts are
  shorter, and "matches in the same system" starts at "One is enough". The
  notice now says plainly that the list is of the Euclid galaxy only.
- Not done yet: grass colour, a search around the player in any galaxy,
  purple star systems (none is in the list). All in `TODO.md`.

## Application 1.35.0 (2026-10-10)

- Added (owner request): page "Planet finder" under "Deliver". It lists the
  28,287 planets of 6,000 star systems of Euclid that the research tool read
  from the game's own generators, with filters for biome, variant of the
  biome, storms, sentinels, extreme weather, the system's race and the
  number of matches in one system; two presets ("Earth-like", "Everything")
  and a search by portal address. Each result shows its portal address and
  can be travelled to (the existing travel request, to the planet), saved
  to the Travel page's destinations or copied.
- The page says that no planet of the list was compared with the game yet.
- Added: `runtime/research/planet-survey.md` (`find-planets.py survey`);
  the candidate table of the morning is replaced by it.
- Bridge unchanged (1.28.0).

## Application 1.34.0 and bridge 1.28.0 (2026-10-10)

- Changed (owner request): the quests of the "Missions" page are in the
  game's order under headings: main story, Atlas Path, secondary missions,
  guide and milestones, expeditions. Inside a section they follow the
  game's tables, the story table first.
- Changed: the parts of a quest are in the order the game starts them (a
  mission starts when the missions its starting conditions require are
  complete), and a part that waits for another quest says "Starts after:"
  with that quest's name. The number of stages is no longer shown; it was
  the number of script blocks of the mission and said nothing a player
  could use.
- Added: a part the game names by its own log line shows that name, with
  "Part n" dimmed beside it (20 of the 379 parts of multi-mission quests);
  the others stay "Part n".
- Added: the tooltip of a part says when the game shows no message for its
  completion (`MessageComplete` is `Never` for 942 of 1,876 missions).
- Bridge 1.28.0 (`4322b6bf1b6dadd6bb8ab88232bf1efdab742ff684416fef7a3e5b1834589d5f`): the mission request takes `silent=0|1` and passes it
  to the game's reward routine instead of always being silent. Data file
  unchanged.
- `missions.md` gains what each mission requires, what follows it, when the
  game starts it and whether it announces completion.

## Application 1.33.0 (2026-10-10)

- Changed (owner request): the "Missions" page is a list of quest blocks,
  not a flat list. A block is a quest as the game's log names it, with the
  game's title and subtitle in the interface language; its missions are
  inside as "Part 1", "Part 2"…, each with its number of stages and of
  rewards and a box, and the block's own box marks them all. A quest of one
  mission is a single line. Mission identifiers are no longer shown (they
  remain in a tooltip and in the search).
- Changed: the 849 missions the game gives no title are hidden unless
  "Show missions without a title in the game" is on; they were the rows
  that showed a bare identifier as their name.
- Added: `missions.md` lists, for each mission, the reward table entries its
  stages hand over and its subtitle in the 14 languages.
- Bridge unchanged (1.27.0). What is sent is unchanged.

## Application 1.32.0 and bridge 1.27.0 (2026-10-09)

- Added (owner request), experimental: page "Missions" under "Unlock". The
  game is asked to complete missions through its own reward: all 1,786 of
  the list, the missions of one quest (they share its title; search and
  select all shown) or a single mission. A warning on the page says what is
  not known: whether the game still hands over what skipped stages give and
  whether it starts the next mission.
- Bridge 1.27.0 (`39b0c754639cadd57f656d3396ad49377f4dc21da0af03528656528d9b136277`): request `mission` (`mission_complete.h`) on the new
  carrier `COURIER_MISSION`.
- Data file regenerated with the carrier (`5cab45c3a5e884d7ace436b5b54da31de95839f9329abf9632e8f6817f8e5493`); it must be installed with
  the bridge.
- Not exercised in the running game yet. For a test save.

## Application 1.31.1 (2026-10-09)

- Removed (owner decision): the switch "Also mark as claimed in this save"
  of the Expeditions page, added in 1.31.0. Expedition rewards are only
  unlocked on the account; the player claims each one in the game. The
  application never records a reward as claimed, for "send all" or for a
  selection. The rule is in `AGENTS.md`.
- Bridge unchanged (1.26.0).

## Application 1.31.0 and bridge 1.26.0 (2026-10-09)

- Added (owner request): page "Guide" under "Unlock": the 50 topics of the
  game's guide that are not open from the start, one, several or all, named
  with their category by the game's texts in the 14 languages.
- Added (owner request): page "Space Anomaly": access to the Space Anomaly
  (the Nexus) for the loaded slot.
- Changed (owner request): the "Expeditions" page has a switch "Also mark
  as claimed in this save", off by default. Off, a reward is only unlocked
  on the account and stays to be claimed in the game; on, it is also
  recorded as claimed in the loaded slot. Before, "send all" always did
  both and a selection never claimed; now both follow the switch.
- Bridge 1.26.0 (`73227b43dad8d96f63d5d3765598e135082b6a6bc606798a9d8bd40bcdf76458`): requests `wiki` (`wiki_topic.h`) and `nexus`
  (`nexus_access.h`), each through the game's own reward on a new carrier
  (`COURIER_WIKI`, `COURIER_NEXUS`).
- Data file regenerated with the two carriers (`239ce8efd10a0f0a68e5a199fab611ecafc48be38c2dc6bf3433c3054e0f1058`); it must be installed
  with the bridge.
- Guide and Space Anomaly are not exercised in the running game yet.

## Application 1.30.0 and bridge 1.25.0 (2026-10-09)

- Added (owner asked where they were): the two milestones the game keeps as
  fractions, "On-foot Exploration" (`DIST_WALKED`) and "Extreme Survival"
  (`LONGEST_LIFE_EX`), are offered; 43 milestones in all. The game's stat
  reward moves the 32 bits of such a value unchanged, so the application
  sends the bit pattern of each level's value.
- Changed: "On-foot Exploration" is listed under "Survival Milestones", as
  on the game's own page.
- Bridge 1.25.0 (`130fc869eef55f8cb6a3adfdcea9d304fee77b757699952d24b3b9becb34d8a8`): a level value of the stat request may be any 32-bit
  whole number (the limit was one thousand million). Not exercised live.

## Application 1.29.0 and bridge 1.24.0 (2026-10-09)

- Added (owner request): "Show the milestone screen for silent entries
  too", on by default, on "Standing" and "Milestones". The game shows its
  full "milestone reached" screen only for stats whose `StatMessageType` is
  `Full`; with the option the bridge sets a silent stat's entry of the
  game's loaded table to `Full` for the one call, gives it the title of the
  stat as message text when it has none, and puts both back right after.
- Bridge 1.24.0 (`7e0264c064071f603e59ed106dd6b1087189ae03c30713c81d725d6ca10068d7`): the stat request takes `announce=0|1` and an
  optional text identifier at the end of a `stat=` line; the result adds
  `after=` (the value read back) and `announced=`. Not exercised live yet.
- Added: each row of "Standing" and "Milestones" says how the game announces
  a new level of it (full message, short message, no message), from the
  game's own table (`StatMessageType`). 31 of the 41 milestones are silent
  in the game itself, which is why a level raised on one of them shows
  nothing (owner's report after the first live use).

## Application 1.28.1 (2026-10-09)

- Fix: every page said "The installed bridge is not a tested build" with
  bridge 1.23.0 installed, so nothing could be sent. Version 1.23.0 had its
  hash listed but was missing from the versions the application accepts. A
  test now requires the application's own bridge version to be in that list.
- Bridge unchanged (1.23.0).

## Application 1.28.0 and bridge 1.23.0 (2026-10-09)

- Added (owner request): pages "Standing" and "Milestones" under "Unlock".
  The standing with the Gek, Vy'keen, Korvax, Autophage, the three guilds
  and the outlaws (8 entries) and 41 journey milestones can be raised by one
  level, several levels or to the last level, for every entry or the chosen
  ones. Names are the game's own texts in the 14 languages.
- Bridge 1.23.0 (`a355d9a69b242d24ac9e721a03ed66feb590ed600ad84711ed562bdc0f61438b`): request `stat` (`stat_level.h`). Each stat is read
  with the game's own routine and the value of the level asked is set
  through the game's stat reward (`GcRewardModifyStat`) on the new carrier
  `COURIER_STAT`; nothing is lowered, nothing is written into a save.
- Data file regenerated with the carrier (`7633cf80ff7a9c51206b8912df807d64a79e9180f9fccb8f81efc503bbd7f57a`); it must be installed with
  the bridge.
- Not exercised in the running game yet. Two milestones whose levels are
  fractions (on-foot exploration, extreme survival) are not offered. Notes:
  `docs/STAT_LEVEL_NOTES.md`.

## Application 1.27.1 (2026-10-09)

- Changed (owner request): the Words page is a grid, one row for each of the
  game's 2,151 words with its text in the interface language (from the
  game's language files) and its identifier, and one column a language (Gek,
  Vy'keen, Korvax, Atlas, Autophage), with a box where that language has the
  word (4,829 boxes) and a box in each column header that marks the whole
  column. What is sent did not change: the marked word groups (3,830), one
  request a race; words of one group and race are marked together because
  the game learns them together. The boxes say what to send; which words the
  player already knows is not read from the game.
- Added: `runtime/research/word-names.md`, generated by
  `list-word-names.py`. The word identifiers match a save editor's export of
  all known words exactly (2,151, none missing either way). One table entry
  is left out: `MINING` with race `None` in group `BUI_MINE`, which no race
  that has words owns.
- Bridge unchanged (1.22.0).

## Application 1.27.0 and bridge 1.22.0 (2026-10-09)

Bridge 1.22.0, SHA-256 `160a95338d10f9307ec40dbf9ff83e7eb1cf2f249a0d0e3d24d0c2a79488e996`. Data file (reward table of the mod folder)
SHA-256 `4bbfa77c1df715e93fbf87bb5b22a4ffe1d2f7896285c0961aafe7a5f264a518`; the folder must be copied to the game again.

- Confirmed live with bridge 1.21.0: a teleport to a space station in the
  same galaxy.
- New, experimental: "Words". The words of the Gek, Vy'keen, Korvax, Atlas
  and Autophage languages, 3,830 word groups, one, several or all, through
  the game's own reward for chosen words, with the game's message for each
  word when notifications are on. Not exercised in the running game yet.
- New, experimental: "Portal glyphs". All sixteen at once or the next ones
  in the game's order, through the game's own reward. The game has no reward
  for a chosen glyph. Not exercised in the running game yet.
- Three new carriers in the data file: `COURIER_RUNE`, `COURIER_WORD` and
  `COURIER_WORDS`.
- The bridge also takes a number of words for the game to choose
  (`count=`); the application does not offer it yet.

## Application 1.26.0 and bridge 1.21.0 (2026-10-09)

Bridge 1.21.0, SHA-256 `9a9312fb8713e4adced72c53e00f84c559ccfcb44b0b61899b534c372e8a41de`.

- New, experimental: "Teleport". Travel to a star system by galaxy and portal
  address without a portal: choose one of the 256 galaxies by number and
  name, press the twelve glyphs (the game's own pictures) or paste the code,
  arrive at the system's space station or on the planet of the first glyph,
  and keep a list of saved destinations in the application. The bridge has
  the game fill its own pending teleport request (a native call of the
  game's teleport reward handler) and writes the destination into it (a
  direct write of the address fields). **Not exercised in the running game
  yet.** See `docs/TELEPORT_NOTES.md`.
- The galaxy names are the game's own: five from its language files, the
  other 251 made by its name routine, run under emulation, in the format of
  each of the 14 languages (`runtime/research/galaxy-names.md`).

## Application 1.25.2 (2026-10-09)

- Changed (owner request): the game catalogue lists every entry. Its results
  are in a card of fixed height that scrolls and draws more entries as it is
  scrolled, instead of stopping at fifty.
- Bridge unchanged (1.20.0).

## Application 1.25.1 (2026-10-09)

- Changed (owner request): the selection lists have no limit any more. The
  list is a card of fixed height that scrolls, and more rows are drawn as it
  is scrolled, down to the last entry of the area. The line under it says
  how many entries match the search out of the area's total.
- Bridge unchanged (1.20.0).

## Application 1.25.0 and bridge 1.20.0 (2026-10-09)

Bridge 1.20.0, SHA-256 `1730dc597a5737657a828407740c7eacb6914274271afc59c75e0d1c8f6fb15b`.

- New: every delivery page that only had "Deliver all" now also lets one or
  several entries be chosen: refining and cooking (1,684 recipes, each named
  by what it makes), fishing (220 fish), Twitch drops and platform rewards
  (each named by the product it gives). A chosen Twitch or platform reward
  is added to the list the bridge puts back in every session; the list is
  never replaced by the selection. Not exercised in the running game yet.
- New in the bridge: the fishing request reads a request file with `all=1`
  or one `id=<fish>` per line; without a file it records every fish as
  before. The result gains `not_named=`.
- Fixed: build parts and modular customisation parts were listed by their
  identifiers. They are products in two tables of their own, which the
  catalogue now reads as well (build 180836: 1,820 and 427 entries). **The
  catalogue has to be imported again** for the names and icons to appear.

## Application 1.24.1 (2026-10-09)

- Fixed: expedition rewards and quicksilver items were listed by their
  identifiers. Both are entries of the game's product table, so they now
  take the game's own names and icons from the catalogue, in the interface
  language (283 of 293 expedition rewards and 464 of 466 quicksilver items
  have a name in the game's files; the rest keep the identifier). Titles are
  not products and still show their identifiers.
- Changed: the selection lists show up to 600 entries at once instead of
  100, so a whole area (263 appearance entries, 293 expedition rewards) is
  visible without searching.
- Confirmed live with bridge 1.19.0: a new starship offered with 120 cargo
  and 120 supercharged technology slots.
- Bridge unchanged (1.19.0).

## Application 1.24.0 and bridge 1.19.0 (2026-10-09)

Bridge 1.19.0, SHA-256 `238495a51ad06190d492bc47d5ff9913837b62df9593d0ef8c436cc7805cd4d2`.

- New: "All inventory slots", "Supercharged slots" and "Extra technology
  rows" when getting a new starship, by the method that gave a new
  multi-tool its 120 slots: the hooked setup of the offered ship asks the
  cargo grid at 120 and the technology grid at 60, or 120 with the extra
  rows (the technology height bound of the ship's size type is raised from 6
  to 12 for that one layout call, as for freighters), and marks every
  technology slot supercharged. Where the game's bounds stop short the full
  grid is written directly. The result file gains `offer_cargo=`,
  `offer_technology=` and `ship_setups=`. Not exercised in the running game
  yet.

## Application 1.23.2 (2026-10-09)

- Changed (owner decision): "Use legacy colours" is off by default, in the
  model workshop and when getting a new multi-tool. It comes on in "Get a
  new one" only when the workshop hands over a tool it was showing with the
  legacy colours.
- Confirmed live with bridge 1.18.0: a new multi-tool offered with 10 x 12
  technology slots, all supercharged.
- Bridge unchanged (1.18.0).

## Application 1.23.1 and bridge 1.18.0 (2026-10-09)

Bridge 1.18.0, SHA-256 `d7effc8e037eb2b73bf584f936719344a16f85807e6d39c253d3bb750fa1a41e`.

- Fixed (not yet confirmed): "Extra technology rows" of a new multi-tool did
  nothing with bridge 1.17.0; the offered grid stayed 10 x 6. The rows are
  now asked the way a freighter's are: for the one layout call of the
  offered tool, the height bound of its size type in the game's inventory
  table is raised from 6 to 12 and put back. The direct write stays as a
  fallback and no longer depends on a check that refused the offered item.
  The result file gains `offer_grid=` and `offer_size_type=`.

## Application 1.23.0 and bridge 1.17.0 (2026-10-09)

Bridge 1.17.0, SHA-256 `163f59b7254d13c95167c82f8b5d0c081b0a7763d206b92b6064d1ea50694eed`.

- Confirmed live with bridge 1.16.0: the offer of a new multi-tool shows all
  technology slots, supercharged. The game's own layout stops at 10 x 6 (60).
- New: "Extra technology rows" for a new multi-tool: twelve rows, 120 slots.
  The game's layout does not go that far for a multi-tool, so the full grid
  is written on the offered item after the game set it up (a direct write,
  as "Upgrade" does on an owned tool). Not exercised in the running game yet.

## Application 1.22.1 and bridge 1.16.0 (2026-10-09)

Bridge 1.16.0, SHA-256 `d801c260b062cfed9da6f2ad2925af1dc7a6931ed31865801319efe8cd5ea1c2`.

- Fixed: "All technology slots" and "Supercharged slots" of a new multi-tool
  did nothing. They were applied after acceptance to a tool the bridge then
  never found. They are now set while the game builds the offered tool, with
  the hook already used for freighter offers, so the offer screen itself
  shows them. The result file gains `offer_setups=`. Not exercised in the
  running game yet.

## Application 1.22.0 and bridge 1.15.0 (2026-10-09)

Bridge 1.15.0, SHA-256 `3ab0e7f06195dccb0e18218d65c2cc2de399a5de45dbd7d2375a0d2720757090`. Data file (reward table of the mod folder)
SHA-256 `0cc8535141edc4ff9c96045f9a190ffc2b17a51b2affd6c8fe9211c31d677752`; the folder must be copied to the game again.

- Confirmed live with bridge 1.14.0: the offer of a new multi-tool is drawn
  with the legacy colours. Failed in the same test: the slots and
  supercharged slots were not applied after accepting; cause open.
- New: every multi-tool scene of the game in the model workshop: six more
  (Pillar of Titan, Basilisk Crown, NPC staff, Infinite Neon Mark XXII,
  Starbound v0.27, Direwasp Disintegrator), with the game's own names in the
  14 languages.
- New: eleven more kinds under "Get a new one" for multi-tools, one per
  scene: royal, sentinel, sentinel B, Atlantid, Atlas Sceptre, the three
  staffs above and the three expedition tools. Each has its own carrier in
  the data file. None was sent to the game yet; for royal, sentinel and
  Atlantid the stat class is one no reward of the game uses.
- "Get this one in the game" in the workshop now works for every multi-tool
  kind.
- Checked: freighters have no legacy colours setting in the save; starships
  have one per ship. Nothing was added for either yet.

## Application 1.21.0 and bridge 1.14.0 (2026-10-09)

Bridge 1.14.0, SHA-256 `8a7a1e018f44009cee1061aeac6649a3bb46a3939383e62783d3bb9577515444`.

- New: "All technology slots" and "Supercharged slots" when getting a new
  multi-tool, each on its own switch. The bridge waits until the offered
  tool is accepted, then about two seconds, and changes its technology grid
  in place (direct writes, the same as "Upgrade"). The file
  `native-weapon-legacy-...` gains `upgrade=0|1|3`. Not exercised in the
  running game yet.
- Not yet for a new starship: where the running game keeps an accepted
  ship's seed is not known, so the bridge cannot tell which ship to change.

## Application 1.20.3 and bridge 1.13.0 (2026-10-09)

Bridge 1.13.0, SHA-256 `cfbc42f859566959b67d029eeb56959c7976b1f910436712642045b0fdee9ab2`.

- Fixed: the offer still came with the standard colours. The two
  instructions changed since 1.10.0 are on a branch the reward does not
  take; the reward loads the offered model through the game's scene loader,
  whose legacy colours argument is written at a third place (`0x8e5c7e`).
  That place is now changed too. Not exercised in the running game yet.
- Fixed: after switching back to the game, an offer that opened before the
  first click had no cursor. The offer now also waits until the game holds
  the mouse (the system's arrow is hidden), not only until its window is in
  front.

## Application 1.20.2 and bridge 1.12.0 (2026-10-09)

Bridge 1.12.0, SHA-256 `50e0f9e487f5c730ebd59650dd1bf382f2fa0a9a6aa89c245c2793727ba5eca0`.

- Confirmed live with bridge 1.11.0: an offer opened once the game's window
  is in front has its cursor again.
- Fixed: the offer still showed the standard colours with "Use legacy
  colours" on. The game builds the offered model again after the reward
  call, when the two instructions were already put back. The change of the
  game's code now stays until the offered tool is accepted (the mark is
  written on it) or about ten minutes pass; during that time any multi-tool
  the game offers through the same routine is built with the legacy colours.
  Not exercised in the running game yet.

## Application 1.20.1 and bridge 1.11.0 (2026-10-09)

Bridge 1.11.0, SHA-256 `083774d1898fbe3a4ffff969a9e8dc7e5183d2f6e65566545d8db8e17aa460da`.

- Changed, as a test of the missing cursor: a starship or multi-tool offer is
  opened only after the game's window has been in front for 45 frames, one
  offer at a time. Until now the offer opened while the application's window
  was in front. The application waits up to 90 seconds for the result.
  Whether this gives the offer its cursor is not proven.

## Application 1.20.0 and bridge 1.10.0 (2026-10-09)

Bridge 1.10.0, SHA-256 `d0a7e555320fe90621b355d779d151d1a5cb5b7dacb517f2b5f82e86d18d1bee`.

- New: with "Use legacy colours" on, the game's offer screen of a new
  multi-tool is drawn with the legacy colours too. The game passes a constant
  "no legacy colours" when it builds the offered model, so the bridge
  **replaces two instructions of the game's code for the length of the reward
  call** and puts them back (not a native call). The result file gains
  `offer_colours=legacy|standard`. Not exercised in the running game yet.
- Known problem, not fixed: an offer opened while walking around has no
  cursor (the mouse turns the camera), so it cannot be confirmed. The offer
  page is an interaction page; opened outside an interaction or a menu the
  game does not give it the cursor. See the obtain notes.
- Not yet: all slots, supercharged slots and extra technology rows when
  getting a new starship or multi-tool (they exist for owned ones under
  "Upgrade"); legacy colours for starships.

## Application 1.19.2 (2026-10-09)

- Fixed: the lists of second textures (decals) are drawn apart from the lists
  of first textures, each set with the seed from its start. Drawn together
  (1.19.1) the pristine multi-tool `0xA1FA0E890FC18255` got decal pattern 4
  and no icons; apart it gets pattern 3 with its icons, which is what the
  owner's picture of the tool shows.
- Fixed: the "Use legacy colours" choice of a new multi-tool never reached
  the bridge. The main process dropped the field between the interface and
  the request, so the request had no `legacy=1` line (seen in the first live
  offer: result `legacy=not_asked`).
- Bridge unchanged (1.9.0).

## Application 1.19.1 (2026-10-09)

- Fixed: the list of a material's second texture (its decals) now takes part
  in the seed's texture choices, and the alternative the seed chooses is the
  one drawn. Before, a second texture with more than one alternative was
  drawn as its plain file or not at all (seen on a pristine multi-tool,
  `0xA1FA0E890FC18255`, which had no decals).
- Not settled: for that seed the workshop now draws a decal, but not the one
  of a screenshot from a 2019 version of the game. Whether the current game
  agrees with the workshop or with the old picture is to be checked in the
  game.
- Bridge unchanged (1.9.0).

## Application 1.19.0 and bridge 1.9.0 (2026-10-09)

Bridge 1.9.0, SHA-256 `bb10946339433539a290eee8518cf6f458e3a737346161d7bd557f05857b3794`.

- New: getting a multi-tool can mark it to use the legacy colours. The game's
  reward has no such setting, so the bridge **writes** the mark on the owned
  multi-tool record once the offered tool is accepted (a direct write of one
  byte, not a native call), and says in a file whether it did. The game's
  offer screen still shows the other colours. Not exercised in the running
  game yet.
- New: "Get this one in the game" in the model workshop also for multi-tools
  (the standard scene and the staff); it carries the seed and the legacy
  colours choice to the multi-tool page, where the option is a switch, on by
  default.
- Not for starships yet: where the running game keeps a ship's legacy mark is
  not found.

## Application 1.18.0 (2026-10-09)

- New: a "Use legacy colours" choice in the model workshop, for starships and
  multi-tools, in both "Build" and "View a seed". It starts ticked for
  multi-tools, as the ones the game hands out are marked, and clear for
  starships. A link can carry it (`legacy=1` or `legacy=0`).
- Bridge unchanged (1.8.0).

## Application 1.17.3 (2026-10-09)

- Fixed: multi-tool colours. Multi-tools are marked to use the game's legacy
  colours, which the game draws with a second palette generator from its
  legacy palette file; the workshop now does the same, with the tool's own
  seed. The rule of 1.16.1 (first child seed) was wrong: it fitted one tool
  by chance and failed on the second. Both tools bought in the game now come
  out in the game's colours (yellow grip and beige coat; red and cyan body
  with white and yellow stripes).
- Bridge unchanged (1.8.0).

## Application 1.17.2 (2026-10-09)

- Fixed: the two inputs of the game's layer shader that were still guessed
  are now the game's own. A layer's average colour is read from the header of
  its texture file, where the game takes it; the multiply switch and a stored
  average are read from the texture list. On the multi-tool compared with the
  game the bands of the second texture now have the game's two tones.
- Bridge unchanged (1.8.0).

## Application 1.17.1 (2026-10-09)

- Fixed: the model workshop tints and stacks texture layers with the game's
  own arithmetic, read from the game's shader that combines the layers of a
  procedural texture, instead of an approximation: the brightness step uses
  the game's weight, layers are mixed in linear light, and a later layer
  leaves the picture's alpha as it is.
- Known differences that remain: unpainted metal, the colours of the bands of
  a multi-tool's second texture, and two inputs of the shader the game
  computes elsewhere (a layer's average colour and its multiply switch).
- Bridge unchanged (1.8.0).

## Application 1.17.0 (2026-10-09)

Two things taken from the study of NMS Shipwright (MIT licence), ported and
tested against the systems read from the running game.

- New: "View a seed" says which star system the game draws a ship or
  freighter seed in (portal address and galaxy), when the seed has one.
- New: the "Current system" tab names the model of every ship of the system
  (freighter, capital freighter, small, tiny, pirate dreadnought, each kind of
  frigate, sentinel and swarm ships) from the game's own table, and "View"
  opens a freighter as the right type instead of always the regular one.
- Bridge unchanged (1.8.0).

## Application 1.16.1 (2026-10-09)

Fixes to the model workshop found by comparing a multi-tool bought in the
game (seed `0x81E18111081140E1`) with the workshop's model.

- Fixed: a multi-tool's colours are drawn with the first child seed of its
  seed, not with the seed itself (grip and stripes now have the game's
  colours for that tool). The seed search uses the same rule.
- Fixed: a texture layer whose chance was not met is no longer drawn (the
  rust layer appeared on every multi-tool).
- New: a material's second diffuse texture is drawn over the first with the
  model's second texture coordinates (the bands and stripes on a multi-tool's
  body).
- Known difference: metal surfaces without paint (the top housing, the front
  flap) are shaded plainly, so they look grey where the game shows beige or
  black.
- Bridge unchanged (1.8.0).

## Application 1.16.0 (2026-10-09)

- First live reading of a star system worked (bridge 1.8.0): system seed
  `0x0001DB00F769C14E` and fifty ships.
- New: the "Current system" tab says whether the ship seeds lie on the number
  stream of the system seed and after how many steps the first is drawn (302
  for that system). The check is a test with the live reading.
- Changed: the Atlas multi-tool type is named Atlantid, as players know it.
- Bridge unchanged (1.8.0).

## Application 1.15.0 and bridge 1.8.0 (2026-10-08)

- New: "Current system" tab in the model workshop. The bridge reads, without
  changing anything, the seed of the star system the player is in and the
  ships the game generated for it; the application lists them and each opens
  in the workshop. Bridge 1.8.0, file SHA-256
  `b4950c6eb5ca14b38d5f49f3605c83d301908561b2f60529c1fb2a4f317041f8`; new file
  `native-star-system-180836-<PID>.txt`, no request needed.
- Not exercised live yet.

## Application 1.14.0 (2026-10-08)

- New: the workshop explains a freighter's home system seed and converts it.
  The seed of a system is its address in the universe, so under the home
  seed the workshop shows the portal address and galaxy it stands for, and a
  portal address with a galaxy number can be typed to fill the seed.
- Research: where the home seed comes from was traced in the executable
  (`docs/SEED_ORIGINS.md`); new tool `runtime/research/read-class-members.py`
  reads the field table of any data class of the executable.
- Bridge unchanged (1.7.0).

## Application 1.13.0 (2026-10-08)

- New: freighters in the model workshop take a second seed, the seed of
  their home star system, and are shown in its colours. The pirate freighter
  the owner supplied (model seed `0x8C968767B3282F13`, home seed
  `0x175000B001FFD`) shows the near-black and grey the research recorded for
  that home seed. Without a home seed a freighter is shown untinted as before.
- Bridge unchanged (1.7.0).

## Application 1.12.1 (2026-10-08)

- Fixed: which parts a seed selects. A group is skipped when one of its
  alternatives was already chosen elsewhere in the model; the comparison is
  now by the identifier as the part list spells it. The rule taken over from
  the research compared identifiers with their level suffix removed, which
  dropped a decal on some combinations (for example a fighter with K wings
  and the E cockpit). With the fix, 64 of 64 fighter seeds of an independent
  table draw exactly the recorded parts; before it, 61. The research tool
  `runtime/research/evaluate-descriptor-seed.py` has the same fix.
- Bridge unchanged (1.7.0).

## Application 1.12.0 (2026-10-08)

- New: in "Build", every colour and every texture layer of the model can be
  chosen, for every type: the colours a model takes from the game's palettes
  (for a painted starship the five named ones; for a living ship its body,
  underbelly and cockpit colours; and so on) and each layer in which a seed
  chooses (base texture, logo, number, letter and small sign decals, and the
  layers of the other types).
- New: a link can open the workshop on a tab, type and seed
  (`#models?tab=view&category=starship&kind=fighter&seed=0x…`).
- All twenty types were rendered and looked at; engine exhaust and effect
  scenes are no longer drawn as solid shapes.
- Bridge unchanged (1.7.0).

## Application 1.11.0 (2026-10-08)

- New: workshop models are painted with the game's own textures. The seed's
  choice of texture layers and decals is evaluated, each layer is tinted with
  its palette colour and the layers are drawn over one another.
- New: the workshop shows a seed's five colours by role (main, second,
  undercoat, two decal colours) and its texture and decal choices; "Build"
  lets all five colours and the base texture be chosen.
- Checked against an independent tool: for fighter seed
  `0x5EEDC0DE70FAE007` the parts, the five colours and the six texture and
  decal choices are the same as the community customizer at `nms.center`
  shows. See `docs/MODEL_WORKSHOP.md`.
- Fixed: the second colour was taken from the wrong palette sample.
- Changed: engine exhaust and other effect scenes are left out of a model.
- Bridge unchanged (1.7.0).

## Application 1.10.0 (2026-10-08)

- New: the model workshop no longer needs a model file. It reads the game's
  own files and has two screens: "Build" (choose type, parts and main paint
  colour; the application finds a seed that has them) and "View a seed" (type
  or draw a seed and see it). Twenty types: eight starships, seven
  multi-tools, five freighters. See `docs/MODEL_WORKSHOP.md`.
- New: "Get this one in the game" hands a starship type and seed to
  Starships, "Get a new one".
- The earlier model file tools are on a third tab.
- Shapes follow the seed; colours are approximate and for painted starships
  only; textures and decals are not drawn. Not compared with the running game.
- Bridge unchanged (1.7.0).

## Application 1.9.0 and bridge 1.7.0 (2026-10-08)

- New: three more starship kinds under "Get a new one": exotic, living ship
  and interceptor. With the five existing ones these are the eight starship
  types a player flies besides the corvette, which has its own area. Bridge
  1.7.0, file SHA-256
  `7b8a83be1228e415acce726c11f7424526c961af3aee9c0182f63073505e0509`; data
  table SHA-256
  `2f55b1393ac55058ec4bc86d261460649b9106ecda62d9997f252fef224a37d6` (18
  entries; the first 15 are unchanged).
- Changed: the names of the starship kinds are now the game's own in each of
  the 14 languages, read from its text tables, instead of our translations.
- Changed: the kind is chosen in a searchable list when there are more than
  five (starships); multi-tools keep the plain list.
- Not exercised live yet.

## Application 1.8.0 and bridge 1.6.0 (2026-10-08)

- New: "Get a new one" for starships (fighter, hauler, explorer, shuttle,
  solar) and multi-tools (pistol, rifle, experimental, alien, staff) with a
  seed and a class. The game shows its own offer screen. Bridge 1.6.0, file
  SHA-256 `4bc6f7ca46d67538b5b5d4e32449dcedb018f01e7e9c39466bb4289614733935`,
  requests `ship` and `weapon`. See `docs/SHIP_AND_MULTITOOL_OBTAIN_NOTES.md`.
- The data file has ten more entries, one carrier per kind, and is generated
  by `runtime/research/build-courier-reward-table.py`. Table SHA-256
  `8c9de2ccf4a4cd84a951fcc944482a07d37f4c42d1f51f3eb547e11819a5b61c`.
- Not exercised live yet.

## Application 1.7.0 and bridge 1.5.0 (2026-10-08)

Owner request: a clear name for what the project puts into the game's mod
folder.

- One folder, `GAMEDATA/MODS/NMSCourier`, holds everything: the reward entries
  and the corvette layout the application prepares. It replaces
  `NMSCourierCurrencyRewards` and `NMSCourierCorvette`.
- The reward table has only the five entries that are used, named
  `COURIER_UNITS`, `COURIER_NANITES`, `COURIER_QS`, `COURIER_SUBST` and
  `COURIER_PRODUCT`, each of amount 1. The nine unused fixed-amount entries
  are gone. Table SHA-256
  `38ead98efee7cf0506d2b6f486ab7c612c1ad827aaf4ec45cc64d602e5c839a2`;
  source `runtime/mods/courier_rewards`.
- Bridge 1.5.0, file SHA-256
  `eb3c8b3785bfd87d88869fc70302a7fdb499592a795cc9ba04f03cd0b0c84cec`, uses
  those names. Nothing else changed in it. Not exercised live yet, like 1.4.0.

## Application 1.6.1 (2026-10-08)

- Fix: preparing a corvette file failed when the game and the application's
  data are on different drives, because the old research folder was moved
  with a rename. It is now copied and then removed. A failure names the
  system's error code.

## Application 1.6.0 (2026-10-08)

- Corvette from a file: the Corvettes page takes a `.nmsship` export, shows
  what it holds and writes the layout the game's corvette build mode starts
  from, plus the validation switch, into `GAMEDATA/MODS/NMSCourierCorvette`.
  After a game restart, "Start corvette build" opens build mode with that
  corvette assembled. No external tool is used. Not exercised live from the
  application yet; the same files made by hand delivered a corvette on
  2026-10-07.
- Starships, Multi-tools and Freighters have two pages each in the sidebar,
  "Get a new one" and "Upgrade", as in the standard collapsible sidebar.
  Getting a new starship or multi-tool is not available yet and the page says
  so.
- The freighter model is chosen from a searchable list of the five models a
  player can own instead of a typed game path.

## Application 1.5.0 and bridge 1.4.0 (2026-10-08)

Bridge 1.4.0, file SHA-256
`520fd043a67c0bb42ae456f912a95c84564c292b31b84cc48a8b180adf035300`:

- Fix: currencies were refused with `bad_layout`. The reward table entry
  starts 16 bytes earlier than assumed; it is now read where the game's own
  reward routine reads it.
- Items are given through the game's reward routine when a notification is
  wanted, so the game shows its "received" message; the silent route through
  the store routine remains for silent delivery and as a fallback.

Data file `runtime/mods/currency_rewards`: two more entries, `CR_ITEM_SUB`
and `CR_ITEM_PROD`, the carriers for items. Table SHA-256
`654e4f6ee459c992833cc4350148a66f737bc6943de94fb666fb93aae5a87b17`. It must
be copied to the game's mod folder again and needs a game restart.

Application 1.5.0: sends items with or without notification according to the
setting; accepts only bridge 1.4.0. Brought in from earlier verified requests:
expedition, Twitch and platform rewards are redeemed in the loaded slot as
well as unlocked on the account; exosuit, starship, multi-tool and freighter
pages can ask for the game's slot reward; the freighter offer takes a model
and seeds.

## Application 1.4.0 and bridge 1.3.0 (2026-10-08)

Bridge 1.3.0, file SHA-256
`dc735e762740b7c32c79ce9d5b86112dbe046ff40ce90ed83e235effaa5002f0`:

- Takes requests from a file (`native-signal-180836-<PID>.txt` names the
  request; the bridge deletes it when it takes it), so no helper program is
  needed to reach it. The named events remain for the test fixture.
- Listens for as long as the game runs; it used to stop thirty minutes after
  the last request.

Application 1.4.0:

- Fix: nothing could be sent. Every request was a PowerShell script started by
  the application, and in the application's environment PowerShell could not
  load its own commands (`Get-FileHash`). The application now writes the
  request and reads the answer itself; no script is involved, and the same
  code works on every platform.
- The running game is recognised from the status the bridge rewrites every two
  seconds instead of an operating system query.
- Only bridge 1.3.0 can be used; an older installed bridge is named and
  reported as out of date.
- The `signal-*.ps1` scripts are removed.

## Application 1.3.0 (2026-10-08)

- Game icons beside the names in the catalogue, the item lists and the entry
  lists of the delivery pages, read from the user's own installation.
- New start page: a hero with the application and bridge versions, the state
  of the bridge, shortcuts and the areas as cards by group.

## Application 1.2.0 and bridge 1.2.0 (2026-10-08)

Bridge 1.2.0, file SHA-256
`e28e6279c17da7d65d7bd96a14eec0bf266998818a7941ff001fd3fc567bff0c`:

- Currencies of any amount from 1 to 4,294,967,295 (request `currency`); the
  fixed-amount rewards of 1.1.0 can no longer be requested. See
  `docs/CURRENCY_DELIVERY_NOTES.md`.
- Reports the stack sizes of the exosuit cargo for the loaded save
  (`native-item-limits-180836-<PID>.txt`) and, in an item result, the stack
  the game gave each item.
- Not exercised live yet.

Application 1.2.0:

- Currencies page takes a free amount.
- Items page shows the stack of each item: the game's base stack for the save
  times the item's own multiplier, at most the game's cap. The catalogue must
  be read from the game again once to learn the multipliers.
- Fix: the game process query no longer fails when the game is closed (the
  dashboard showed "Unknown").

## Application 1.1.1 (2026-10-08)

- Fix: the application never saw the running game. Windows PowerShell writes
  a process start time as `/Date(n)/`, which the application rejected, so
  every page said "start the game" and nothing could be sent. The query now
  asks for ISO text and the reader accepts both forms.
- Fix: the dashboard and the sidebar showed "not supported" for build 180836
  and took the bridge state from the old diagnostic runtime; both now use the
  research bridge.

## Application 1.1.0 and bridge 1.1.0 (2026-10-08)

Meaning of the numbers (owner, 2026-10-08): `x.x.1` bug fixes, `x.1.x` an
update that is not very large, `2.x.x` a large new feature.

Bridge 1.1.0, file SHA-256
`0a51fbd01bbafb5f4fe921ab5dcdc8f47e5423a9589384aaa4d45e600607a03d`: the
twelve currency rewards of `runtime/mods/currency_rewards` may be requested
(`signal-currency-180836.ps1`). Needs that data file in the game's mod
folder. Not exercised live yet.

Application 1.1.0: working pages for Currencies, Exosuit, Starships,
Multi-tools, Freighters and Corvettes, sending the options the bridge
already had as scripts. None of these pages has been used against the
running game yet.

## Application 1.0.0 and bridge 1.0.0 (2026-10-08)

First versioned state. Everything below is for game build 180836 and the local
player; "verified" means it worked in the running game.

Bridge 1.0.0, file SHA-256
`70bbe51466c5bf31441f0af07d8740c5f1a479ea835eb4e866f387f2b30aba79`:

- Requests verified live with earlier, unversioned builds of the same source:
  technologies, product recipes and build parts, refiner and cooking recipes,
  fishing record, appearance options, titles, expedition and Quicksilver
  unlocks, Twitch and platform rewards with the keep list, owned inventory
  grids and classes, freighter and corvette options.
- New and not yet exercised live: the item request (substances and products
  into the exosuit cargo) and the notification option of product recipes.
- The 1.0.0 file itself has not been started in the game yet.

Application 1.0.0:

- Areas organised by domain in 14 languages; delivery of a whole area or of
  chosen entries; Items page; game notifications on by default with a setting
  for silent delivery.
- Reads the core catalogue from the user's own installation; detects the
  installation by itself.
- Shows the application version, the installed bridge version and whether the
  bridge is up to date.
- Development checkout only: a packaged build does not include the bridge yet.

Earlier bridge builds without a version, still accepted by the application:
`6ad12b1c...27fc` (2026-10-08, before items) and `22f1637a...ac2f`
(2026-10-08, items, never started in the game).
