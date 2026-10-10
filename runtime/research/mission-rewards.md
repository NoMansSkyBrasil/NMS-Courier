# Mission rewards

<!-- data-table: parsed by runtime/research/markdown_data.py; keep one table, one row per entry -->

Every reward table entry a mission stage of build 180836 hands over: the entry, whether every reward in it only hands the player something (`hands_over`), steers the game (`internal`), is empty or is missing from the reward table, the reward classes inside it, how many missions use it and up to six of them. Made by `classify-mission-rewards.py`; the list of classes that count as handing something over is in that script.

| Reward | Verdict | Classes | Missions | Used by |
| --- | --- | --- | --- | --- |
| ABAND_LAND_CHAT | internal | GcRewardSendChatMessage | 1 | ABAND_FREIGHT |
| BASE_FLAG | hands_over | GcRewardSpecificProductRecipe | 2 | STORY_RESTART TUT_BASEBUILD |
| BASE_PARTS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | TUT_CATCHUP |
| BASE_RAND_FLAG | hands_over | GcRewardSpecificProductRecipe | 2 | TUT_BASEBUILD TUT_CATCHUP |
| BASE_RAND_LIGHT | hands_over | GcRewardSpecificProductRecipe | 2 | TUT_BASEBUILD TUT_CATCHUP |
| BEGIN_SALVAGE | internal | GcRewardMissionSeeded | 1 | ACT2_STEP8 |
| BP_A_RECOVER | hands_over | GcRewardSpecificProductRecipe | 1 | BP_ANALYSER_FIX |
| BP_FIRST_TECH | hands_over | GcRewardSpecificProductRecipe | 1 | TUT_CATCHUP |
| CATCH_MICROCHIP | hands_over | GcRewardSpecificProductRecipe | 1 | SCI_CATCHUP2 |
| CATCH_REFINER3 | hands_over | GcRewardSpecificProductRecipe | 1 | SCI_CATCHUP2 |
| CATCH_WEAPPROD1 | hands_over | GcRewardSpecificProductRecipe | 1 | WEAPGUY_CATCHUP |
| CATCH_WEAPPROD2 | hands_over | GcRewardSpecificProductRecipe | 1 | WEAPGUY_CATCHUP |
| C_ATLASSTONE1 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE10 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE2 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE3 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE4 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE5 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE6 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE7 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE8 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| C_ATLASSTONE9 | hands_over | GcRewardSpecificProductRecipe | 1 | AP_SEEDCHECK |
| DEL_ITEM_R | hands_over | GcRewardSpecificProduct | 1 | DELIVER |
| DEL_ITEM_R2 | hands_over | GcRewardSpecificProduct | 1 | DELIVER_HARD |
| FACTHARD_CANCEL | internal | GcRewardMissionMessageSeeded | 1 | FACT_RAID_HARD |
| FACTHARD_WANTED | internal | GcRewardWantedLevel | 1 | FACT_RAID_HARD |
| FACTMED_CANCEL | internal | GcRewardMissionMessageSeeded | 1 | FACT_RAID_MED |
| FAUNA_SCANTUT | internal | GcRewardMissionMessage | 1 | SCAN_TUT_FAUNA |
| FLORA_SCANTUT | internal | GcRewardMissionMessage | 1 | SCAN_TUT_FLORA |
| FREIGHTERLOOT | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificProductFromList GcRewardSpecificSubstance | 1 | WRECK_REWARDS |
| GDEL_ITEM_R2 | hands_over | GcRewardSpecificProduct | 1 | G_DEL_HARD |
| GFACTMED_CANCEL | internal | GcRewardMissionMessageSeeded | 1 | G_FACT_RAID_MED |
| GRAVEFIENDS_OFF | internal | GcRewardDeactivateFiends | 1 | ROGUE_GRAVEEXT1 |
| GRAVEFIENDS_ON | internal | GcRewardActivateFiends | 1 | ROGUE_GRAVEEXT1 |
| HNDIN_SCI3 | internal | GcRewardMission | 1 | SCIENTIST3 |
| INTERVN_FAILURE | internal | GcRewardInterventionResponse | 7 | FLEET_COMBAT1 FLEET_COMBAT4 FLEET_TRADING1 FLEET_TRADING4 FLEET_EXPLORE5 FLEET_EXPLORE9 |
| INTERVN_SUCCESS | internal | GcRewardInterventionResponse | 12 | FLEET_COMBAT1 FLEET_COMBAT4 FLEET_TRADING1 FLEET_TRADING4 FLEET_EXPLORE1 FLEET_EXPLORE2 |
| LEARN_B_TERM | hands_over | GcRewardSpecificProductRecipe | 1 | OVERSEER1 |
| MB_STAND_GUILD | internal | GcRewardFactionStanding | 10 | G_BOUNTY_MED G_COLLECT2 G_COLLECT3 G_DEL_HARD G_PHOTO_BIOME G_PHOTO_CRE |
| MB_STAND_HIGH | internal | GcRewardFactionStanding | 13 | PP_NEW_ROBOTS_H PP_NEW_KILL_FIE PP_NEW_KILL_WRM PP_NEW_DIG SO_COLLECT_H1 SO_COLLECT_H2 |
| MB_STAND_LOW | internal | GcRewardFactionStanding | 49 | CV_KILL_ROBOTS CV_GO_FISH CV_FEED_CRE CV_KILL_CRE CV_COLLECT CV_HARVEST |
| MB_STAND_MED | internal | GcRewardFactionStanding | 34 | CV_PLANTKILL CV_KILL_FIENDS CV_DEPOT_RAID_M CV_HIVES_M CV_PROC_PRODS_M PP_BUI_KILL |
| MB_STAND_PIRATE | internal | GcRewardFactionStanding | 4 | PIRATE_RIVALS PIRATE_FREIGHT PIRATE_TRADERS PIRATE_SMUGGLE |
| MIN_SCANTUT | internal | GcRewardMissionMessage | 1 | SCAN_TUT_MIN |
| MISSWIKI_START | internal | GcRewardMission | 1 | ACT1_STEP6 |
| MP_DEPOT_MSG_D | internal | GcRewardMissionMessageToMatchingSeeds | 1 | MP_DEPOT_RAID |
| MP_DEPOT_RESET | internal | GcRewardModifyStat | 1 | MPDEPOT_STATS |
| MP_DEPOT_SMISS | internal | GcRewardMissionSeeded | 1 | MP_DEPOT_RAID |
| MP_DEPOT_STAT_D | internal | GcRewardModifyStat | 1 | MPDEPOT_STATS |
| MP_DEPOT_STAT_H | internal | GcRewardModifyStat | 1 | MPDEPOT_STATS |
| MP_DEPOT_WANTED | internal | GcRewardWantedLevel | 1 | MP_DEPOT_RAID |
| MP_PIRATE_SMISS | internal | GcRewardMissionSeeded | 1 | MP_SPACEBATTLE |
| PORTALRUNE1 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE10 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE11 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE12 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE13 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE14 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE15 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE16 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE2 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE3 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE4 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE5 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE6 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE7 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE8 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PORTALRUNE9 | internal | GcRewardDiscoverRune | 1 | ACT3_STEP3 |
| PP_CS_FRAID_WTD | internal | GcRewardWantedLevel | 1 | PP_CS_RAID |
| RS10_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S10 |
| RS10_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S10 |
| RS10_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S10 |
| RS10_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S10 |
| RS10_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S10 |
| RS11_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S11 |
| RS11_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S11 |
| RS11_ITEMS_FREI | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S11 |
| RS11_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S11 |
| RS11_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S11 |
| RS11_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S11 |
| RS11_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S11 |
| RS12_INSTALL | internal | GcRewardFillInventoryWithBrokenSlots GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S12 |
| RS12_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S12 |
| RS12_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S12 |
| RS12_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S12 |
| RS12_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S12 |
| RS12_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S12 |
| RS13_INSTALL | internal | GcRewardFillInventoryWithBrokenSlots GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S13 |
| RS13_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S13 |
| RS13_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S13 |
| RS13_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S13 |
| RS13_PRODS | internal | GcRewardForgetSpecificProductRecipe GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S13 |
| RS13_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S13 |
| RS14_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S14 |
| RS14_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S14 |
| RS14_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S14 |
| RS14_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S14 |
| RS14_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S14 |
| RS14_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S14 |
| RS15_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S15 |
| RS15_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S15 |
| RS15_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S15 |
| RS15_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S15 |
| RS15_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S15 |
| RS15_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S15 |
| RS16_INSTALL | internal | GcRewardInstallTech GcRewardRefreshHazProt GcRewardRepairWholeInventory | 1 | SEASONSETUP_S16 |
| RS16_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S16 |
| RS16_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S16 |
| RS16_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S16 |
| RS16_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S16 |
| RS16_TECHS | internal | GcRewardForgetSpecificTechRecipe GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S16 |
| RS17_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S17 |
| RS17_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S17 |
| RS17_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S17 |
| RS17_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S17 |
| RS17_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S17 |
| RS17_TECHS | internal | GcRewardInstallTech GcRewardRepairWholeInventory GcRewardSpecificTech | 1 | SEASONSETUP_S17 |
| RS18_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory GcRewardSpecificTech | 1 | SEASONSETUP_S18 |
| RS18_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S18 |
| RS18_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S18 |
| RS18_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S18 |
| RS18_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S18 |
| RS18_TECHS | internal | GcRewardForgetSpecificTechRecipe GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S18 |
| RS19_INSTALL | internal | GcRewardDamageTech GcRewardFillInventoryWithBrokenSlots GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S19 |
| RS19_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S19 |
| RS19_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S19 |
| RS19_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S19 |
| RS19_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S19 |
| RS20_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S20 |
| RS20_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S20 |
| RS20_ITEMS_SHIP | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S20 |
| RS20_MISS | internal | GcRewardCompleteMultiMission GcRewardShowBlackHoles | 1 | SEASONSETUP_S20 |
| RS20_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASONSETUP_S20 |
| RS20_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASONSETUP_S20 |
| RS21_INSTALL | internal | GcRewardDamageTech GcRewardFillInventoryWithBrokenSlots GcRewardInstallTech GcRewardRefreshHazProt GcRewardRepairWholeInventory | 1 | SEASONSETUP_S21 |
| RS21_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S21 |
| RS21_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S21 |
| RS22_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S22 |
| RS22_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S22 |
| RS23_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASONSETUP_S23 |
| RS23_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASONSETUP_S23 |
| RS23_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASONSETUP_S23 |
| RS23_RECOVER_TM | hands_over | GcRewardSpecificTech | 1 | S23_RECOVER_TM |
| RS_CLEAN_SPOOK | internal | GcRewardInstallTech | 1 | STORY_RESTART |
| RS_S16_MSTAT | internal | GcRewardSetMissionStat | 1 | S16_SPOOK_JUICE |
| RS_SUBENG_FUEL | internal | GcRewardRechargeTech | 1 | SEASONAL_SUBGAS |
| R_13_GHOSTCOUNT | internal | GcRewardEndFrigateFlyby GcRewardSetMissionStat | 1 | S13_GHOSTS_EXT |
| R_A1S11_WANTED | internal | GcRewardWantedLevel | 1 | ACT1_STEP11 |
| R_A1S13_WANTED | internal | GcRewardWantedLevel | 1 | ACT1_STEP13 |
| R_A1S2_HYP | hands_over | GcRewardSpecificTech | 1 | TUT_NEXT2 |
| R_A1S5_SCANNER | hands_over | GcRewardSpecificProductRecipe | 1 | ACT1_STEP5 |
| R_A1S9_FLAG_ALL | internal | GcRewardMissionMessage GcRewardMultiSpecificProductRecipes GcRewardSpecificProduct | 1 | ACT1_STEP9 |
| R_A1S9_PARTS | hands_over | GcRewardMultiSpecificProductRecipes GcRewardSpecificProduct | 1 | ACT1_STEP9 |
| R_A2BEACON | internal | GcRewardMission | 1 | ACT1_STEP13 |
| R_A2S13_BEACON | internal | GcRewardMission | 1 | ACT2_STEP13 |
| R_A2S13_COMBO1 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO2 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO3 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO4 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO5 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO6 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO7 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO8 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_COMBO9 | internal | GcRewardMission | 1 | A2S13_RECOVERY |
| R_A2S13_RECOVER | internal | GcRewardMission | 1 | ACT2_STEP13 |
| R_A2S13_TEXTSET | internal | GcRewardMissionMessage | 1 | ACT2_STEP13 |
| R_A2S1_DAMAGE | internal | GcRewardDamageTech | 1 | ACT2_STEP1 |
| R_A2S5_WAITS | internal | GcRewardMission | 1 | ACT2_STEP5 |
| R_A2S9_NO_WANT | internal | GcRewardWantedLevel | 1 | ACT2_STEP9 |
| R_A2S9_WANTED | internal | GcRewardWantedLevel | 1 | ACT2_STEP9 |
| R_A3S1_DAMAGE | internal | GcRewardDamageTech | 1 | ACT3_STEP1 |
| R_A3S2_CHOICE | internal | GcRewardMission | 1 | ACT3_STEP2 |
| R_A3S3_CHATS | internal | GcRewardMission | 1 | ACT3_STEP3 |
| R_ABAND_BATTERY | hands_over | GcRewardSpecificProductRecipe | 1 | ABAND_BATTERY |
| R_ABAND_MODE | hands_over | GcRewardMultiSpecificProductRecipes | 1 | TUT_ABAND |
| R_ABAND_PURPLE | internal | GcRewardPurpleSystems | 1 | ABAND_DUMMY |
| R_ACT3_APOLLO | internal | GcRewardMission | 1 | ACT3_APOLLO |
| R_ACT3_ARTEMIS | internal | GcRewardMission | 1 | ACT3_ARTEMIS |
| R_ADV_MATS | internal | GcRewardMission | 1 | TUT_REPAIR_SHIP |
| R_AF_DAILY_SET | internal | GcRewardModifyStat | 1 | ABAND_DAILY |
| R_AF_WEEKLY_SET | internal | GcRewardModifyStat | 1 | ABAND_WEEKLY |
| R_ALLTUT_TECH | hands_over | GcRewardSpecificProductRecipe GcRewardSpecificTech | 1 | TUT_CATCHUP |
| R_AM_HOUSING | hands_over | GcRewardSpecificProductRecipe | 1 | TUT_NEXT4 |
| R_ANTIM_WATCH | internal | GcRewardMission | 1 | ANTIM_WATCH |
| R_ATLASSUIT | hands_over | GcRewardSpecificTech | 1 | REMEMBRANCE |
| R_BACKUP_MP | internal | GcRewardModifyStat | 2 | NEXUS_DEFAULT NEXUS_ABAND |
| R_BAIT_TEACH | hands_over | GcRewardSpecificProductRecipe | 1 | TEACH_BAIT |
| R_BEACON_BACKUP | hands_over | GcRewardSpecificProductRecipe | 1 | SCIENTIST5 |
| R_BIGGS_BREAK | internal | GcRewardDamageTech | 1 | BIGGS_BUILD |
| R_BIGGS_HYP4 | internal | GcRewardInstallTech | 1 | BIGGS_BUILD |
| R_BINOCS_HELP | internal | GcRewardMission | 1 | BINOCS_HELP |
| R_BIOCOMP1_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP1_SAFETY |
| R_BIOCOMP2_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP2_SAFETY |
| R_BIOCOMP3_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP3_SAFETY |
| R_BIOCOMP4_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP4_SAFETY |
| R_BIOCOMP50_SAF | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP50_SAFE |
| R_BIOCOMP51_SAF | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP51_SAFE |
| R_BIOCOMP52_SAF | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP52_SAFE |
| R_BIOCOMP5_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOCOMP5_SAFETY |
| R_BIOEGG5_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOEGG5_SAFETY |
| R_BIOFRIG_LEAVE | internal | GcRewardEndFrigateFlyby | 1 | BIO_FRIG |
| R_BIOGROW1_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOGROW1_SAFETY |
| R_BIOGROW2_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOGROW2_SAFETY |
| R_BIOGROW3_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOGROW3_SAFETY |
| R_BIOGROW4_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOGROW4_SAFETY |
| R_BIOSHIP1_EGG | internal | GcRewardExchangeProduct | 1 | BIO_SHIP1 |
| R_BIOSHIP1_GROW | internal | GcRewardExchangeProduct | 1 | BIO_SHIP1 |
| R_BIOSHIP2_COMP | hands_over | GcRewardSpecificProductRecipe | 1 | BIO_SHIP2 |
| R_BIOSHIP2_EGG | internal | GcRewardExchangeProduct | 1 | BIO_SHIP2 |
| R_BIOSHIP2_GROW | internal | GcRewardExchangeProduct | 1 | BIO_SHIP2 |
| R_BIOSHIP3_EGG | internal | GcRewardExchangeProduct | 1 | BIO_SHIP3 |
| R_BIOSHIP3_GROW | internal | GcRewardExchangeProduct | 1 | BIO_SHIP3 |
| R_BIOSHIP4_COMP | hands_over | GcRewardSpecificProductRecipe | 1 | BIO_SHIP4 |
| R_BIOSHIP4_EGG | internal | GcRewardExchangeProduct | 1 | BIO_SHIP4 |
| R_BIOSHIP4_GROW | internal | GcRewardExchangeProduct | 1 | BIO_SHIP4 |
| R_BIOSHIP5_EGG | internal | GcRewardExchangeProduct | 1 | BIO_SHIP5 |
| R_BIOSTEM1_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOSTEM1_SAFETY |
| R_BIOSTEM2_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOSTEM2_SAFETY |
| R_BIOSTEM3_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOSTEM3_SAFETY |
| R_BIOSTEM4_SAFE | hands_over | GcRewardSpecificProduct | 1 | BIOSTEM4_SAFETY |
| R_BOOST_FIX | hands_over | GcRewardSpecificTech | 1 | BOOST_FIX |
| R_BOUNTY_STAT | internal | GcRewardModifyStat | 4 | BOUNTY_NEW1 BOUNTY_NEW2 BOUNTY_NEW3 PIRATE_RIVALS |
| R_BPA_CATCHUP | hands_over | GcRewardSpecificProductRecipe | 1 | BPA_CATCHUP |
| R_BUILDERSKNOWN | internal | GcRewardBuildersKnown | 1 | ROBOMISS_2 |
| R_BUILD_MULTI_1 | internal | GcRewardSetMissionStat | 1 | BUILD_MULTI |
| R_BUILD_MULTI_2 | internal | GcRewardSetMissionStat | 1 | BUILD_MULTI |
| R_BUILD_MULTI_3 | internal | GcRewardSetMissionStat | 1 | BUILD_MULTI |
| R_BUILD_MULTI_4 | internal | GcRewardSetMissionStat | 1 | BUILD_MULTI |
| R_BUILD_MULTI_5 | internal | GcRewardSetMissionStat | 1 | BUILD_MULTI |
| R_BUI_WORDS | hands_over | GcRewardTeachWord | 12 | PP_BUI_KILL PP_BUI_KILL_C PP_BUI_SHARD PP_BUI_RUST PP_BUI_CRAFTING PP_BUI_LOCAL |
| R_CACHEFIX | hands_over | GcRewardSpecificProductRecipe | 1 | CACHE_FIX |
| R_CATCHUP | internal | GcRewardMissionMessage GcRewardSpecificProductRecipe | 1 | TUT_BASEBUILD |
| R_CATCH_ACID | hands_over | GcRewardSpecificProductRecipe | 1 | SCI_CATCHUP3 |
| R_CATCH_BIO | hands_over | GcRewardSpecificProductRecipe | 1 | NEWPROD_UPGRADE |
| R_CATCH_COMP | hands_over | GcRewardSpecificProductRecipe | 1 | NEWPROD_UPGRADE |
| R_CATCH_HYD | hands_over | GcRewardSpecificProductRecipe | 1 | NEWPROD_UPGRADE |
| R_CATCH_LUBE | hands_over | GcRewardSpecificProductRecipe | 1 | SCI_CATCHUP3 |
| R_CATCH_MAG | hands_over | GcRewardSpecificProductRecipe | 1 | NEWPROD_UPGRADE |
| R_CATCH_MIR | hands_over | GcRewardSpecificProductRecipe | 1 | NEWPROD_UPGRADE |
| R_CHALL_INV | hands_over | GcRewardSpecificProduct | 1 | PB_CHALL_INVITE |
| R_CHAMP_INV | hands_over | GcRewardSpecificProduct | 1 | PB_CHALL_INVITE |
| R_CLEAR_WANTED | internal | GcRewardWantedLevel | 2 | FLEET_EXPLORE9 FLEET_MINING2 |
| R_COMM_06_PHOTO | internal | GcRewardModifyStat | 1 | W_COMM_NP06 |
| R_COMM_EXPED105 | internal | GcRewardCommunityContribution | 1 | COMM_EXPED_105 |
| R_COMM_EXPED109 | internal | GcRewardCommunityContribution | 1 | COMM_EXPED_109 |
| R_COMM_NEXUS | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_WRAP |
| R_COMM_NEXUS100 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_100 |
| R_COMM_NEXUS101 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_101 |
| R_COMM_NEXUS102 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_102 |
| R_COMM_NEXUS103 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_103 |
| R_COMM_NEXUS104 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_104 |
| R_COMM_NEXUS106 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_106 |
| R_COMM_NEXUS108 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_108 |
| R_COMM_NEXUS110 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_110 |
| R_COMM_NEXUS111 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_111 |
| R_COMM_NEXUS112 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_112 |
| R_COMM_NEXUS113 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_113 |
| R_COMM_NEXUS115 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_115 |
| R_COMM_NEXUS116 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_116 |
| R_COMM_NEXUS117 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_117 |
| R_COMM_NEXUS118 | internal | GcRewardCommunityContribution | 1 | COMM_NEXUS_118 |
| R_COMM_NP01 | internal | GcRewardMission | 1 | W_COMM_NP01 |
| R_COMM_NP01_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP01 |
| R_COMM_NP01_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP01 |
| R_COMM_NP02 | internal | GcRewardMission | 1 | W_COMM_NP02 |
| R_CRE_ROBOTSTAT | internal | GcRewardSetMissionStat | 1 | CRE_ROBOT |
| R_CRE_STRIDERGL | internal | GcRewardSetMissionStat | 1 | CRE_STRIDERGLOW |
| R_CRUISE_PROG | internal | GcRewardIncrementStat | 1 | CRUISE |
| R_CV_HIGH | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificProductFromList GcRewardSpecificSubstance | 4 | CV_FEED_CRE CV_DEPOT_RAID_M CV_HIVES_M CV_PROC_PRODS_M |
| R_CV_LOW | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | CV_DER_FREIGHT |
| R_CV_MED | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 10 | CV_PLANTKILL CV_KILL_ROBOTS CV_GO_FISH CV_KILL_CRE CV_COLLECT CV_HARVEST |
| R_CV_MEGA | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificProductFromList GcRewardSpecificSubstance | 1 | CV_KILL_FIENDS |
| R_CV_MINIPORT | hands_over | GcRewardSpecificProductRecipe | 1 | MINIPORTAL_CV |
| R_DEL_CHIT1 | hands_over | GcRewardSpecificProduct | 1 | DELIVER |
| R_DEL_CHIT2 | hands_over | GcRewardSpecificProduct | 1 | DELIVER_HARD |
| R_DEPOT_WANTED | internal | GcRewardWantedLevel | 1 | DEPOT_RAID_HARD |
| R_DM_COMM_BRIEF | internal | GcRewardScanEvent | 1 | WM_COMM_OS_ON |
| R_DM_NEXUSDATA | internal | GcRewardMission | 1 | DM_NEXUSDATA |
| R_DM_NEXUSMILES | internal | GcRewardMission | 1 | DM_NEXUSMILES |
| R_DM_NEXUS_PB | internal | GcRewardMission | 1 | DM_NEXUS_PB |
| R_DM_SCIENCE | internal | GcRewardMission | 1 | DM_SCIENCE |
| R_DRONE_B_SAFE | hands_over | GcRewardSpecificProduct | 1 | DRONE_B_SAFETY |
| R_DRONE_E2_SAFE | hands_over | GcRewardSpecificProduct | 1 | DRONE_E2_SAFETY |
| R_DRONE_E3_SAFE | hands_over | GcRewardSpecificProduct | 1 | DRONE_E3_SAFETY |
| R_DRONE_P_SAFE | hands_over | GcRewardSpecificProduct | 1 | DRONE_P_SAFETY |
| R_D_EXOTUT_DONE | internal | GcRewardMissionMessage | 1 | D_EXOTUT |
| R_ECHOES | internal | GcRewardBuildersKnown GcRewardSetMissionStat | 1 | ECHOES |
| R_EGG5_HELP | hands_over | GcRewardSpecificProduct | 1 | EGG5_RECOVERY |
| R_EGG_CONTROL | internal | GcRewardMission | 1 | EGG_CONTROL |
| R_ENABLENEXUS | internal | GcRewardNexus | 5 | NEXUS1 ENABLE_NEXUS SEASON_SETUP_S7 S16_PORTALPARTY STORY_RESTART |
| R_ENDCOMMS | internal | GcRewardMissionMessage | 1 | TUT_NEXT1 |
| R_EXOTIC1 | internal | GcRewardMission | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_EXOTIC2 | internal | GcRewardMission | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_EXOTIC3 | internal | GcRewardMission | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_EXOTIC4 | internal | GcRewardMission | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_EXOTIC5 | internal | GcRewardMission | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_FARM_NIP | hands_over | GcRewardSpecificProductRecipe | 1 | D_FARMER |
| R_FIEND2_END | internal | GcRewardDeactivateFiends | 1 | MP_FIEND_HUNT2 |
| R_FIRST_WALK | internal | GcRewardMission | 1 | TUT_NEXT1 |
| R_FISHBAIT_AUTO | hands_over | GcRewardMultiSpecificProductRecipes | 1 | FISHBAIT_AUTO |
| R_FIX_CIRCUIT | hands_over | GcRewardSpecificProductRecipe | 1 | CIRCUIT_FIX |
| R_FIX_DIVE_HAT | hands_over | GcRewardSpecificSpecial | 1 | FIX_DIVE_HAT |
| R_FIX_S2TRACKER | internal | GcRewardUnlockSeasonReward | 1 | FIX_S2_TRACKER |
| R_FLEET_EXPLORE | internal | GcRewardWantedLevel | 1 | FLEET_EXPLORE9 |
| R_FLEET_MINING2 | internal | GcRewardWantedLevel | 1 | FLEET_MINING2 |
| R_FORCEMELTDOWN | internal | GcRewardCompleteMission GcRewardForceMeltdownAtCurrentPOI | 1 | HULK_CHRT_TUT |
| R_FREIGHT_SCAN | internal | GcRewardScanEvent | 1 | ACT2_STEP8 |
| R_FRE_WARP_FIX1 | hands_over | GcRewardSpecificTech | 1 | FRE_WARP_FIX |
| R_FRE_WARP_FIX2 | internal | GcRewardInstallTech | 1 | FRE_WARP_FIX |
| R_FRIGFUEL_FIX | hands_over | GcRewardMultiSpecificProductRecipes GcRewardSpecificProduct | 1 | FRIGFUEL_FIX |
| R_FRIGFUEL_FIX2 | hands_over | GcRewardMultiSpecificProductRecipes | 1 | FRIGFUEL_FIX_2 |
| R_FRIGTERMFIX | hands_over | GcRewardSpecificProductRecipe | 1 | CACHE_FIX |
| R_FRIG_FUEL | hands_over | GcRewardMultiSpecificProductRecipes GcRewardSpecificProduct | 1 | FLEET_TUT |
| R_GDEL_CHIT2 | hands_over | GcRewardSpecificProduct | 1 | G_DEL_HARD |
| R_GLASS_FIX | hands_over | GcRewardSpecificProductRecipe | 1 | GLASS_FIX |
| R_GOT_BYTEBEAT | internal | GcRewardSetMissionStat | 1 | GOT_BYTEBEAT |
| R_HAZ_DUMMY | internal | GcRewardMission | 1 | TUT_NEXT1 |
| R_INB_STAT_ACT | internal | GcRewardIncrementStat GcRewardSetCurrentMission | 1 | BUILD_BASE_INFE |
| R_JUDGE_EXTRA1 | internal | GcRewardSettlementJudgement | 1 | SETTLE_TUT_JUDG |
| R_JUDGE_EXTRA2 | internal | GcRewardSettlementJudgement | 1 | SETTLE_TUT_JUDG |
| R_LAUNCH_DAM | internal | GcRewardDisplayTechWindow | 1 | TUT_REPAIR_SHIP |
| R_LEARNDOOR | hands_over | GcRewardSpecificProductRecipe | 1 | ACT1_STEP9 |
| R_LGLASS_CATCH | hands_over | GcRewardSpecificProductRecipe | 1 | SCI_CATCHUP |
| R_LORE01_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_01 |
| R_LORE02_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_02 |
| R_LORE03_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_03 |
| R_LORE04_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_04 |
| R_LORE05_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_05 |
| R_LORE06_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_06 |
| R_LORE07_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_07 |
| R_LORE08_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_08 |
| R_LORE09_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_09 |
| R_LORE10_MSG | internal | GcRewardMissionMessage | 1 | U4LORE_10 |
| R_MB_HIGH | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 21 | G_COLLECT2 G_SCAN_CRE G_FACT_RAID_MED SCAN_CRE KILL_ROBOT_MED KILL_PREDATORS |
| R_MB_LOW | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 14 | BOUNTY_NEW1 BOUNTY_NEW2 BOUNTY_NEW3 SCAN_MIN DELIVER FACTORY_RAID |
| R_MB_MED | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 40 | G_DEL_HARD G_PHOTO_BIOME G_PHOTO_CRE PP_BUI_KILL PP_BUI_KILL_C PP_BUI_SHARD |
| R_MB_MEGA | hands_over | GcRewardMoney GcRewardSpecificProduct GcRewardSpecificSubstance | 17 | G_COLLECT3 G_KILL_ROBOT G_REPAIR_2 KILL_ROBOT_HARD COLLECT3 FACT_RAID_HARD |
| R_MELT_DUMMY | internal | GcRewardCompleteMission | 1 | HULK_CHRT_TUT |
| R_MIRROR_PLAN | hands_over | GcRewardSpecificProductRecipe | 1 | WATERSTORY3 |
| R_MPDIS_GASSTAT | internal | GcRewardModifyStat | 1 | MPDIS_SURVEYGAS |
| R_MPDIS_MINSTAT | internal | GcRewardModifyStat | 1 | MPDIS_SURVEYMIN |
| R_MPDIS_POWSTAT | internal | GcRewardModifyStat | 1 | MPDIS_SURVEYPOW |
| R_MPREP_AERIAL | internal | GcRewardScan | 3 | MPREP_ANALYSE_1 MPREP_ANALYSE_2 MPREP_ANALYSE_3 |
| R_MPREP_PART1B | hands_over | GcRewardSpecificProduct | 1 | MPREP_ANALYSE_1 |
| R_MPREP_PART2B | hands_over | GcRewardSpecificProduct | 1 | MPREP_ANALYSE_2 |
| R_MPREP_PART3B | hands_over | GcRewardSpecificProduct | 1 | MPREP_ANALYSE_3 |
| R_MP_DIG_WANTED | internal | GcRewardWantedLevel | 1 | MP_DIGSITE |
| R_MP_DIS_BOOST | internal | GcRewardMissionSeeded | 1 | MP_DISCOVER |
| R_MP_DIS_EVENT | internal | GcRewardScanEvent | 1 | MP_DISCOVER |
| R_MP_DIS_GAS | internal | GcRewardMissionMessageToMatchingSeeds | 1 | MP_DISCOVER |
| R_MP_DIS_LISTEN | internal | GcRewardMissionSeeded | 1 | MP_DISCOVER |
| R_MP_DIS_MIN | internal | GcRewardMissionMessageToMatchingSeeds | 1 | MP_DISCOVER |
| R_MP_DIS_POW | internal | GcRewardMissionMessageToMatchingSeeds | 1 | MP_DISCOVER |
| R_MP_DIS_RESET | internal | GcRewardModifyStat | 1 | MP_DISCOVER |
| R_MP_DIS_SURVEY | internal | GcRewardRequirementsForRecipe | 1 | MP_DISCOVER |
| R_MP_EVENT_1 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_1 |
| R_MP_EVENT_10 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_10 |
| R_MP_EVENT_11 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_11 |
| R_MP_EVENT_12 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_12 |
| R_MP_EVENT_13 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_13 |
| R_MP_EVENT_14 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_14 |
| R_MP_EVENT_15 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_15 |
| R_MP_EVENT_16 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_16 |
| R_MP_EVENT_17 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_17 |
| R_MP_EVENT_18 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_18 |
| R_MP_EVENT_19 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_19 |
| R_MP_EVENT_2 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_2 |
| R_MP_EVENT_20 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_20 |
| R_MP_EVENT_21 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_21 |
| R_MP_EVENT_22 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_22 |
| R_MP_EVENT_23 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_23 |
| R_MP_EVENT_24 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_24 |
| R_MP_EVENT_25 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_25 |
| R_MP_EVENT_26 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_26 |
| R_MP_EVENT_27 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_27 |
| R_MP_EVENT_28 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_28 |
| R_MP_EVENT_29 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_29 |
| R_MP_EVENT_3 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_3 |
| R_MP_EVENT_30 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_30 |
| R_MP_EVENT_31 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_31 |
| R_MP_EVENT_32 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_32 |
| R_MP_EVENT_33 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_33 |
| R_MP_EVENT_34 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_34 |
| R_MP_EVENT_35 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_35 |
| R_MP_EVENT_36 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_36 |
| R_MP_EVENT_37 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_37 |
| R_MP_EVENT_38 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_38 |
| R_MP_EVENT_39 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_39 |
| R_MP_EVENT_4 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_4 |
| R_MP_EVENT_40 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_40 |
| R_MP_EVENT_41 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_41 |
| R_MP_EVENT_42 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_42 |
| R_MP_EVENT_43 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_43 |
| R_MP_EVENT_44 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_44 |
| R_MP_EVENT_45 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_45 |
| R_MP_EVENT_5 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_5 |
| R_MP_EVENT_6 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_6 |
| R_MP_EVENT_7 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_7 |
| R_MP_EVENT_8 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_8 |
| R_MP_EVENT_9 | internal | GcRewardModifyStat | 1 | W_COMM_PQ_9 |
| R_MP_EVENT_STAT | internal | GcRewardModifyStat | 1 | MP_PORTALQUEST |
| R_MP_FIEND_END | internal | GcRewardDeactivateFiends | 1 | MP_FIEND_HUNT |
| R_MP_HIVE_RESET | internal | GcRewardEnableSentinels | 2 | CV_HIVES_M MP_HIVE |
| R_MP_MIS_ACCESS | internal | GcRewardModifyStat | 1 | MP_MISSIONS_ON |
| R_MP_MIS_END | internal | GcRewardModifyStat | 28 | MP_CONSTRUCT1 MP_CONSTRUCT2 MP_CONSTRUCT3A MP_CONSTRUCT3B MP_CONSTRUCT4A MP_CONSTRUCT4B |
| R_MP_MIS_START | internal | GcRewardModifyStat | 27 | MP_CONSTRUCT1 MP_CONSTRUCT2 MP_CONSTRUCT3A MP_CONSTRUCT3B MP_CONSTRUCT4A MP_CONSTRUCT4B |
| R_MP_PQA_HAZ3 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ4 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ5 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ6 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ7 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ8 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZ9 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZARD | internal | GcRewardActivateFiends GcRewardMissionMessageSeeded | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_HAZMSG | internal | GcRewardMissionMessageSeeded | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_NPC | internal | GcRewardMissionMessageSeeded GcRewardSendChatMessage | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_PTL_GO | internal | GcRewardAdvancePortalState | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_RESET | internal | GcRewardModifyStat | 1 | MP_PQ_ARCHIVE |
| R_MP_PQA_RMARKE | internal | GcRewardModifyStat | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ1 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ10 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ11 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ12 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ13 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ14 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ15 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ16 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ17 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ18 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ19 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ2 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ20 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ21 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ22 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ23 | internal | GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ24 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ25 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PQ_ARCHIVE |
| R_MP_PQ_HAZ26 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ27 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ28 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ29 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ30 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ31 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ32 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ33 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ34 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ35 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ36 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ37 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ38 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ39 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ40 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ41 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ42 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ43 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ44 | internal | GcRewardActivateEncounterSentinels GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZ45 | internal | GcRewardActivateFiends | 1 | MP_PORTALQUEST |
| R_MP_PQ_HAZARD | internal | GcRewardActivateFiends GcRewardMissionMessageSeeded | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_MP_PQ_HAZMSG | internal | GcRewardMissionMessageSeeded | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_MP_PQ_NPC | internal | GcRewardMissionMessageSeeded GcRewardSendChatMessage | 1 | MP_PORTALQUEST |
| R_MP_PQ_PTL_GO | internal | GcRewardAdvancePortalState | 1 | MP_PORTALQUEST |
| R_MP_PQ_RESET | internal | GcRewardModifyStat | 1 | MP_PORTALQUEST |
| R_MP_PQ_RMARKER | internal | GcRewardModifyStat | 2 | MP_PQ_ARCHIVE MP_PORTALQUEST |
| R_MP_REP1_FLY | internal | GcRewardCrashSiteFly GcRewardMissionMessage GcRewardModifyStat | 1 | MP_REPAIR |
| R_MP_REP1_MISS | internal | GcRewardMissionSeeded | 1 | MP_REPAIR |
| R_MP_REP2_FLY | internal | GcRewardCrashSiteFly GcRewardMissionMessage GcRewardModifyStat | 1 | MP_REPAIR |
| R_MP_REP2_MISS | internal | GcRewardMissionSeeded | 1 | MP_REPAIR |
| R_MP_REP3_FLY | internal | GcRewardCrashSiteFly GcRewardMissionMessage GcRewardModifyStat | 1 | MP_REPAIR |
| R_MP_REP3_MISS | internal | GcRewardMissionSeeded | 1 | MP_REPAIR |
| R_MP_REP_DRONE | internal | GcRewardActivateEncounterSentinels | 1 | MP_REPAIR |
| R_MP_REP_FAIL | internal | GcRewardModifyStat | 3 | MPREP_ANALYSE_1 MPREP_ANALYSE_2 MPREP_ANALYSE_3 |
| R_MP_REP_RESET | internal | GcRewardModifyStat | 1 | MP_REPAIR |
| R_MP_SB_DONE | internal | GcRewardModifyStat | 1 | MPPIRATES_STATS |
| R_MP_SB_WAVE1 | internal | GcRewardModifyStat | 1 | MPPIRATES_STATS |
| R_MP_SB_WAVE2 | internal | GcRewardModifyStat | 1 | MPPIRATES_STATS |
| R_MP_SB_WAVE3 | internal | GcRewardModifyStat | 1 | MPPIRATES_STATS |
| R_NAV_RECOVER | internal | GcRewardMission | 1 | TUT_ADV_MATS |
| R_NEXUS_MED | hands_over | GcRewardSpecificProduct | 27 | MP_CONSTRUCT1 MP_CONSTRUCT2 MP_CONSTRUCT3A MP_CONSTRUCT3B MP_CONSTRUCT4A MP_CONSTRUCT4B |
| R_NP01 | internal | GcRewardMissionMessage | 1 | W_COMM_NP01 |
| R_NP01_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP01 |
| R_NP01_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP01 |
| R_NP02 | internal | GcRewardMissionMessage | 1 | W_COMM_NP02 |
| R_NP02_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP02 |
| R_NP02_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP02 |
| R_NP02_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP02 |
| R_NP02_OVERCAP | internal | GcRewardModifyStat | 1 | W_COMM_NP02 |
| R_NP02_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP02 |
| R_NP02_STATBANK | internal | GcRewardModifyStat | 1 | W_COMM_NP02 |
| R_NP02_STATREST | internal | GcRewardModifyStat | 1 | W_COMM_NP02 |
| R_NP02_STATSYNC | internal | GcRewardStatCompareAndSet | 1 | W_COMM_NP02 |
| R_NP03 | internal | GcRewardMissionMessage | 1 | W_COMM_NP03 |
| R_NP03_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP03 |
| R_NP03_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP03 |
| R_NP03_CREATIVE | hands_over | GcRewardMoney | 1 | W_COMM_NP03 |
| R_NP03_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP03 |
| R_NP03_OVERCAP | internal | GcRewardModifyStat | 1 | W_COMM_NP03 |
| R_NP03_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP03 |
| R_NP03_STATSYNC | internal | GcRewardStatCompareAndSet | 1 | W_COMM_NP03 |
| R_NP03_WANTED0 | internal | GcRewardWantedLevel | 1 | W_COMM_NP03 |
| R_NP03_WANTED3 | internal | GcRewardWantedLevel | 1 | W_COMM_NP03 |
| R_NP04 | internal | GcRewardMissionMessage | 1 | W_COMM_NP04 |
| R_NP04_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP04 |
| R_NP04_2ND | internal | GcRewardMissionMessage | 1 | W_COMM_NP04 |
| R_NP04_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP04 |
| R_NP04_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP04 |
| R_NP04_RESETLVL | internal | GcRewardModifyStat | 1 | W_COMM_NP04 |
| R_NP05 | internal | GcRewardMissionMessage | 1 | W_COMM_NP05 |
| R_NP05_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP05 |
| R_NP05_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP05 |
| R_NP05_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP05 |
| R_NP05_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP05 |
| R_NP05_WANTED0 | internal | GcRewardWantedLevel | 1 | W_COMM_NP05 |
| R_NP05_WANTED5 | internal | GcRewardWantedLevel | 1 | W_COMM_NP05 |
| R_NP06 | internal | GcRewardMissionMessage | 1 | W_COMM_NP06 |
| R_NP06_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP06 |
| R_NP06_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP06 |
| R_NP06_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP06 |
| R_NP06_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP06 |
| R_NP07 | internal | GcRewardMissionMessage | 1 | W_COMM_NP07 |
| R_NP07_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP07 |
| R_NP07_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP07 |
| R_NP07_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP07 |
| R_NP07_PHOTOINC | internal | GcRewardModifyStat | 1 | W_COMM_NP07 |
| R_NP07_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP07 |
| R_NP08 | internal | GcRewardMissionMessage | 1 | W_COMM_NP08 |
| R_NP08_1ST | internal | GcRewardMissionMessage | 1 | W_COMM_NP08 |
| R_NP08_CAP | internal | GcRewardMissionMessage | 1 | W_COMM_NP08 |
| R_NP08_NEWPTL | internal | GcRewardMissionMessage | 1 | W_COMM_NP08 |
| R_NP08_OVERCAP | internal | GcRewardModifyStat | 1 | W_COMM_NP08 |
| R_NP08_RESET | internal | GcRewardModifyStat | 1 | W_COMM_NP08 |
| R_NP08_STATBANK | internal | GcRewardModifyStat | 1 | W_COMM_NP08 |
| R_NP08_STATREST | internal | GcRewardModifyStat | 1 | W_COMM_NP08 |
| R_NP08_STATSYNC | internal | GcRewardStatCompareAndSet | 1 | W_COMM_NP08 |
| R_NP08_SYNCALL | internal | GcRewardStatCompareAndSet | 1 | W_COMM_NP08 |
| R_NP09A2_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09A2 |
| R_NP09A_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09A |
| R_NP09B2_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09B2 |
| R_NP09B_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09B |
| R_NP09C2_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09C2 |
| R_NP09C_END | internal | GcRewardMissionMessage | 1 | D_COMM_NP09C |
| R_NP09_DAYINIT | internal | GcRewardModifyStat | 1 | W_COMM_NP09 |
| R_NP09_EVEN | internal | GcRewardMissionMessage GcRewardModifyStat | 1 | DM_COMM_NP09 |
| R_NP09_HANDIN | internal | GcRewardCommunityContribution GcRewardMoney | 1 | W_COMM_NP09 |
| R_NP09_NDECLINE | internal | GcRewardModifyStat | 1 | W_COMM_NP09 |
| R_NP09_ODD | internal | GcRewardMissionMessage GcRewardModifyStat | 1 | DM_COMM_NP09 |
| R_NP09_START | internal | GcRewardModifyStat | 1 | DM_COMM_NP09 |
| R_OVERSEER1 | internal | GcRewardMission | 1 | OVERSEER1 |
| R_P2_STATE1 | internal | GcRewardSetMissionStat | 1 | PIRATES2 |
| R_P2_STATE2 | internal | GcRewardSetMissionStat | 1 | PIRATES2 |
| R_P2_STATE3 | internal | GcRewardSetMissionStat | 1 | PIRATES2 |
| R_P2_STATE4 | internal | GcRewardSetMissionStat | 1 | PIRATES2 |
| R_PICK_POI_AB1 | internal | GcRewardScanEvent | 1 | SO_COLLECT_AB1 |
| R_PICK_POI_AB2 | internal | GcRewardScanEvent | 1 | SO_COLLECT_AB2 |
| R_PIONEERS_END | internal | GcRewardEndFrigateFlyby | 1 | PIONEERS |
| R_PIRATEBOARD_A | hands_over | GcRewardSpecificProduct GcRewardSpecificProductFromList GcRewardSpecificSubstance | 4 | PIRATE_RIVALS PIRATE_FREIGHT PIRATE_TRADERS PIRATE_SMUGGLE |
| R_PIRATEBOARD_B | hands_over | GcRewardMoney GcRewardSpecificProduct | 4 | PIRATE_RIVALS PIRATE_FREIGHT PIRATE_TRADERS PIRATE_SMUGGLE |
| R_PIRATE_MAP0 | hands_over | GcRewardSpecificProduct GcRewardSpecificProductRecipe | 1 | S6_FREI_FIX |
| R_PIRATE_MAP2 | hands_over | GcRewardSpecificProduct GcRewardSpecificProductRecipe | 1 | PIRATE_MAP2 |
| R_PIRATE_MAPW | hands_over | GcRewardSpecificProductRecipe | 1 | PIRATE_MAP2 |
| R_PIRATE_NEWMAP | hands_over | GcRewardSpecificProduct | 1 | PIRATE_PORTAL |
| R_PIRATE_SMUGGL | hands_over | GcRewardSpecificProduct | 1 | PIRATE_SMUGGLE |
| R_POLICE_W_OFF | internal | GcRewardWantedLevel | 1 | POLICE_KILL |
| R_POLICE_W_ON | internal | GcRewardWantedLevel | 1 | POLICE_KILL |
| R_POST_DELIVERY | internal | GcRewardScanEvent | 1 | SO_POSTMAN |
| R_PURPM1_RESET | internal | GcRewardSetMissionStat | 1 | POI_PURPM_BOAT |
| R_PURPM3_GASKEY | internal | GcRewardForgetSpecificProductRecipe GcRewardSpecificProductRecipe | 1 | PURPM3_GKEY_FIX |
| R_PURPM3_LUSKEY | internal | GcRewardForgetSpecificProductRecipe GcRewardSpecificProductRecipe | 1 | PURPM3_LKEY_FIX |
| R_PURPM3_SAFETY | internal | GcRewardStationTeleportEndpoint | 1 | PURPM3 |
| R_PURPM3_WATKEY | internal | GcRewardForgetSpecificProductRecipe GcRewardSpecificProductRecipe | 1 | PURPM3_WKEY_FIX |
| R_PURPM_EPOINT | internal | GcRewardStationTeleportEndpoint | 1 | PURPM2 |
| R_PURPM_PACKET | hands_over | GcRewardSpecificProductRecipe | 1 | PURPM1 |
| R_P_FREI_GUARDS | internal | GcRewardTraderFlyby | 1 | PIRATE_FREIGHT |
| R_P_HOOD | hands_over | GcRewardSpecificSpecial | 1 | PIRATES2 |
| R_P_TRADE_FLYBY | internal | GcRewardFrigateFlyby GcRewardTraderFlyby | 1 | PIRATE_TRADERS |
| R_P_TRADE_LOOT | hands_over | GcRewardSpecificProduct | 1 | PIRATE_TRADERS |
| R_QS_REWARDS_UP | internal | GcRewardModifyStat | 1 | DM_QS_REWARDS |
| R_RANDOM_GUN | internal | GcRewardInstallTech | 1 | SEASON_SETUP |
| R_RANDOM_SHIP | internal | GcRewardInstallTech | 1 | SEASON_SETUP |
| R_RANDOM_TECH1 | internal | GcRewardInstallTech | 1 | SEASON_SETUP |
| R_RANDOM_TECH2 | internal | GcRewardInstallTech | 1 | SEASON_SETUP |
| R_RANDOM_TRAIL | internal | GcRewardInstallTech | 2 | SEASON_SETUP SEASON_SETUP2 |
| R_REPAIRSEQ | internal | GcRewardMission | 1 | TUT_NEXT1 |
| R_RESET_SURGE | internal | GcRewardModifyStat | 1 | TRADE_SURGE |
| R_REVEAL_ALL_BH | internal | GcRewardShowBlackHoles | 1 | AUTO_REVEAL_BH |
| R_ROBOT_INTRO | hands_over | GcRewardSpecificSpecial | 1 | ROBOT_INTRO |
| R_ROGUE_COMM_EV | internal | GcRewardModifyStat | 1 | ROGUE_COMM_INTR |
| R_S12NEXUS_1 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12NEXUS_2 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12NEXUS_3 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12NEXUS_4 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12NEXUS_5 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12NEXUS_6 | internal | GcRewardSetMissionStat | 1 | S12_NEXUS |
| R_S12RES_STAT | internal | GcRewardSetMissionStat | 1 | S12_RESEARCH |
| R_S12_FLYBY | internal | GcRewardFrigateFlyby | 1 | S12_FLYBY |
| R_S13_SIG_RECOV | hands_over | GcRewardSpecificProductRecipe | 1 | S13_SIG_RECOVER |
| R_S14_BUGHUNT | internal | GcRewardActivateFiends | 1 | S14_BUGHUNT |
| R_S16_PRTLJCE_R | hands_over | GcRewardSpecificProductRecipe | 1 | S16_MSG_JUICE |
| R_S16_REFRESH | internal | GcRewardRefreshHazProt | 2 | S16_PORTALPARTY S16_JELLYBOSS |
| R_S16_RESTART | internal | GcRewardReinitialise | 1 | S16_PORTALPARTY |
| R_S16_SPOOKJC_R | hands_over | GcRewardSpecificProductRecipe | 1 | S16_GOTO_ABAND |
| R_S17_TM_FIX | hands_over | GcRewardSpecificTech | 1 | S17_TM_RECOVER |
| R_S17_WARP_FIX | hands_over | GcRewardSpecificTech | 1 | S17_HYP_RECOVER |
| R_S18_WARP_FIX | hands_over | GcRewardSpecificTech | 1 | S18_HYP_RECOVER |
| R_S19_ENDPOINT | internal | GcRewardStationTeleportEndpoint | 1 | S19_BASE_TELE |
| R_S20_FIXUP | hands_over | GcRewardMultiSpecificProductRecipes | 1 | S20_FIXUP |
| R_S21_FINISH | internal | GcRewardNexus GcRewardRepairWholeInventory | 1 | S21_UNFINISHED |
| R_S21_FIX_FUEL | internal | GcRewardRechargeTech | 1 | S21_FIX_FUEL |
| R_S21_PARTY1 | internal | GcRewardSetMissionStat | 1 | S21_PARTY1 |
| R_S21_PARTY2 | internal | GcRewardSetMissionStat | 1 | S21_PARTY2 |
| R_S21_PARTY3 | internal | GcRewardSetMissionStat | 1 | S21_PARTY3 |
| R_S21_PARTY4 | internal | GcRewardSetMissionStat | 1 | S21_PARTY4 |
| R_S21_PARTY5 | internal | GcRewardSetMissionStat | 1 | S21_PARTY5 |
| R_S22_CLEAN | internal | GcRewardCommunityContribution GcRewardIncrementStat | 2 | SWARM_DIG SWARM_SUPPLY_S |
| R_S22_COMBAT | internal | GcRewardCommunityContribution GcRewardIncrementStat | 2 | SWARM_KILL_GR SWARM_KILL |
| R_S22_FIX_SHIP | internal | GcRewardRepairTech | 1 | S22_FIX_SHIP |
| R_S22_INTEL | internal | GcRewardCommunityContribution GcRewardIncrementStat | 2 | SWARM_HACK SWARM_REPAIR |
| R_S22_NEXUS | internal | GcRewardNexus | 1 | S22_REPORT1 |
| R_S22_PARTY | internal | GcRewardSetMissionStat | 1 | S22_PARTY |
| R_S22_PORTAL | internal | GcRewardTeleport | 1 | S22_GLASS |
| R_S22_REBOOT | internal | GcRewardReinitialise | 1 | S22_GLASS |
| R_S22_TIMEWARP | internal | GcRewardTimeWarp | 1 | S22_GLASS |
| R_S23_BEACON_J | internal | GcRewardSettlementCustomJudgement | 1 | BEACON |
| R_S23_BH | internal | GcRewardShowBlackHoles | 1 | FUTURE |
| R_S23_FRIGFLY_1 | internal | GcRewardFrigateFlyby | 1 | LEVIATHAN |
| R_S2_FRE_ITEMS | internal | GcRewardInstallTech GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | SEASON_SETUP2 |
| R_S2_MYSTERY4 | internal | GcRewardFrigateFlyby | 2 | PIONEERS S2_MYSTERY4 |
| R_S3_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory GcRewardUpgradeShipClass | 1 | SEASON_SETUP3 |
| R_S3_MECHFIX | hands_over | GcRewardSpecificProductRecipe | 1 | S3_MECH_FIX |
| R_S4_FIX | internal | GcRewardRefreshHazProt GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S4 |
| R_S4_GUNTECH | internal | GcRewardInstallTech | 1 | SEASON_SETUP_S4 |
| R_S4_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S4 |
| R_S4_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP_S4 |
| R_S4_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S4 |
| R_S4_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S4 |
| R_S4_SHIPTECH | internal | GcRewardInstallTech | 1 | SEASON_SETUP_S4 |
| R_S4_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP_S4 |
| R_S4_TECH_A | internal | GcRewardInstallTech | 1 | SEASON_SETUP_S4 |
| R_S4_TECH_B | internal | GcRewardInstallTech | 1 | SEASON_SETUP_S4 |
| R_S5_FIX | internal | GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S5 |
| R_S5_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory GcRewardUpgradeShipClass | 1 | SEASON_SETUP_S5 |
| R_S5_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP_S5 |
| R_S5_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S5 |
| R_S5_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S5 |
| R_S5_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP_S5 |
| R_S6_DAMAGE | internal | GcRewardDamageTech | 1 | SEASON_SETUP_S6 |
| R_S6_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S6 |
| R_S6_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP_S6 |
| R_S6_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S6 |
| R_S6_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S6 |
| R_S6_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP_S6 |
| R_S7_CHARGE | internal | GcRewardRefreshHazProt | 1 | SEASON_SETUP_S7 |
| R_S7_FRIGFLY_1 | internal | GcRewardFrigateFlyby | 1 | ROGUE_FRIG |
| R_S7_LAUNCH_REP | hands_over | GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | SEASON_SETUP_S7 |
| R_S7_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S7 |
| R_S7_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S7 |
| R_S7_SHIP | internal | GcRewardDamageTech GcRewardInstallTech GcRewardUpgradeShipClass | 1 | SEASON_SETUP_S7 |
| R_S7_SUIT | internal | GcRewardMultiSpecificItems GcRewardRechargeTech | 1 | SEASON_SETUP_S7 |
| R_S7_WEAPON | internal | GcRewardDamageTech GcRewardInstallTech GcRewardMultiSpecificTechRecipes GcRewardRepairWholeInventory GcRewardUpgradeWeaponClass | 1 | SEASON_SETUP_S7 |
| R_S8_FRE_ITEMS | hands_over | GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | SEASON_SETUP_S8 |
| R_S8_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S8 |
| R_S8_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP_S8 |
| R_S8_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S8 |
| R_S8_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S8 |
| R_S8_TECHS | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP_S8 |
| R_S9_FIEND_DONE | internal | GcRewardDeactivateFiends | 1 | S9_MYSTERY |
| R_S9_INSTALL | internal | GcRewardInstallTech GcRewardRepairWholeInventory | 1 | SEASON_SETUP_S9 |
| R_S9_ITEMS | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP_S9 |
| R_S9_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP_S9 |
| R_S9_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP_S9 |
| R_S9_TECHS | internal | GcRewardForgetSpecificTechRecipe GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP_S9 |
| R_SALVAGE_WIKI | internal | GcRewardWikiTopic | 1 | SALVAGE_WIKI |
| R_SCANOVERRIDE1 | internal | GcRewardMission | 1 | ACT1_STEP5 |
| R_SCANOVERRIDE2 | internal | GcRewardMission | 1 | ACT1_STEP5 |
| R_SCANOVERRIDE3 | internal | GcRewardMission | 1 | ACT1_STEP5 |
| R_SCANWATCH | internal | GcRewardMission | 1 | TUT_NEXT1D |
| R_SEASON2_BASIC | internal | GcRewardInstallTech | 1 | SEASON_SETUP2 |
| R_SEASON2_FIX | internal | GcRewardRepairWholeInventory | 1 | SEASON_SETUP2 |
| R_SEASON2_GUN | internal | GcRewardInstallTech | 1 | SEASON_SETUP2 |
| R_SEASON2_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP2 |
| R_SEASON2_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP2 |
| R_SEASON2_SHIP | internal | GcRewardInstallTech | 1 | SEASON_SETUP2 |
| R_SEASON2_STUFF | internal | GcRewardInstallTech GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | SEASON_SETUP2 |
| R_SEASON2_TECH | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP2 |
| R_SEASON2_TECH1 | internal | GcRewardInstallTech | 1 | SEASON_SETUP2 |
| R_SEASON2_TECH2 | internal | GcRewardInstallTech | 1 | SEASON_SETUP2 |
| R_SEASON_INSTAL | internal | GcRewardInstallTech | 1 | SEASON_SETUP |
| R_SEASON_ITEMS3 | hands_over | GcRewardMultiSpecificItems | 1 | SEASON_SETUP3 |
| R_SEASON_MISS | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP |
| R_SEASON_MISS3 | internal | GcRewardCompleteMultiMission | 1 | SEASON_SETUP3 |
| R_SEASON_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP |
| R_SEASON_PRODS3 | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SEASON_SETUP3 |
| R_SEASON_STUFF | internal | GcRewardHazard GcRewardSpecificProduct GcRewardSpecificSubstance | 1 | SEASON_SETUP |
| R_SEASON_TECH | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP |
| R_SEASON_TECHS3 | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SEASON_SETUP3 |
| R_SEASON_WIKI | empty |  | 1 | SEASON_SETUP |
| R_SEE_MARKER | internal | GcRewardModifyStat | 1 | TUT_BASEBUILD |
| R_SEE_STATION_2 | internal | GcRewardModifyStat | 1 | SEE_STATION |
| R_SENT1_JUDGE | internal | GcRewardSettlementCustomJudgement | 1 | SENTINELS_1 |
| R_SENT3_JUDGE | internal | GcRewardSettlementCustomJudgement | 1 | SENTINELS_3 |
| R_SENT4_J_LEGS | internal | GcRewardSettlementCustomJudgement | 1 | SENTINELS_4 |
| R_SENT4_J_RARM | internal | GcRewardSettlementCustomJudgement | 1 | SENTINELS_4 |
| R_SENT_NO_ALERT | internal | GcRewardSettlementStat | 1 | SENTINELS_1 |
| R_SENT_OFF_W5 | internal | GcRewardDisableSentinels | 2 | CV_HIVES_M MP_HIVE |
| R_SENT_W_LOOT | hands_over | GcRewardSpecificProduct | 1 | SENTINELS_5 |
| R_SETINFESTBASE | internal | GcRewardIncrementStat | 1 | BUILD_BASE_INFE |
| R_SETMS_DEBRIEF | internal | GcRewardEndSettlementExpedition | 1 | SETTLE_MISS |
| R_SETMS_OVER | internal | GcRewardEndSettlementExpedition | 1 | SETTLE_MISS |
| R_SETTLE_BUI_J | internal | GcRewardMission GcRewardSettlementCustomJudgement | 1 | SETTLE_MGR |
| R_SETTLE_TUT_J | internal | GcRewardSettlementJudgement | 1 | SETTLE_TUT |
| R_SETTLE_TUT_J2 | internal | GcRewardSettlementJudgement | 1 | SETTLE_TUT |
| R_SETTLE_TUT_JM | internal | GcRewardMissionSeeded | 1 | SETTLE_TUT |
| R_SETTL_BUGWIN | internal | GcRewardSettlementStat | 1 | SETTLE_MGR |
| R_SETTL_BUG_ATT | internal | GcRewardActivateFiends | 1 | SETTLE_MGR |
| R_SETTL_SAFE | internal | GcRewardSettlementStat GcRewardWantedLevel | 1 | SETTLE_MGR |
| R_SET_FW_BUGS | internal | GcRewardSettlementParty | 1 | SETTLE_MGR |
| R_SET_FW_CLAIM | internal | GcRewardSettlementParty | 1 | SETTLE_CLAIM |
| R_SET_FW_SENT | internal | GcRewardSettlementParty | 1 | SETTLE_MGR |
| R_SET_HAZ | internal | GcRewardRefreshHazProt | 1 | TUT_NEXT1 |
| R_SHIPSUMMON | internal | GcRewardMission | 1 | TUT_NEXT3 |
| R_SKIP_FIX | internal | GcRewardHazard GcRewardRepairWholeInventory | 1 | SKIP_TUT |
| R_SKIP_INSTALL | internal | GcRewardInstallTech | 1 | SKIP_TUT |
| R_SKIP_MISS | internal | GcRewardCompleteMultiMission | 1 | SKIP_TUT |
| R_SKIP_PRODS | hands_over | GcRewardMultiSpecificProductRecipes | 1 | SKIP_TUT |
| R_SKIP_TECH | hands_over | GcRewardMultiSpecificTechRecipes | 1 | SKIP_TUT |
| R_SKIP_WIKI | empty |  | 1 | SKIP_TUT |
| R_SOUL_CATCH | hands_over | GcRewardSpecificProductRecipe | 1 | SOUL_CATCH |
| R_STARTLOGS | internal | GcRewardMission | 1 | ACT2_STEP8 |
| R_START_MYSTERY | internal | GcRewardMission | 1 | TUT_BASEBUILD |
| R_STA_18 | hands_over | GcRewardSpecificProductRecipeFromList | 1 | POI_GEK_HEAD |
| R_STORY_TRANS | hands_over | GcRewardSpecificTech | 1 | ACT1_STEP5 |
| R_SWARM_DIG | hands_over | GcRewardSpecificProduct | 1 | SWARM_DIG |
| R_SWARM_HACK | hands_over | GcRewardSpecificProduct | 1 | SWARM_HACK |
| R_SWARM_HAUL | hands_over | GcRewardSpecificProduct | 1 | SWARM_KILL_GR |
| R_SWARM_KILL | hands_over | GcRewardSpecificProduct | 1 | SWARM_KILL |
| R_SWARM_REPAIR | hands_over | GcRewardSpecificProduct | 2 | SWARM_REPAIR SWARM_SUPPLY_S |
| R_SYS_DISCOVER | internal | GcRewardForceDiscoverSystem | 1 | TUT_NEXT1 |
| R_TELE_F | hands_over | GcRewardSpecificProductRecipe | 1 | F_TELE_BP |
| R_TERRAINEDIT | hands_over | GcRewardSpecificTech | 1 | TUT_BASEBUILD |
| R_TE_TUT | internal | GcRewardMission | 1 | TUT_BASEBUILD |
| R_TRAY_FIX | hands_over | GcRewardSpecificProductRecipe | 1 | TRAY_FIX |
| R_TRUCK_BED_SCA | internal | GcRewardInstallTech | 1 | TRUCK_BED |
| R_TRUCK_CARGO_A | internal | GcRewardSetMissionStat | 1 | TRUCK_CARGO |
| R_TRUCK_CARGO_B | internal | GcRewardSetMissionStat | 1 | TRUCK_CARGO |
| R_TUT1A_TECH | internal | GcRewardDisplayTechWindow | 1 | TUT_NEXT1B |
| R_TUT1B_TECH | internal | GcRewardDisplayTechWindow | 1 | TUT_NEXT1A |
| R_TUT1D_TECH | internal | GcRewardDisplayTechWindow | 1 | TUT_NEXT1D |
| R_TUT2 | internal | GcRewardMission | 1 | TUT_NEXT2 |
| R_TUT3 | internal | GcRewardMission | 1 | TUT_NEXT3 |
| R_TUT3_HDRIVE | hands_over | GcRewardSpecificTech | 1 | TUT_NEXT3 |
| R_TUT4 | internal | GcRewardMission | 1 | TUT_NEXT4 |
| R_TUT4_BP | hands_over | GcRewardSpecificProductRecipe | 1 | TUT_NEXT4 |
| R_TUT5 | internal | GcRewardMission | 1 | TUT_NEXT5 |
| R_TUT_BINOCS | internal | GcRewardMission | 1 | TUT_ADV_MATS |
| R_TUT_SHIPREP | internal | GcRewardMission | 1 | TUT_NEXT1 |
| R_VR_INIT | internal | GcRewardModifyStat | 1 | VR_TELEPORT |
| R_WATERMISS3 | hands_over | GcRewardSpecificTech | 1 | WATERSTORY3 |
| R_WEAP7_DONE | internal | GcRewardMissionMessage | 1 | WEAPGUY7 |
| R_WEAP7_SAFE | internal | GcRewardWantedLevel | 1 | WEAPGUY7 |
| R_WEAP7_WANTED | internal | GcRewardWantedLevel | 1 | WEAPGUY7 |
| R_WEAP_R_1 | hands_over | GcRewardSpecificTech | 1 | WEAPGUY_REWARDS |
| R_WEAP_R_2 | hands_over | GcRewardSpecificTech | 1 | WEAPGUY_REWARDS |
| R_WEAP_R_3 | hands_over | GcRewardSpecificTech | 1 | WEAPGUY_REWARDS |
| R_WEAP_R_4 | hands_over | GcRewardSpecificTech | 1 | WEAPGUY_REWARDS |
| R_WHALE_EXPED | internal | GcRewardCustomExpeditionLogEntry | 1 | BIO_FRIG_INIT |
| R_WIKI_12 | internal | GcRewardWikiTopic | 1 | TUT_NEXT1D |
| R_WIKI_13 | internal | GcRewardWikiTopic | 1 | SHIPFUEL_WIKI |
| R_WIKI_14 | internal | GcRewardWikiTopic | 2 | EXOTUT2 EXOCRAFT_WIKI |
| R_WIKI_15 | internal | GcRewardWikiTopic | 1 | ACT1_STEP13 |
| R_WIKI_16 | internal | GcRewardWikiTopic | 1 | TUT_ADV_MATS |
| R_WIKI_17 | internal | GcRewardWikiTopic | 2 | TUT_NEXT2 HYPERDRIVE |
| R_WIKI_18 | internal | GcRewardWikiTopic | 1 | FARMER1 |
| R_WIKI_19 | internal | GcRewardWikiTopic | 2 | TUT_NEXT2 HYPERDRIVE |
| R_WIKI_2 | internal | GcRewardWikiTopic | 1 | OXYGEN_HINT |
| R_WIKI_20 | internal | GcRewardWikiTopic | 1 | FREIGHT_DEFEND |
| R_WIKI_21 | internal | GcRewardWikiTopic | 1 | MISSBOARD_WIKI |
| R_WIKI_22 | internal | GcRewardWikiTopic | 1 | TUT_REPAIR_SHIP |
| R_WIKI_23 | internal | GcRewardWikiTopic | 1 | ACT1_STEP6 |
| R_WIKI_24 | internal | GcRewardWikiTopic | 2 | S12_FIND_SHIP TUT_ADV_MATS |
| R_WIKI_26 | internal | GcRewardWikiTopic | 2 | ACT1_STEP11 WEAPONS_WIKI |
| R_WIKI_27 | internal | GcRewardWikiTopic | 1 | DEFENCES_WIKI |
| R_WIKI_29 | internal | GcRewardWikiTopic | 1 | SPACECOM_WIKI |
| R_WIKI_3 | internal | GcRewardWikiTopic | 1 | CATALYST1_HINT |
| R_WIKI_30 | internal | GcRewardWikiTopic | 2 | S12_FIND_SHIP TUT_ADV_MATS |
| R_WIKI_31 | internal | GcRewardWikiTopic | 1 | TUT_BASEBUILD |
| R_WIKI_32 | internal | GcRewardWikiTopic | 1 | POWER_TUT |
| R_WIKI_33 | internal | GcRewardWikiTopic | 3 | BAIT_HINT ADV_BAIT_HINT PET_HELP |
| R_WIKI_34 | internal | GcRewardWikiTopic | 1 | FLEET_TUT |
| R_WIKI_35 | internal | GcRewardWikiTopic | 1 | STATION_WIKI |
| R_WIKI_36 | internal | GcRewardWikiTopic | 1 | ACT1_STEP6 |
| R_WIKI_5 | internal | GcRewardWikiTopic | 1 | LASER_GUIDE |
| R_WIKI_6 | internal | GcRewardWikiTopic | 1 | TUT_FIRST_WALK |
| R_WIKI_7 | internal | GcRewardWikiTopic | 1 | TUT_BASEBUILD |
| R_WIKI_ABAND | internal | GcRewardWikiTopic | 1 | ABAND_FIRSTHINT |
| R_WIKI_BIGGS | internal | GcRewardWikiTopic | 1 | BIGGS_WIKI |
| R_WIKI_BONES | internal | GcRewardWikiTopic | 1 | BONES_TUT |
| R_WIKI_PIRATES | internal | GcRewardWikiTopic | 3 | PIRATE_SYS_HINT PIRATE_STATION PIRATES2 |
| R_WIKI_SCRAP | internal | GcRewardWikiTopic | 1 | SCRAP_WIKI |
| R_WIKI_SETTLE | internal | GcRewardWikiTopic | 2 | SETTLE_CLAIM SETTLE_TUT |
| R_WIKI_STATIOWN | internal | GcRewardWikiTopic | 1 | STATIONOWN_WIKI |
| R_WIKI_TECHFRAG | internal | GcRewardWikiTopic | 3 | NEXUS1 WIKI_TECHFRAG WIKI_NANITES |
| R_WM6_PING | internal | GcRewardMissionMessage | 1 | WATERSTORY5 |
| R_WORLDSMA_S4 | internal | GcRewardSetMissionStat | 1 | WORLDSMA |
| R_WORLDSMB_CRS0 | internal | GcRewardModifyStat | 1 | WORLDSMB |
| R_WORM_LORE1 | internal | GcRewardModifyStat | 1 | WORMHIDE1 |
| R_WORM_LORE2 | internal | GcRewardModifyStat | 1 | WORMHIDE2 |
| R_WORM_LORE3 | internal | GcRewardModifyStat | 1 | WORMHIDE3 |
| R_WORM_LORE4 | internal | GcRewardModifyStat | 1 | WORMHIDE4 |
| R_WORM_LORE5 | internal | GcRewardModifyStat | 1 | WORMHIDE5 |
| R_WORM_LORE6 | internal | GcRewardModifyStat | 1 | WORMHIDE6 |
| R_WP2_SAFE | hands_over | GcRewardSpecificProduct | 1 | WP2_SAFETY |
| R_WP3_SAFE | hands_over | GcRewardSpecificProduct | 1 | WP3_SAFETY |
| R_WT_PORTAL_ADV | internal | GcRewardAdvancePortalState | 1 | WAKE_TITAN |
| R_W_ROBOT_STAT | internal | GcRewardSetMissionStat | 1 | W_CRE_ROBOT |
| SPACE_STORE_BP | hands_over | GcRewardSpecificProductRecipe | 1 | STORAGE_FIX |
| STARDENY | hands_over | GcRewardSpecificTech | 1 | ATLAS_LOOP_DENY |
| START_BASEBUILD | internal | GcRewardMission GcRewardSpecificProductRecipe | 1 | TUT_CATCHUP |
| START_TUT_NEXT1 | internal | GcRewardMission | 1 | TUT_CATCHUP |
| START_TUT_NEXT3 | internal | GcRewardMission GcRewardSpecificProductRecipe GcRewardSpecificTech | 1 | TUT_CATCHUP |
| START_TUT_NEXT4 | internal | GcRewardMission GcRewardSpecificProductRecipe GcRewardSpecificTech | 1 | TUT_CATCHUP |
| START_TUT_NEXT5 | internal | GcRewardMission GcRewardSpecificProductRecipe GcRewardSpecificTech | 1 | TUT_CATCHUP |
| STORM | internal | GcRewardTriggerStorm | 12 | MPC_STORM_POOP MPC_STORM_EX_Y MPC_STORM_EX_R MPC_STORM_EX_G MPC_STORM_EX_B W_COMM_NP05 |
| TECHFRAG_L | hands_over | GcRewardMoney | 1 | PP_SCN_ARTIFACT |
| TUT_INGREDS | internal | GcRewardMissionMessage GcRewardMultiSpecificProducts GcRewardSpecificProductRecipe | 1 | TUT_ADV_MATS |
| WEAPGUY3_WIN | internal | GcRewardMissionMessage | 1 | WEAPGUY3 |
