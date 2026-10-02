"""Collect bounded acquisition/upgrade schema evidence without game attachment."""

import argparse
from collections import Counter
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET
import zipfile

spec = importlib.util.spec_from_file_location("delivery_summary", Path(__file__).with_name("summarize-delivery-data.py"))
summary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(summary)
KINDS = {
    "GcRewardSpecificShip", "GcRewardSpecificWeapon", "GcRewardSpecificFrigate",
    "GcRewardOpenFreeFreighter", "GcRewardUpgradeShipClass", "GcRewardUpgradeWeaponClass",
    "GcRewardShipSlot", "GcRewardWeaponSlot", "GcRewardFreighterSlot",
    "GcRewardInventorySlots", "GcRewardInstallTech", "GcRewardSpecificTech",
    "GcRewardMultiSpecificTechRecipes", "GcRewardStartShipBuildMode",
    "GcRewardUnlockSeasonReward", "GcRewardSpecificProductRecipe",
    "GcRewardMultiSpecificProductRecipes", "GcRewardRepairWholeInventory",
    "GcRewardSpecificProduct", "GcRewardSpecificSubstance",
}


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--mods", type=Path)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if not output.is_relative_to(corpus.parent) or output.is_relative_to(corpus):
        parser.error("Keep evidence in the external research root, outside the corpus")
    report = json.loads((corpus / "report.json").read_text(encoding="utf-8-sig"))
    result = {"game_sha256": report["game_executable_sha256"],
              "script_sha256": sha256(Path(__file__)), "runtime_mutation": False,
              "status": "offline_schema_evidence_only", "tables": [], "mods": []}
    with sqlite3.connect((corpus / "index.sqlite").as_uri() + "?mode=ro", uri=True) as db:
        for name in ("metadata/reality/tables/rewardtable.mbin", "gcbuildableshipglobals.global.mbin"):
            rows = db.execute("SELECT archive_hash,xml_path FROM files WHERE path=? AND conversion='ok'", (name,)).fetchall()
            for archive_hash, xml_path in rows:
                source = Path(xml_path)
                counts, variants, examples = Counter(), Counter(), []
                tree = ET.parse(source)
                for entry in tree.iter("Property"):
                    if entry.attrib.get("value") != "GcGenericRewardTableEntry":
                        continue
                    for node in entry.iter("Property"):
                        kind = node.attrib.get("name")
                        if kind not in KINDS:
                            continue
                        counts[kind] += 1
                        fields = summary.flatten(node)
                        compact = {key: value for key, value in fields.items()
                                   if ".Slots.Slots[" not in key}
                        variant = (kind, fields.get("ShipType.ShipClass", ""), fields.get("IsGift", ""))
                        variants[variant] += 1
                        if variants[variant] <= 2:
                            examples.append({"reward_id": entry.attrib.get("_id"), "type": kind, "fields": compact})
                result["tables"].append({"path": name, "archive_sha256": archive_hash,
                                         "xml_sha256": sha256(source), "generic_reward_counts": dict(counts),
                                         "scope": "GcGenericRewardTableEntry only; inline payloads outside that container are not counted",
                                         "variants": [{"type": k[0], "ship_type": k[1], "gift_flag": k[2], "count": v}
                                                      for k, v in variants.items()], "examples": examples})
    if args.mods:
        for path in sorted(args.mods.glob("*.zip")):
            if not any(token in path.name for token in ("OnlyS", "SquareSCSlots", "Season Rewards", "Meta-Mod")):
                continue
            with zipfile.ZipFile(path) as archive:
                lua = [info for info in archive.infolist() if info.filename.lower().endswith(".lua")]
                if any(info.file_size > 4 * 1024**2 for info in lua):
                    raise ValueError("Mod source exceeds bounded inspection limit")
                texts = [archive.read(info).decode("utf-8-sig", errors="replace") for info in lua]
                markers = ("INVENTORYTABLE.MBIN", "REWARDTABLE.MBIN", "EMOTEMENU.MBIN",
                           "GcRewardAction", "IsGift", "GcRewardSpecificShip", "GCFLEETGLOBALS.GLOBAL.MBIN")
                result["mods"].append({"archive": path.name, "sha256": sha256(path),
                                       "lua_files": len(lua), "source_markers": {
                                           marker: sum(text.count(marker) for text in texts) for marker in markers},
                                       "limitation": "Text markers can occur in comments; no code was executed."})
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output), "tables": len(result["tables"]), "mods": len(result["mods"])}))


if __name__ == "__main__":
    main()
