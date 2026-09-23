# Carbon reward data-mod probe

This is an isolated, unverified game-data mod prototype. It is not the Courier delivery bridge and is not installed into the game by the repository build.

The installed Steam build 179666 reward table, extracted read-only on 2026-09-23, contains `PLANTER_CARBON` with a 100% `GcRewardSpecificSubstance` entry for `FUEL1` (Carbon) and a vanilla amount range of 40–80. The patch changes only that entry's minimum and maximum to 500. It tests whether the current game's EXML patch loader applies a narrow change to an existing native item reward. It does not receive desktop commands, choose another item, grant an item without the planter's normal trigger, or target a network player.

Evidence input: `NMSARC.Precache.pak` from `E:\SteamLibrary\steamapps\common\No Man's Sky\GAMEDATA\PCBANKS`, extracted with HGPAKtool 1.1.3 and converted with MBINCompiler v7.04.0-pre1. The converter reported one converted file, but its `version` command reported “Unknown MBIN version” for the game's reward table. Treat this as a research conversion, not a pinned production compatibility guarantee. The generated MXML remains in a temporary research directory and is not included in the repository.

Live validation, if attempted on the user's disposable save, must first verify the exact game executable fingerprint and back up any existing mod configuration. Copy only the `NMSCourierCarbonRewardProbe` directory beneath `GAMEDATA\MODS`, launch the game normally, and confirm the mod is loaded. Verify the effective reward table with the game's MXML export facility if available. Activate an actual carbon planter once, compare the Carbon count before and after, save normally, and reload to confirm persistence. Remove only this probe folder to roll back. If the resulting amount is not exactly 500, inspect the effective table and other reward modifiers; do not call the test successful based only on mod loading.

The player's test save may not contain a carbon planter. A different trigger should be selected from the current game assets before live testing in that case; do not infer that this patch delivered an item when no qualifying interaction occurred.
