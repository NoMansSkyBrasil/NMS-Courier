# Recipe delivery notes

Checkpoint: 2026-10-07. Owner of the recipe domain: teaching the loaded save
slot the refiner and cooking recipes the game lists under known recipes.

Status in one line: the game routine is identified, a request is built into
the research profile and installed; **nothing has been taught in a running
game yet.** Scope of a delivery: one slot (see
[live bridge operations](LIVE_BRIDGE_OPERATIONS.md#saves-slots-and-account-data)).

## What a known recipe is

The recipe table `METADATA/REALITY/TABLES/NMS_REALITY_GCRECIPETABLE.MBIN` has
1,684 entries: 361 refiner recipes (`REFINERECIPE_n`) and 1,323 cooking
recipes (`RECIPE_n`). A known recipe is listed in the game's catalogue; the
save keeps the list under `KnownRefinerRecipes`. The test slot (slot 3) had 7
on 2026-10-07; slot 1 has all 1,684.

## Are there defective recipes?

Checked the whole table before building anything, as the repository rules
require. Found none:

| Check | Result |
| --- | --- |
| Duplicate IDs | none |
| Result that is not a product or substance | none |
| Ingredient that is not a product or substance | none |
| Recipe without ingredients, or with a zero or negative amount | none |
| Missing name or type text | none |
| ID form | every ID is `RECIPE_n` or `REFINERECIPE_n`, at most 16 characters |

27 recipes list their own result among their ingredients (for example a food
that is processed into itself); that is how the table expresses those
processes, not a defect. So there is no blocked class for recipes today. The
profile still refuses any table entry whose ID is not well formed and never
sends an ID that the running game's table does not contain.

## How the game adds a known recipe (offline finding, build 180836)

No shipped reward teaches a recipe, so there is no reward handler to follow.
The known recipes are a set in the player state at `+0x18750` (32-byte IDs).
Two places in the game insert into it:

- a routine at `576a0c` that handles one recipe: table lookup (`ec9c70`),
  "already known?" (`5aad90`), then the insert with several inline steps;
- a merge routine, `5a1670` (player state, source, flag), called once when a
  save is loaded. Its source holds plain (pointer, count) lists: technologies
  at `+0x30`, products at `+0x00` and `+0x20`, **recipes at `+0x10`**, words
  at `+0x40`. For each recipe it requires the ID in the recipe table
  (`*(manager + 0xb8)`, entries of `0x90` bytes with the ID first), skips IDs
  already known and inserts the rest.

The profile uses the merge routine, because it is one call with the game's
own checks and inserts, instead of copying the inline steps of the first
place. It builds a source in which only the recipe list is filled and passes
flag 1 (with flag 0 the routine returns before the product and recipe lists).

### The side effect that had to be ruled out

Besides the lists of its source, the merge routine walks two lists held by
the manager (`+0x4c5cd8` and `+0x4c5cc8`) and adds their entries to the known
technologies and known products. They look like the things every save knows
from the start, which the same routine already added when the slot was
loaded; that reading is not confirmed. So the profile reads both lists first
and **refuses to call the routine unless every entry of both is already
known**, reporting `refused_for_side_effect=1`. With that guard the call can
add nothing but recipes.

This is a native call. The profile writes nothing into game memory itself.

Not verified: the call from the update hook outside a save load; that the
flag has no further effect when the other lists are empty (read from the
disassembly, not observed); what the catalogue shows afterwards; save and
reload.

## The request (research profile, build 180836)

- Event `recipes`; request file
  `%LOCALAPPDATA%/NMSCourier/diagnostics/native-recipe-request-180836-<PID>.txt`
  with either the single line `all=1` or one `id=<ID>` per line.
- On the game's update thread: read the running game's recipe table, count
  the recipes already known, collect the unknown ones that were asked for,
  check the side-effect guard, call the merge routine once, count again.
- Result file `native-recipe-result-180836-<PID>.txt`: `table_recipes`,
  `sent`, `unknown_ids`, `known_before`, `known_after`,
  `refused_table_entries`, `refused_for_side_effect`.
- Script: `runtime/native/asi/signal/signal-recipe-180836.ps1` with `-All` or
  `-Id A[,B...]`.

"All" is taken from the running game's own table, so a later game version's
recipes are included without a list in this repository, once the addresses
are revalidated for that build.

## Build and installation (2026-10-07)

| Item | Value |
| --- | --- |
| Game build | 180836, executable SHA-256 `13d5060d...3499` |
| Profile DLL | `build-probe.ps1 -Mode Profile180836`, SHA-256 `22cf6a823202a113cb9d92f27faaf72c359cd7da1e2765242dcf1edf1b6bf545` |
| Installed | Yes, with the game closed, replacing `4cea02b7...f6b3`. Replaced later the same day, before any game start, by `0983a24e...2106` and then `3c7a6fcc...4269`, each with the same recipe request plus later requests; use the last hash for the first test |
| Backup | Whole save folder and the user settings file copied unchanged to `E:/NMS-Courier-Research/save-backups/20261007-before-recipes` |
| Checks run | Recipe guard fixture, technology guard fixture and freighter class fixture pass |
| Later build | The source was split per domain the same day; the installed DLL is `2bd83437...ca78` with the same requests |
| Checks not run | Any live request; the new DLL has not been started by the game |

Rollback: restore the previous DLL with the game closed. No native route to
forget a recipe is known; use the save copy.

## First live test (proposed, not done)

1. Start the game, load slot 3.
2. `signal-recipe-180836.ps1 -GameProcessId <pid> -ExpectedDllSha256 2bd83437... -PreflightOnly`.
3. One recipe by ID; read the result file and look at the catalogue.
4. `-All`; expect `known_after` equal to `table_recipes`.
5. Save, close, start again; check the list and that the technologies and
   products of the slot are unchanged.
