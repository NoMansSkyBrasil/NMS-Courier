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
| Freighter / Frigate Delivery | `FREIGHTER_DELIVERY` | Type (normal, capital, pirate, frigate), model seed, color/home seed, NPC crew race and seed, two colors, optional reward ID. **No class field** | Research: owned S freighter with 120 cargo and 120 all-special technology slots once on build 180836 (2026-10-06); pirate model with chosen model and home seeds delivered once (visible after restart); in-session model refresh and natural technology loadout open |
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

## What the reference shows about delivery to another player (owner's screenshots, 2026-10-07)

The owner supplied six screenshots of the reference client's service pages
and pointed out that they settle one question: **delivery to a player who
has nothing installed exists and is in public use.** What is unknown is how
it is done, not whether it can be. Courier's network-player target is still
not started and nothing below has been reproduced by us.

Read from the page text only:

| Service | What the page states | What it tells us |
| --- | --- | --- |
| Service list | "All Platforms including Consoles": location transfer, item delivery, corvette, ship, pet egg, fabricator parts, universal unlocker, packaged technology, base building, freighter and frigate, spawner, mission starter, byte beat, planet finder, sharing. "Only Switch 2 (time limited until game version 7.05)": expedition reward unlocker, multitool delivery, units, nanites and quicksilver, quick actions, scan, universal unlocker legacy | Most services work against an unmodified client on every platform; a second group depends on something a game version removes, so the game has been closing some routes |
| Expedition reward and blueprint unlocker | Unlocks expedition rewards "accountwide in all your saves at once"; rewards then appear in the Quicksilver shop or directly in the customiser; technology and product recipes "are unlocked directly"; the bot joins the game and takes under a minute; one request per reward | The recipient's own game performs an account-level unlock when told to by the session. This is the opposite scope of a console save editor and matches the account lists we mapped |
| Universal unlocker | Maximum standing with each race and guild; fishing helmets, tanks and floats ("changes your fishing stats", and "due to an HG game bug" available in only one save); trucking titles and Colossus modules; arena league eggs | Statistics-driven unlocks are delivered by changing the recipient's statistics, which is also how titles would be reached |
| Packaged technology delivery | The player waits at the Egg Sequencer, the bot joins, the player puts any item into one of its four slots, the bot leaves, the player reopens the sequencer; the packaged technology is then in the inventory; procedural technology needs a save and reload | Items reach the recipient through an in-game container that is synchronised between players, not through a trade window |
| Mission starter | Starts any of the 1,700 or more missions; multiplayer missions become active on the Nexus terminal | Mission state is something a session peer can set |
| Location transfer | The player waits in the ship in the Anomaly; on leaving, the game offers "Service Bot's current system" | Uses the game's own join-a-traveller warp |

Consequences for Courier, as readings to test and not as facts:

- The recipient's game runs its own reward and unlock routines in response
  to something sent in the session. The routines we call locally today
  (`f44010`, `5ab380`, `5aafd0`, the learn routines) are probably the same
  ones that end up running on the recipient's side.
- So the study to open the network target is: which multiplayer messages
  make a peer run a reward, and how a synchronised container hands over
  items. Start from the game's network message handlers that lead to the
  reward handler.
- The "Switch 2 only until 7.05" group shows such routes get closed by
  updates; whatever we find must be pinned to an exact build like the rest.

### Intended flow for a network delivery (owner's description, 2026-10-07)

1. The sender joins the recipient's session, or the recipient joins the
   sender's.
2. The sender picks the recipient by friend ID or by player name; the tool
   should read the players present in the session and offer them, instead of
   asking for a typed name.
3. The sender fires the delivery and the recipient receives it.

What each step needs from research, none of it started:

| Step | Needs |
| --- | --- |
| Session | Nothing new: the game's own multiplayer. Only read which session the game is in |
| Recipient | Where the running game keeps the list of session players (name, platform ID, network ID); read-only |
| Fire | The message that makes that one peer run a reward or receive items, addressed to the chosen player and to nobody else |

Rules that already apply: the result must be reported per recipient, a
local success never counts as a network success, and an unanswered request
is an unknown outcome that is not retried automatically.

## Delivery defaults requested by the user

Stated on 2026-10-06: an entity should arrive with the chosen class (S when not
specified), all cargo and technology slots unlocked and all technology slots
supercharged; this applies to ships, freighters, multitools and the player
inventory. Status per part is tracked in
[inventory class research](INVENTORY_CLASS_RESEARCH.md); only the freighter
offer class has live evidence so far.

Natural default technologies per entity are tracked in
[default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md).

## How to use this tracker

Add evidence links and change a status only when the owning specification and
the experiment log record the result for an exact build. Order of work follows
the user's priority: seeds and classes for ships, multitools and freighters
first; other rows are a backlog, not commitments.
