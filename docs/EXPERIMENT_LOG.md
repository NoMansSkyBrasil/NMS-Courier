# Runtime experiment log

This is the short entry point for resuming exact-build research. Detailed reasoning belongs in [runtime research](RESEARCH_AND_DECISIONS.md), implementation contracts in [protocol and runtime](PROTOCOL_AND_RUNTIME.md), and current tasks in [TODO](../TODO.md). Entries describe observations, not general compatibility claims. All live tests used the user's disposable local save; none used save-file editing.

## Reference points

| Subject | Location or identity | Use |
| --- | --- | --- |
| Tested game executable | Steam Windows build 179666, SHA-256 `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb` | Gate every runtime test; reject other builds |
| Current known-good test DLL | `runtime/native/asi/`; installed `Binaries/xinput9_1_0.dll` SHA-256 `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d` | Native XInput forwarding, update callback, one-shot local reward triggers |
| Current installed reward patch | `GAMEDATA/MODS/NMSCourierCurrencyRewardProbe/METADATA/REALITY/TABLES/REWARDTABLE.EXML`, SHA-256 `62840d2810e5ca2b30dccde5f75b9ab5d5ce07ade92ea1e2bb30ba555a9e9732` | Maps the third currency test event to the explicit freighter offer for the next fresh-process test; Quicksilver is not available through that event while installed |
| Original currency reward backup | Local development scratch copy SHA-256 `d67a57493af349e6a50d624537e5fdce59fdfdd2d29a6e2a63366e6c817f08e7` | Restore only while the game is closed, with exact-hash checks |
| Live process diagnostics | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-hook-<PID>.log` | Read callback and one-shot dispatch state; state `2` alone is not user-visible success |
| Reward and inventory sources | `runtime/mods/`, `runtime/native/asi/inspect-freighter-state.py` | Rebuild experiments and perform exact-build read-only inventory checks |
| Source research | [research decisions](RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666) | Trace upstream clue, extracted table field, live validation, and limitation |

The installed reward patch above is a development test configuration, not a release artifact. On 2026-09-24 the game was closed; executable, DLL, patch, and backup hashes were rechecked, and the only Courier mod directory in `GAMEDATA/MODS` was `NMSCourierCurrencyRewardProbe`. The repository was clean after commit `941fb1b` was pushed to `origin/main`.

## What was tested

| Date | Experiment and trigger | Observed result | Boundary or rejected hypothesis |
| --- | --- | --- | --- |
| 2026-09-22/23 | Native XInput startup proxy, exact-build `cGcApplication.Update` hook | Game loaded and one read-only run observed 7,319 callbacks | A callback is not a delivery command channel. Python/pyMHF's earlier authentication did not reliably produce callbacks in later test processes. |
| 2026-09-23 | One native `cGcInventoryStore.Add` call for `FUEL1 ×500` | User saw a second Carbon stack; total went 15 → 515 and persisted after normal reload | No native pickup notification or automatic stack merge was proven. |
| 2026-09-23 | One-shot `GiveGenericReward` IDs for Units, Nanites, Quicksilver | User confirmed +1,000,000,000 of each, right-side native notifications, and normal-save persistence | The test DLL uses named events, not the authenticated Electron command channel. |
| 2026-09-23 | First freighter-specific reward from normal gameplay | Free acquisition offer opened; user accepted C-class freighter. Units balance stayed unchanged. Read-only owned inventory later showed 35 valid main and 13 valid technology slots. | Reward's S class and 120 layout values did not configure the offer. The 21-position technology grid was not 21 unlocked slots. |
| 2026-09-23/24 | Startup with a separate `FreighterOfferTest` DLL | NMS showed a hang/modification error before startup/hook diagnostics. No offer was sent. Known-good DLL was restored. | Passing the isolated fixture did not prove safe game startup. Do not reinstall this rejected DLL unchanged. |
| 2026-09-24 | Scoped live generation-table values set to 120/60 and S=100 only during reward dispatch | One offer remained C class, 35 cargo positions, 21 technology grid positions. User declined. Original table bytes were observed after the call. | The reward callback was too late or ignored these generation fields. This is not a per-offer solution. |
| 2026-09-24 | Explicit reward inventory width 10, height 12, `NumSlotsFromTech=60`, FreighterLarge override | One offer showed C class, 120 cargo grid positions and 30 technology grid positions. User closed it without accepting. Owned freighter remained C/35/13. | Cargo grid dimensions affected UI; 120 valid cargo slots, S class, 60 technology slots, and supercharged slots were not proven. The C-class technology cap in the extracted table is 30. |
| 2026-09-24 | Offline `NumSlotsFromTech=120` reward and full-copy inventory-table control | MBINCompiler 7.04.0.1 round trips retained 120 in the reward, S technology cap 120, and FreighterLarge 10 × 12 technology bounds in the control | Serialization is not in-game support. The full-copy control includes global generation changes and was never installed. |
| 2026-09-24 | Sparse named `INVENTORYTABLE.EXML` array targeting check | Round trip placed requested FreighterLarge values into the first SciSmall array entry | Sparse inventory-table patch was removed from the repository and must not be installed. Use complete ordered data or a verified property-targeted builder. |

## Next reproducible gate

The specific freighter offer can be opened free of charge from ordinary gameplay, but its class is still generated as C. Determine the native path that creates or initializes **that particular offered freighter**. Use read-only inspection before any targeted mutation. Verify S class, 120 **valid/unlocked** cargo slots, and 60 valid technology slots in the offer and after acceptance. Only then assess a 120-technology experiment, because the vanilla S cap is 60 and the game may clamp or reject larger grids. Supercharged slots are a separate field and require separate evidence. Do not repeat a one-shot event in the same process or install a broad all-freighters generation patch to make this test appear successful.
