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
