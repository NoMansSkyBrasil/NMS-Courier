"""Audit extracted generation inputs and a Courier reward patch without game access."""

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
import xml.etree.ElementTree as ET


def property_child(node, name):
    return next((child for child in node if child.get("name") == name), None)


def value(node, name):
    child = property_child(node, name) if node is not None else None
    return child.get("value") if child is not None else None


def reward_entries(root):
    table = property_child(root, "GenericTable")
    if table is None:
        raise ValueError("GenericTable is missing")
    return list(table)


def audit(inventory_path, reward_path, patch_path):
    paths = {"inventory": inventory_path, "rewards": reward_path, "patch": patch_path}
    roots = {name: ET.parse(path).getroot() for name, path in paths.items()}
    probabilities = []
    for node in roots["inventory"].iter("Property"):
        group = property_child(node, "ClassProbabilities")
        if group is not None:
            probabilities.append({"group": node.get("name"),
                                  "values": {child.get("name"): child.get("value")
                                             for child in group}})
    vanilla = reward_entries(roots["rewards"])
    vanilla_ids = {node.get("value") for node in roots["rewards"].iter("Property")
                   if node.get("name") == "Id"}
    patch_entries = reward_entries(roots["patch"])
    patch_ids = [value(entry, "Id") for entry in patch_entries]
    patch_selectors = [entry.get("_id") for entry in patch_entries]
    ships = []
    reward_root = roots["rewards"]
    parents = {child: parent for parent in reward_root.iter() for child in parent}
    for node in reward_root.iter("Property"):
        if node.get("name") != "GcRewardSpecificShip":
            continue
        ancestor = node
        reward_id = None
        while ancestor is not None:
            reward_id = value(ancestor, "Id")
            if reward_id is not None:
                break
            ancestor = parents.get(ancestor)
        resource = property_child(node, "ShipResource")
        inventory = property_child(node, "ShipInventory")
        inventory_class = property_child(inventory, "Class") if inventory is not None else None
        ships.append({"reward_id": reward_id,
                      "model": value(resource, "Filename"),
                      "class": value(inventory_class, "InventoryClass"),
                      "ship_type": value(property_child(node, "ShipType"), "ShipClass")})
    return {
        "input_sha256": {name: hashlib.sha256(path.read_bytes()).hexdigest()
                         for name, path in paths.items()},
        "class_generation_inputs": probabilities,
        "patch_reward_ids": patch_ids,
        "patch_entry_selectors": patch_selectors,
        "selectors_match_ids": patch_selectors == patch_ids,
        "patch_vanilla_id_collisions": sorted(set(patch_ids) & vanilla_ids),
        "patch_top_level_properties": [node.get("name") for node in roots["patch"]],
        "specific_ship_reward_classes": dict(Counter(ship["class"] for ship in ships)),
        "specific_ship_reward_samples": ships[:12],
        "limits": ["Static source audit only; does not reproduce the game's EXML merger",
                   "Extracted probabilities do not identify the player's current economy",
                   "No process attachment, save access, or runtime mutation"],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--rewards", type=Path, required=True)
    parser.add_argument("--patch", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(audit(args.inventory, args.rewards, args.patch), indent=2))


if __name__ == "__main__":
    main()
