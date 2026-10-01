"""Check reward evidence attribution and bounded schema sampling."""

import importlib.util
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

spec = importlib.util.spec_from_file_location("delivery_data", Path(__file__).with_name("summarize-delivery-data.py"))
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)


class RewardEvidenceTests(unittest.TestCase):
    def test_repeated_slot_elements_are_preserved_without_overwriting(self):
        node = ET.fromstring('<Property><Property name="Slots">'
                              '<Property name="Slots"><Property name="Id" value="HYPERDRIVE"/></Property>'
                              '<Property name="Slots"><Property name="Id" value="TELEPORT"/></Property>'
                              '</Property></Property>')
        self.assertEqual(data.flatten(node), {"Slots.Slots[0].Id": "HYPERDRIVE",
                                               "Slots.Slots[1].Id": "TELEPORT"})

    def test_samples_keep_reward_ids_and_counts_exceed_the_sample_limit(self):
        entries = "".join(
            f'<Property value="GcGenericRewardTableEntry" _id="REWARD{i}">'
            '<Property name="Reward" value="GcRewardMoney">'
            '<Property name="GcRewardMoney"><Property name="AmountMin" value="500"/>'
            '</Property></Property></Property>' for i in range(5)
        )
        result = data.reward_evidence(ET.ElementTree(ET.fromstring(f"<Data>{entries}</Data>")))
        self.assertEqual(result["counts"], {"GcRewardMoney": 5})
        self.assertEqual([sample["id"] for sample in result["examples"]],
                         ["REWARD0", "REWARD1", "REWARD2"])
        self.assertEqual(result["examples"][0]["fields"], {"AmountMin": "500"})

    def test_ship_classes_follow_ship_type_instead_of_inventory_class(self):
        source = '<Data><Property value="GcGenericRewardTableEntry" _id="FREIGHT">'
        source += '<Property name="GcRewardSpecificShip"><Property name="ShipType">'
        source += '<Property name="ShipClass" value="Freighter"/></Property>'
        source += '<Property name="Class"><Property name="InventoryClass" value="B"/>'
        source += '</Property></Property></Property></Data>'
        result = data.reward_evidence(ET.ElementTree(ET.fromstring(source)))
        self.assertEqual(result["ship_classes"], {"Freighter": 1})
        self.assertEqual(result["examples"][0]["fields"]["Class.InventoryClass"], "B")


if __name__ == "__main__":
    unittest.main()
