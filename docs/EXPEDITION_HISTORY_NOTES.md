# Past expeditions and other one-off unlocks: what the game has

Owning note for two questions of the project owner on 2026-10-09. Offline
research on build 180836 (executable `13d5060d…`). Built the same day after
the owner's go-ahead: the expeditions switch, the guide and the Space
Anomaly (application 1.31.0, bridge 1.26.0); see "Built" below. The guide
and the Space Anomaly were **not sent to the game yet**.

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

Owner's statement, 2026-10-09 (not seen by this session, no build or slot
named): past expeditions were unlocked with the application and their
rewards were then claimed from the Quicksilver companion in the game. So
an unlocked, unredeemed reward can be claimed.

## Other one-off unlocks seen in another tool's list (owner's screenshot)

| Item of the list | What it is in the game's data | State here |
| --- | --- | --- |
| Learn all words | Word groups of five races | Words page (4,829 word and race pairs in 3,830 groups) |
| Learn all portal glyphs | `GcRewardDiscoverRune`; the game has 16 glyphs | Portal glyphs page |
| Enable Nexus/Anomaly | Reward class `GcRewardNexus` (`Allow`, `SeasonRewardsString`), shipped as the reward table entry `R_ENABLENEXUS`; also inside season completion rewards | Space Anomaly page (bridge 1.26.0) |
| Unlock wiki guide topics | Reward class `GcRewardWikiTopic`, 44 uses in the reward table naming 43 distinct topics (`UI_GUIDE_TOPIC_*`); the guide itself is `metadata/reality/wiki` | Guide page (bridge 1.26.0) |
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

## Built (application 1.31.0, bridge 1.26.0)

- **Expeditions switch.** "Also mark as claimed in this save", off by
  default; `getDeliveryPlan` and the selection plan both add the `redeem`
  step only when it is on (for a selection, only for the rewards the slot's
  routine takes, `unlockable-rewards.md`).
- **Guide.** `GcRewardWikiTopic` (class `0x6525a55c`, `0x28` bytes: Topic
  `+0x00`, a text of `0x20` bytes; CentreMessage `+0x20`), handler `f34a20`.
  The guide table has 58 topics in 8 categories, 8 open from the start
  (`Unlocked`), 43 named by a reward of the game's table; the application
  offers the 50 that are not open ([guide-topics.md](../runtime/research/guide-topics.md),
  `list-guide-topics.py`). Request `native-wiki-request-…`, event `wiki`:
  `silent=0|1` and 1 to 128 `topic=<ID>` lines; result `result=`,
  `requested=`, `reward_calls=`. The carrier `COURIER_WIKI` is given the
  topic for each call and restored; with `silent=1` its CentreMessage is 0.
  Unproven: that the handler opens a topic no shipped reward names (7 of
  the 50), and where the opened topics are kept (slot assumed).
- **Space Anomaly.** `GcRewardNexus` (class `0xb7c7de23`, `0x28` bytes:
  SeasonRewardsString `+0x00`, Allow `+0x20`) is handled inside the reward
  routine (`f1d641`): Allow is copied to the byte at manager `+0x28289` and
  the state is marked changed. Request `native-nexus-request-…`, event
  `nexus`: the one line `allow=1`; result `result=`, `allowed_before=`,
  `allowed_after=`. The carrier `COURIER_NEXUS` already holds Allow true, so
  nothing is written by the bridge; the byte is only read. Access is never
  taken away. Unproven: what the game shows or opens once the byte is 1
  (summoning the Anomaly in space, its missions), and that it is kept in
  the slot after a save and reload.

All three are native calls of the game's reward routine; the only direct
write is the topic text of the `COURIER_WIKI` carrier, restored after the
calls.

## Reproduce

```text
grep -o 'name="FinalReward" value="[^"]*"' <corpus>/archives/*/metadata/reality/tables/historicalseasondatatable.MXML
grep -c 'value="GcRewardWikiTopic"' <corpus>/archives/*/metadata/reality/tables/rewardtable.MXML
```
