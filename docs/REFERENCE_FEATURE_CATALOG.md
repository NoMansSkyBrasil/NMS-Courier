# Reference service feature catalog and Courier parity tracker

Checkpoint: 2026-10-06 (Claude Code). Source: read-only inspection of the public
[NoMansApp](https://nomansapp.com/) client page in a browser (about 7.0 MB of
HTML, one 4.7 MB inline script, client version string 1.77, 165 named
functions) and of the [Charon](https://charon.gg) landing page. No request was
sent to either service, no account was used and nothing was downloaded into the
repository. The earlier snapshot analysis is in
[MetaIdea service research](METAIDEA_SERVICE_RESEARCH.md); this file is the
feature list the user asked to track. It describes what the reference client
*offers*, not how its server or bot implements anything.

Both references use a bot account that joins the player's multiplayer session,
with a queue and platform/version restrictions. Courier is local: the player's
own game process performs the operation through the verified bridge, so there
is no queue and no platform split. Charon only delivers catalog corvettes.

## Courier status legend

- **Verified (old build)**: live evidence exists on build 179666 only.
- **Research**: offline evidence or an untested research profile exists.
- **Not started**: no Courier work yet.

No row is a supported capability of the currently installed build 180836.

## Services in the reference client

| Reference service | Client command | Main inputs visible in the client | Courier status |
| --- | --- | --- | --- |
| Location Transfer | `LOCATION_TRANSFER` | Ship warp or teleport; portal address book, galaxy, fixed destinations | Not started |
| Item Delivery | `ITEM_DELIVERY` | Substance, product, procedural product or tech box; amounts | Verified (old build) for one item; catalog not built |
| Units / Nanites / Quicksilver | `CURRENCY_DELIVERY` | Currency type and amount | Verified (old build) |
| Ship Delivery | `SHIP_DELIVERY` | Type or variant, seed, delivery mode (NPC purchase, free/reskin, exchange screen), location, optional color, class override, S-class flag, connected supercharged slots, legacy colors | Research: seed and class algorithms; no delivery |
| Ship upgrades | `SHIP_UPGRADER` | Class upgrade, slot unlock, repair | Research: handlers located on 180383 |
| Multitool / Staff Delivery | `MULTITOOL_DELIVERY` | Reward ID from a fixed list | Research: handler chain located on 180383 |
| Freighter / Frigate Delivery | `FREIGHTER_DELIVERY` | Type (normal, capital, pirate, frigate), model seed, color/home seed, NPC crew race and seed, two colors, optional reward ID. **No class field** | Research: old-build C-class offer; class override profile built, untested |
| Service Bot Extender | `SERVICE_BOT_EXTENDER_DELIVERY` | Procedural type (20 ships, 10 multitools/staffs, 3 freighters, 9 frigates) and seed | Research: same seed inputs as above |
| Pet Egg and Creature Delivery | `EGG_DELIVERY` | Creature type and seed, size, class, affinity, moveset, advanced appearance | Not started |
| Expedition / Season Reward Unlocker | `REWARD_DELIVERY` | One or many reward IDs by season and table | Research: unlock handler located on 180383 |
| Universal Unlocker | `UNIVERSAL_UNLOCKER` | Recipe, technology and part unlock groups | Research: recipe/tech handlers located on 180383 |
| Packaged Tech Delivery | `TECH_DELIVERY` | Technology list with filter | Not started |
| Customization Parts Delivery | `CUSTOMIZATION_PARTS_DELIVERY` | Ship fabricator and appearance parts | Not started |
| Corvette Parts Delivery | `CORVETTE_PARTS_DELIVERY` | Corvette part selection | Not started |
| Corvette Delivery and Sharing | `CORVETTE_DELIVERY` | Catalog entry or sharing code; upload | Not started |
| Base Building | `BASE_BUILDING` | Part source (planet, freighter, corvette, legacy, settlement, system) | Not started |
| Base / Corvette single build item | part of the base commands | One placed part | Not started |
| Spawner | spawner list command | Entity from a fixed list | Not started |
| Quick Actions | `QUICK_ACTION` | Fixed action list | Not started |
| Find Point of Interest | `UP_SCAN` | Scan target list | Not started |
| Mission Starter | mission command | Mission ID | Not started |
| Byte Beat Track Delivery | `BYTEBEAT_DELIVERY` | Track from a fixed list | Not started |
| Perfect Planet Finder | client-side export filter | Galaxy and region data | Not started; no game mutation involved |
| Sharing Center | sharing commands by category | Category, catalog ID, sharing code | Not started |

## Observations relevant to the current focus

- The ship form sends a boolean S-class flag and an optional class override;
  the freighter form sends neither. The page states that ship class options are
  currently disabled and that ship delivery currently replaces the active ship.
  This agrees with the build 180383 finding that the purchase setup honors the
  payload class for ships and weapons but generates class-0 stats for freighters
  (see [inventory class research](INVENTORY_CLASS_RESEARCH.md)).
- Freighter appearance is expressed as three independent seeds (model,
  color/home, NPC crew) plus optional explicit colors, matching the separate
  model and palette inputs already traced in
  [entity seed flow](ENTITY_APPEARANCE_SEED_FLOW.md).
- Seeds are entered as up to 16 hexadecimal digits and zero is replaced by 1.

## How to use this tracker

Add evidence links and change a status only when the owning specification and
the experiment log record the result for an exact build. Order of work follows
the user's priority: seeds and classes for ships, multitools and freighters
first; other rows are a backlog, not commitments.
