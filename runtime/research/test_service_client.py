"""Check static client inspection boundaries without executing client code."""

import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("service_client", Path(__file__).with_name("inspect-service-client.py"))
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)


class ServiceClientTests(unittest.TestCase):
    def test_balancing_preserves_nested_body_and_ignores_quoted_comment_braces(self):
        source = '{ const x = "}"; /* } */ if (true) { run(); } // }\n } trailing'
        self.assertEqual(client.balanced_body(source, 0), source[:-9])
        self.assertIsNone(client.balanced_body('{ /* unfinished', 0))

    def test_html_report_keeps_field_names_without_account_values_or_execution(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "client.html"
            path.write_text('<script>function Delivery() { const c = {type:"ITEM_DELIVERY", token:"private-value"}; SendCommandToServer(c); }</script>', encoding="utf-8")
            report = client.inspect(path, ["Delivery", "Absent"])
            row = report["functions"][0]
            self.assertEqual(row["command_types"], ["ITEM_DELIVERY"])
            self.assertIn("token", row["property_candidates"])
            self.assertNotIn("private-value", str(report))
            self.assertTrue(row["sends_server_command"])
            self.assertFalse(report["runtime_verified"])
            self.assertEqual(report["functions"][1]["declarations"], 0)

    def test_duplicate_declarations_remain_ambiguous(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "client.html"
            path.write_text('<script>function Same() {} function Same() { fetch("/"); }</script>', encoding="utf-8")
            row = client.inspect(path, ["Same"])["functions"][0]
            self.assertEqual(row["declarations"], 2)
            self.assertNotIn("body_sha256", row)


if __name__ == "__main__":
    unittest.main()
