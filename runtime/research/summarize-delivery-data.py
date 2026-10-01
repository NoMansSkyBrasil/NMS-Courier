"""Emit compact reward and freighter schema evidence from an extracted corpus."""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET

REWARD_TYPES = {
    "GcRewardInventorySlots", "GcRewardFreighterSlot", "GcRewardShipSlot",
    "GcRewardSpecificWeapon", "GcRewardSpecificShip", "GcRewardSpecificFrigate",
    "GcRewardInstallTech", "GcRewardMultiSpecificTechRecipes",
    "GcRewardSpecificTechRecipe", "GcRewardMoney", "GcRewardSpecificSubstance",
    "GcRewardSpecificProduct", "GcRewardOSDMessage", "GcRewardOpenFreeFreighter",
}


def flatten(node, prefix=""):
    values = {}
    names = Counter(child.attrib.get("name", child.tag) for child in node)
    seen = Counter()
    for child in node:
        name = child.attrib.get("name", child.tag)
        if names[name] > 1:
            seen[name] += 1
            name = f"{name}[{seen[name] - 1}]"
        key = prefix + name
        if list(child):
            values.update(flatten(child, key + "."))
        elif "value" in child.attrib:
            values[key] = child.attrib["value"]
    return values


def reward_evidence(tree):
    """Keep bounded examples per type, with their actual enclosing reward ID."""
    examples = []
    counts = Counter()
    ship_classes = Counter()
    for entry in tree.iter("Property"):
        if entry.attrib.get("value") != "GcGenericRewardTableEntry":
            continue
        reward_id = entry.attrib.get("_id")
        for payload in entry.iter("Property"):
            kind = payload.attrib.get("name")
            if kind not in REWARD_TYPES:
                continue
            fields = flatten(payload)
            counts[kind] += 1
            if kind == "GcRewardSpecificShip":
                ship_classes[fields.get("ShipType.ShipClass", "unspecified")] += 1
            if counts[kind] <= 3:
                examples.append({"id": reward_id, "type": kind, "fields": fields})
    return {"counts": dict(sorted(counts.items())),
            "ship_classes": dict(sorted(ship_classes.items())), "examples": examples}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    corpus = args.corpus.resolve()
    output = args.output.resolve()
    if not output.is_relative_to(corpus.parent):
        parser.error("Evidence must remain in the external research directory")
    db = sqlite3.connect(corpus / "index.sqlite")
    report = json.loads((corpus / "report.json").read_text(encoding="utf-8-sig"))
    result = {"game_executable_sha256": report["game_executable_sha256"],
              "mutation": False, "tables": [], "reward_types": {}, "freighter_rewards": [],
              "freighter_models": [], "freighter_generation": [], "reward_tables": []}
    wanted = ["metadata/reality/tables/rewardtable.mbin",
              "metadata/reality/tables/inventorytable.mbin",
              "metadata/simulation/space/aispaceshipmanager.mbin"]
    for name in wanted:
        rows = db.execute("SELECT archive_hash,path,xml_path FROM files WHERE path=? AND conversion='ok'", (name,)).fetchall()
        for archive_hash, path, xml_path in rows:
            source = Path(xml_path)
            with source.open("rb") as stream:
                digest = hashlib.file_digest(stream, "sha256").hexdigest()
            result["tables"].append({"path": path, "archive_sha256": archive_hash, "xml_sha256": digest})
            tree = ET.parse(source)
            if name.endswith("/rewardtable.mbin"):
                result["reward_tables"].append({"archive_sha256": archive_hash,
                                                **reward_evidence(tree)})
                types = Counter()
                for node in tree.iter("Property"):
                    kind = node.attrib.get("name", "")
                    if kind.startswith("GcReward") and kind != "GcRewardTableItem":
                        types[kind] += 1
                    if node.attrib.get("value") == "GcGenericRewardTableEntry":
                        for payload in node.iter("Property"):
                            if payload.attrib.get("name") != "GcRewardSpecificShip":
                                continue
                            fields = flatten(payload)
                            if fields.get("ShipType.ShipClass") == "Freighter":
                                result["freighter_rewards"].append({"id": node.attrib.get("_id"),
                                    "archive_sha256": archive_hash, "fields": fields})
                result["reward_types"] = dict(sorted(types.items()))
            elif name.endswith("/inventorytable.mbin"):
                for node in tree.iter("Property"):
                    if node.attrib.get("name") in ("FreighterSmall", "FreighterMedium", "FreighterLarge") and node.attrib.get("value") == "GcInventoryLayoutGenerationDataEntry":
                        result["freighter_generation"].append({"entry": node.attrib["name"], "fields": flatten(node)})
            else:
                for node in tree.iter("Property"):
                    if node.attrib.get("value") == "GcAISpaceshipModelData":
                        fields = flatten(node)
                        if fields.get("Class.ShipClass") == "Freighter" and fields.get("AIRole.AIShipRole") != "Frigate":
                            result["freighter_models"].append(fields)
    db.close()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps({"tables": len(result["tables"]), "freighter_rewards": len(result["freighter_rewards"]),
                      "freighter_models": len(result["freighter_models"]), "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
