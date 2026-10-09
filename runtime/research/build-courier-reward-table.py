"""Build the reward table of the project's mod folder (runtime/mods/courier_rewards).

The table holds the carrier entries the bridge uses: three money rewards, one substance and one
product reward, and one ship and one multi-tool reward per model. The ship and multi-tool carriers
are copies of a reward the game ships for the same kind (so the installed technologies are the
game's own choice for that kind), with this project's identifier, the kind's procedural scene,
seed 1 and no special name. The bridge writes the requested seed and class into a carrier for one
request and restores it.

Reads the research corpus only. Writes one file; the application checks it by SHA-256, so rerun
this only together with a change of that hash in the application.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path

# Class and procedural scene of each kind are the game's own pairs in
# metadata/simulation/space/aispaceshipmanager (ship models FIGHTER, DROPSHIP, SCIENTIFIC, SHUTTLE,
# SAILSHIP, ROYAL, ALIEN and ROBOT). No shipped reward uses the procedural scene of the last three,
# so their carriers copy the reward the game ships for that class with a special model and keep
# only the listed technologies: the ones the technology table marks as core for the kind, and the
# kind's basic weapons. Upgrades, trails and expedition extras of the special model are dropped.
SHIPS = [
    # model, carrier, the game's ship class, procedural scene, technologies to keep (None: all)
    ("fighter", "COURIER_SHIP_FGT", "Fighter", "MODELS/COMMON/SPACECRAFT/FIGHTERS/FIGHTER_PROC.SCENE.MBIN", None),
    ("hauler", "COURIER_SHIP_DRP", "Dropship", "MODELS/COMMON/SPACECRAFT/DROPSHIPS/DROPSHIP_PROC.SCENE.MBIN", None),
    ("explorer", "COURIER_SHIP_SCI", "Scientific", "MODELS/COMMON/SPACECRAFT/SCIENTIFIC/SCIENTIFIC_PROC.SCENE.MBIN", None),
    ("shuttle", "COURIER_SHIP_SHT", "Shuttle", "MODELS/COMMON/SPACECRAFT/SHUTTLE/SHUTTLE_PROC.SCENE.MBIN", None),
    ("solar", "COURIER_SHIP_SAL", "Sail", "MODELS/COMMON/SPACECRAFT/SAILSHIP/SAILSHIP_PROC.SCENE.MBIN", None),
    ("exotic", "COURIER_SHIP_ROY", "Royal", "MODELS/COMMON/SPACECRAFT/S-CLASS/S-CLASS_PROC.SCENE.MBIN",
     ("HYPERDRIVE", "LAUNCHER", "SHIPJUMP1", "SHIPSHIELD", "SHIPGUN1", "SHIPLAS1")),
    ("living", "COURIER_SHIP_ALN", "Alien", "MODELS/COMMON/SPACECRAFT/S-CLASS/BIOPARTS/BIOSHIP_PROC.SCENE.MBIN",
     ("WARP_ALIEN", "LAUNCHER_ALIEN", "SHIPJUMP_ALIEN", "SHIELD_ALIEN", "SHIPGUN_ALIEN", "SHIPLAS_ALIEN")),
    ("interceptor", "COURIER_SHIP_RBT", "Robot", "MODELS/COMMON/SPACECRAFT/SENTINELSHIP/SENTINELSHIP_PROC.SCENE.MBIN",
     ("HYPERDRIVE_ROBO", "LAUNCHER_ROBO", "SHIPJUMP_ROBO", "SHIPSHIELD_ROBO", "LIFESUP_ROBO", "SHIPGUN_ROBO")),
]
WEAPONS = [
    ("pistol", "COURIER_TOOL_PST", "Pistol", "MODELS/COMMON/WEAPONS/MULTITOOL/MULTITOOL.SCENE.MBIN"),
    ("rifle", "COURIER_TOOL_RFL", "Rifle", "MODELS/COMMON/WEAPONS/MULTITOOL/MULTITOOL.SCENE.MBIN"),
    ("experimental", "COURIER_TOOL_EXP", "Pristine", "MODELS/COMMON/WEAPONS/MULTITOOL/MULTITOOL.SCENE.MBIN"),
    ("alien", "COURIER_TOOL_ALN", "Alien", "MODELS/COMMON/WEAPONS/MULTITOOL/MULTITOOL.SCENE.MBIN"),
    ("staff", "COURIER_TOOL_STF", "Staff", "MODELS/COMMON/WEAPONS/MULTITOOL/STAFFMULTITOOL.SCENE.MBIN"),
]
# The other multi-tool scenes of the game. The fifth value is the class of the shipped reward that
# is copied: no reward ships with the classes Royal, Robot and Atlas, so those carriers copy a
# pistol reward and take the class by name. A scene some reward ships with gets that reward.
WEAPONS += [
    ("royal", "COURIER_TOOL_ROY", "Royal", "MODELS/COMMON/WEAPONS/MULTITOOL/ROYALMULTITOOL.SCENE.MBIN", "Pistol"),
    ("sentinel", "COURIER_TOOL_SNT", "Robot", "MODELS/COMMON/WEAPONS/MULTITOOL/SENTINELMULTITOOL.SCENE.MBIN", "Pistol"),
    ("sentinelb", "COURIER_TOOL_SNB", "Robot", "MODELS/COMMON/WEAPONS/MULTITOOL/SENTINELMULTITOOLB.SCENE.MBIN", "Pistol"),
    ("atlas", "COURIER_TOOL_ATL", "Atlas", "MODELS/COMMON/WEAPONS/MULTITOOL/ATLASMULTITOOL.SCENE.MBIN", "Pistol"),
    ("switch", "COURIER_TOOL_SWT", "Rifle", "MODELS/COMMON/WEAPONS/MULTITOOL/SWITCHMULTITOOL.SCENE.MBIN", "Rifle"),
    ("retro", "COURIER_TOOL_RET", "Pistol", "MODELS/COMMON/WEAPONS/MULTITOOL/RETROMULTITOOL.SCENE.MBIN", "Pistol"),
    ("swarm", "COURIER_TOOL_SWM", "Rifle", "MODELS/COMMON/WEAPONS/MULTITOOL/SWARMMULTITOOL.SCENE.MBIN", "Rifle"),
    ("staffnpc", "COURIER_TOOL_SNP", "Staff", "MODELS/COMMON/WEAPONS/MULTITOOL/STAFFNPCMULTITOOL.SCENE.MBIN", "Staff"),
    ("staffruin", "COURIER_TOOL_SRU", "Staff", "MODELS/COMMON/WEAPONS/MULTITOOL/STAFFMULTITOOLRUIN.SCENE.MBIN", "Staff"),
    ("staffbone", "COURIER_TOOL_SBO", "Staff", "MODELS/COMMON/WEAPONS/MULTITOOL/STAFFMULTITOOLBONE.SCENE.MBIN", "Staff"),
    ("atlasstaff", "COURIER_TOOL_SAT", "Staff", "MODELS/COMMON/WEAPONS/MULTITOOL/STAFFMULTITOOLATLAS.SCENE.MBIN", "Staff"),
]


def child(node: ET.Element, path: str) -> ET.Element:
    for name in path.split("/"):
        node = next(c for c in node if c.get("name") == name)
    return node


def entry(identifier: str, reward: ET.Element) -> ET.Element:
    root = ET.Element("Property", name="GenericTable", value="GcGenericRewardTableEntry", _id=identifier)
    ET.SubElement(root, "Property", name="Id", value=identifier)
    items = ET.SubElement(root, "Property", name="List", value="GcRewardTableItemList")
    ET.SubElement(items, "Property", name="RewardChoice", value="GiveAll")
    ET.SubElement(items, "Property", name="OverrideZeroSeed", value="false")
    ET.SubElement(items, "Property", name="UseInventoryChoiceOverride", value="false")
    ET.SubElement(items, "Property", name="IncrementStat", value="")
    inner = ET.SubElement(items, "Property", name="List")
    item = ET.SubElement(inner, "Property", name="List", value="GcRewardTableItem", _index="0")
    ET.SubElement(item, "Property", name="PercentageChance", value="100.000000")
    ET.SubElement(item, "Property", name="LabelID", value="")
    item.append(reward)
    return root


def simple(kind: str, fields: list[tuple[str, str] | tuple[str, str, list]]) -> ET.Element:
    reward = ET.Element("Property", name="Reward", value=kind)
    body = ET.SubElement(reward, "Property", name=kind)
    for field in fields:
        if len(field) == 2:
            ET.SubElement(body, "Property", name=field[0], value=field[1])
        else:
            nested = ET.SubElement(body, "Property", name=field[0], value=field[1])
            for name, value in field[2]:
                ET.SubElement(nested, "Property", name=name, value=value)
    return reward


def money(currency: str) -> ET.Element:
    return simple("GcRewardMoney", [("AmountMin", "1"), ("AmountMax", "1"), ("RoundNumber", "false"),
                                    ("Currency", "GcCurrency", [("Currency", currency)])])


def shipped(root: ET.Element, kind: str, type_path: str, type_value: str, scene_path: str,
            scene: str) -> ET.Element:
    """A reward the game ships for this kind, preferring one that already uses the scene."""
    found = None
    for table in root:
        for candidate in table:
            rewards = [n for n in candidate.iter("Property") if n.get("value") == kind and n.get("name") == "Reward"]
            items = [n for n in candidate.iter("Property") if n.get("value") == "GcRewardTableItem"]
            if len(rewards) != 1 or len(items) != 1:
                continue
            body = child(rewards[0], kind)
            if child(body, type_path).get("value") != type_value:
                continue
            if child(body, scene_path).get("value") == scene:
                return rewards[0]
            found = found or rewards[0]
    if found is None:
        raise SystemExit("no shipped reward of type " + type_value)
    return found


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    source = sorted(args.corpus.glob("archives/*/metadata/reality/tables/rewardtable.MXML"))[0]
    root = ET.parse(source).getroot()

    entries = [
        entry("COURIER_UNITS", money("Units")),
        entry("COURIER_NANITES", money("Nanites")),
        entry("COURIER_QS", money("Specials")),
        entry("COURIER_SUBST", simple("GcRewardSpecificSubstance", [
            ("Default", "GcDefaultMissionSubstanceEnum", [("DefaultSubstanceType", "None")]),
            ("ID", "FUEL1"), ("AmountMin", "1"), ("AmountMax", "1"), ("DisableMultiplier", "true"),
            ("RewardAsBlobs", "false"), ("UseFuelMultiplier", "false"), ("Silent", "false"),
            ("UseMissionBoardDifficultyScale", "false")])),
        entry("COURIER_PRODUCT", simple("GcRewardSpecificProduct", [
            ("Default", "GcDefaultMissionProductEnum", [("DefaultProductType", "None")]),
            ("ID", "CASING"), ("AmountMin", "1"), ("AmountMax", "1"), ("HideAmountInMessage", "false"),
            ("ForceSpecialMessage", "false"), ("HideInSeasonRewards", "false"), ("Silent", "false"),
            ("SeasonRewardListFormat", ""), ("RequiresTech", "")])),
    ]
    for _, identifier, ship_class, scene, keep in SHIPS:
        reward = copy.deepcopy(shipped(root, "GcRewardSpecificShip", "ShipType/ShipClass", ship_class,
                                       "ShipResource/Filename", scene))
        body = child(reward, "GcRewardSpecificShip")
        child(body, "ShipResource/Filename").set("value", scene)
        child(body, "ShipResource/Seed").set("value", "1")
        child(body, "ShipLayout/Seed").set("value", "1")
        child(body, "ShipInventory/Class/InventoryClass").set("value", "S")
        for name, value in (("NameOverride", ""), ("CostAmount", "0"), ("IsGift", "true"),
                            ("IsRewardShip", "true"), ("FormatAsSeasonal", "false")):
            child(body, name).set("value", value)
        child(body, "ModelViewOverride/ModelViews").set("value", "None")
        if keep is not None:
            slots = child(body, "ShipInventory/Slots")
            held = [slot.get("_id") for slot in slots]
            missing = [name for name in keep if name not in held]
            if missing:
                raise SystemExit("shipped %s reward lacks %s" % (ship_class, missing))
            for slot in list(slots):
                if slot.get("_id") not in keep:
                    slots.remove(slot)
            for index, slot in enumerate(slots):
                if index:
                    slot.set("_index", str(index))
                else:
                    slot.attrib.pop("_index", None)
        entries.append(entry(identifier, reward))
    for _, identifier, stat_class, scene, *source in WEAPONS:
        reward = copy.deepcopy(shipped(root, "GcRewardSpecificWeapon", "WeaponType/WeaponStatClass",
                                       source[0] if source else stat_class, "WeaponResource/Filename", scene))
        body = child(reward, "GcRewardSpecificWeapon")
        child(body, "WeaponType/WeaponStatClass").set("value", stat_class)
        child(body, "WeaponResource/Filename").set("value", scene)
        child(body, "WeaponResource/GenerationSeed").set("value", "1")
        child(body, "WeaponLayout/Seed").set("value", "1")
        child(body, "WeaponInventory/Class/InventoryClass").set("value", "S")
        for name, value in (("NameOverride", ""), ("IsGift", "true"), ("IsRewardWeapon", "true"),
                            ("FormatAsSeasonal", "false")):
            child(body, name).set("value", value)
        entries.append(entry(identifier, reward))

    data = ET.Element("Data", template="cGcRewardTable")
    table = ET.SubElement(data, "Property", name="GenericTable")
    table.extend(entries)
    ET.indent(data, space="  ")
    text = '<?xml version="1.0" encoding="utf-8"?>\n' + ET.tostring(data, encoding="unicode") + "\n"
    args.output.write_bytes(text.encode("utf-8"))
    print(len(entries), "entries", hashlib.sha256(text.encode("utf-8")).hexdigest())


if __name__ == "__main__":
    main()
