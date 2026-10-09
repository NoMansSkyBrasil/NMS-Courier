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
