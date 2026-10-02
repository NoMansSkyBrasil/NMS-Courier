"""Index selected service-client functions without executing HTML or JavaScript."""

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re

DEFAULT_FUNCTIONS = (
    "ShipDelivery", "FreighterDelivery", "ServiceBotExtenderDelivery",
    "MultitoolDelivery", "RewardDelivery", "CurrencyDelivery", "ShipUpgrader",
    "EggDelivery", "LoadMissionList", "RequestBySharingCode",
    "LoadSharingCenterItemListDisplay", "SwitchSharingCategory", "SendCommandToServer",
)


class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.active = False
        self.parts = []
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.active = True
            source = dict(attrs).get("src")
            if source:
                self.sources.append(source.split("?")[0])

    def handle_endtag(self, tag):
        if tag == "script":
            self.active = False
            self.parts.append("\n")

    def handle_data(self, data):
        if self.active:
            self.parts.append(data)


def balanced_body(source, opening):
    """Handle quotes and comments; regex literals are not a complete JS grammar."""
    depth, index, quote = 0, opening, None
    while index < len(source):
        char = source[index]
        if quote:
            if char == "\\":
                index += 2
                continue
            if char == quote:
                quote = None
        elif char in "\"'`":
            quote = char
        elif source.startswith("//", index):
            end = source.find("\n", index + 2)
            index = len(source) if end < 0 else end
            continue
        elif source.startswith("/*", index):
            end = source.find("*/", index + 2)
            if end < 0:
                return None
            index = end + 2
            continue
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[opening:index + 1]
        index += 1
    return None


def inspect(path, names=DEFAULT_FUNCTIONS):
    if path.stat().st_size > 32 * 1024 * 1024:
        raise ValueError("Source exceeds the 32 MiB bound")
    raw = path.read_bytes()
    collector = ScriptCollector()
    collector.feed(raw.decode("utf-8-sig"))
    source = "".join(collector.parts)
    results = []
    for name in names:
        matches = list(re.finditer(r"\bfunction\s+" + re.escape(name) + r"\s*\([^)]*\)\s*\{", source))
        row = {"name": name, "declarations": len(matches)}
        if len(matches) == 1:
            body = balanced_body(source, matches[0].end() - 1)
            row["body_balanced"] = body is not None
            if body is not None:
                row["body_sha256"] = hashlib.sha256(body.encode()).hexdigest()
                row["body_characters"] = len(body)
                row["command_types"] = sorted(set(re.findall(r'\btype\s*:\s*[\"\x27]([A-Z_]+)[\"\x27]', body)))
                row["property_candidates"] = sorted(set(re.findall(r'\b([A-Za-z_$][\w$]*)\s*:', body)))[:64]
                row["dom_ids"] = sorted(set(re.findall(r'getElementById\([\"\x27]([\w-]+)[\"\x27]\)', body)))[:64]
                row["sends_server_command"] = "SendCommandToServer(" in body
                row["uses_fetch"] = bool(re.search(r"\bfetch\s*\(", body))
        results.append(row)
    return {"source_sha256": hashlib.sha256(raw).hexdigest(), "source_bytes": len(raw),
            "mode": "static_read_only", "runtime_verified": False,
            "caveat": "Lexical candidates only; regex literals and template interpolation are not fully parsed. No scripts, requests, credentials or account values are executed or exported.",
            "script_sources": collector.sources, "functions": results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--function", action="append", default=[])
    args = parser.parse_args()
    names = args.function or DEFAULT_FUNCTIONS
    if len(names) > 32 or any(not re.fullmatch(r"[A-Za-z_$][\w$]*", name) for name in names):
        parser.error("Select at most 32 exact JavaScript function names")
    if args.output.resolve().is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error("Client reports must remain outside the repository")
    if args.output.suffix.lower() != ".json" or args.output.resolve() == args.source.resolve():
        parser.error("Use a separate JSON report; never overwrite the inspected source")
    report = inspect(args.source, names)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"source_sha256": report["source_sha256"],
                      "functions": [{"name": row["name"], "declarations": row["declarations"],
                                     "command_types": row.get("command_types", [])}
                                    for row in report["functions"]]}, indent=2))


if __name__ == "__main__":
    main()
