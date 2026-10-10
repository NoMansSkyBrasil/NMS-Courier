# Completing missions: what the game has

Owning note for the owner's request of 2026-10-09 ("complete the quest and
keep completing"). First offline pass on build 180836 (executable
`13d5060d…`), bridge 1.26.0 unchanged. **Nothing is built and nothing was
sent to the game.**

## Mission data

28 tables under `metadata/simulation/missions/tables`, 1,876 missions in
all (`GcGenericMissionSequence`, each with `MissionID`, `MissionClass`,
titles, and a list of stages). Largest: seasonal 352, seasonal bespoke 281,
tutorial 155, wiki 115, space points of interest 101, recurring 99, core 87,
`missiontable` 84, community 83, Autophage 76, Atlas path 58. By class:
Guide 545, Seasonal 523, Secondary 505, Primary 101, Wiki 60,
ChainedSecondary 60, Milestone 52, FleetSupport 13, Atlas 13, Settlement 2.

The main story is not one mission: the core table chains many small ones
(`STORY_INIT`, `ACT1_STEP1`, `ACT1_STEP1_PART1` … ), each a short sequence
that starts the next through its rewards.

## Rewards of the game that act on missions

Classes in the executable's metadata; uses counted in the reward table.

| Class | Fields (offset) | Uses | What it does |
| --- | --- | --- | --- |
| `GcRewardCompleteMission` (hash `0x0d91902f`, `0x10`) | Mission `+0x00` | 2 (`PIRATE_INIT`, `PIRATES1`) | Completes the named mission; handler `f2b650` calls `42d110` with the identifier |
| `GcRewardCompleteMultiMission` | Missions (a list) `+0x00` | 0 | Same for several; handler `f2b6b0` |
| `GcRewardMission` | AlreadyActiveFailureMessage `+0x00`, Mission `+0x20`, FailRewardIfMissionActive `+0x30`, Restart `+0x31`, SetAsSelected `+0x32` | 61 | Starts a mission |
| `GcRewardSetCurrentMission` | Mission `+0x00`, Seeded `+0x10`, Silent `+0x11` | 1 | Makes a mission the selected one |
| `GcRewardMissionOverride` | ForceLocalMissionSelection, Mission, OptionalMissionSeed, Reward | not counted | Not read |

Also present and not read: `GcRewardSetMissionStat`,
`GcRewardSetInteractionMissionState`, the mission sequence node
`GcMissionSequenceCompleteMission`, the condition
`GcMissionConditionMissionCompleted`.

## What is not known yet

- What `42d110` does to a mission that is in the middle: whether it runs
  the rewards of the stages it skips (blueprints, items, the start of the
  next mission) or only marks the mission finished. This decides whether
  "complete" is safe for story missions: a mission marked finished without
  its rewards would leave the player without what the story hands out, and
  without the next mission.
- Whether the game has a routine that advances the active mission by one
  stage. No reward class does that; the progress of a mission is a stage
  index kept with the mission in the slot.
- How to read the slot's active missions and their stage from the running
  game, which a "complete the current step" button needs.

## Options to put to the owner

1. **Complete a named mission** with `GcRewardCompleteMission` on a
   carrier, the way guide topics are done. Cheap to build; safe only where
   the skipped stages give nothing, which must be read first.
2. **Advance the selected mission one stage at a time**, letting the game
   run each stage's own rewards and start the next mission itself. This is
   what "keep completing" suggests and it respects the rule that the game
   hands things over; it needs the stage routine and a read of the active
   mission, neither found yet.

## Reproduce

```text
grep -c 'value="GcGenericMissionSequence"' <corpus>/archives/*/metadata/simulation/missions/tables/coremissiontable.MXML
grep -n -A3 'value="GcRewardCompleteMission"' <corpus>/archives/*/metadata/reality/tables/rewardtable.MXML
```
