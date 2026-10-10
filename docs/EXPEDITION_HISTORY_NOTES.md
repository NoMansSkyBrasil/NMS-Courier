# Past expeditions and other one-off unlocks: what the game has

Owning note for two questions of the project owner on 2026-10-09. Offline
research only, build 180836 (executable `13d5060d…`), bridge 1.25.0
unchanged. **Nothing here is built or was sent to the game.**

## "Past expeditions" page of the journey screen

- The journey screen has a page category named `SeasonHistory` (one of
  `Journey`, `SeasonHistory`, `Race`, `Guild`, `Categories`).
- Its data is the table
  `metadata/reality/tables/historicalseasondatatable` (class
  `GcHistoricalSeasonDataTable`, 23 entries of `GcHistoricalSeasonData`):
  `SeasonName`, `SeasonNameUpper`, `SeasonNumber`, `RemixNumber`,
  `DisplayNumber`, `MainIcon` (the patch texture
  `TEXTURES/UI/FRONTEND/ICONS/EXPEDITION/PATCH.EXPEDITION.<n>.DDS`),
  `Description`, `FinalReward` and `UnlockedTitle`.
- `FinalReward` names an entry of the reward table (`RS_S1_COMPLETE` to
  `RS_S23_COMPLETE`). Each such entry hands over the season's last item and
  holds a `GcRewardUnlockSeasonReward` for it (`EXPD_SHIP01` for season 1,
  `EXPD_EGG_23` for season 23). `UnlockedTitle` is the text of the title the
  season gives (`UI_PLAYER_TITLE_EXPD<n>`).
- Display number and season number differ: display 5 is season 9, display
  23 is season 47.

**Not proven:** what the page tests to show an expedition as completed. The
two candidates the table offers are the season reward of `FinalReward`
being unlocked on the account and the title being unlocked. The code that
reads the table was not located. A live check would settle it: an account
where a season's final reward is unlocked and its title is not, or the
reverse.

## Completed but not redeemed

The game keeps two separate states for a season reward, both already used
by this project ([reward redemption](REWARD_REDEMPTION_NOTES.md),
[account unlocks](ACCOUNT_UNLOCK_NOTES.md)):

| State | Where | Meaning | Request of the bridge |
| --- | --- | --- | --- |
| Unlocked season reward | account | The reward was earned; every save may claim it at the Quicksilver companion | `account` |
| Redeemed season reward | slot | This save has already claimed it | `redeem` |

The "Expeditions" page of the application behaves in two ways today:
"send all" runs both requests (earned and claimed in the loaded slot);
sending chosen entries runs only the account request (earned, not claimed).
That difference is an accident of how the selection was added, not a
design. "Completed, rewards not redeemed" is therefore the account request
alone. Proposed, not built: one switch on the page, "Also mark as claimed
in this save", applied the same way to "send all" and to a selection.

Unproven: that a reward unlocked this way and not redeemed can then be
claimed from the Quicksilver companion in the game (the redemption notes
record the claim as never tried).

## Other one-off unlocks seen in another tool's list (owner's screenshot)

| Item of the list | What it is in the game's data | State here |
| --- | --- | --- |
| Learn all words | Word groups of five races | Words page (4,829 word and race pairs in 3,830 groups) |
| Learn all portal glyphs | `GcRewardDiscoverRune`; the game has 16 glyphs | Portal glyphs page |
| Enable Nexus/Anomaly | Reward class `GcRewardNexus` (`Allow`, `SeasonRewardsString`), shipped as the reward table entry `R_ENABLENEXUS`; also inside season completion rewards | Not built |
| Unlock wiki guide topics | Reward class `GcRewardWikiTopic`, 44 uses in the reward table naming 43 distinct topics (`UI_GUIDE_TOPIC_*`); the guide itself is `metadata/reality/wiki` | Not built |
| Unlock all hyperdrives | Technologies `HYPERDRIVE`, `HDRIVEBOOST1` to `HDRIVEBOOST4`, `F_HYPERDRIVE`, `F_HDRIVEBOOST1` to `F_HDRIVEBOOST3`, `WARP_ALIEN`, all classified deliverable | Covered by the Technologies page, not as a named shortcut |
| Unlock all 10 "Atlasstones" | Products `ATLAS_SEED_1` to `ATLAS_SEED_10` (Atlas Seeds), class `catalogue_item`: their crafting recipes | Covered by the crafting recipes page |
| Unlock basic base building blueprints | Build part products | Build parts page |
| Unlock Atlas Passes | Products `ACCESS1` to `ACCESS3`, class `catalogue_technology`: their crafting recipes | Covered by the crafting recipes page |

The counts in that list (4,795 words, 12 glyphs, 141 blueprints) are the
other tool's; the game's tables give the numbers above. For the two items
not built, the handlers of `GcRewardNexus` and `GcRewardWikiTopic` and the
state they write (slot or account) were not read yet; both classes are
plain rewards, so the carrier method of
[the data file](../runtime/mods/courier_rewards/README.md) is the expected
route.

## Reproduce

```text
grep -o 'name="FinalReward" value="[^"]*"' <corpus>/archives/*/metadata/reality/tables/historicalseasondatatable.MXML
grep -c 'value="GcRewardWikiTopic"' <corpus>/archives/*/metadata/reality/tables/rewardtable.MXML
```
