"""Run Ghidra headless on an exact-hash executable into an external research project."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--executable", type=Path, required=True)
    parser.add_argument("--sha256", required=True)
    parser.add_argument("--tools", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=400)
    args = parser.parse_args()
    executable = args.executable.resolve()
    with executable.open("rb") as stream:
        fingerprint = hashlib.file_digest(stream, "sha256").hexdigest()
    if fingerprint != args.sha256.lower():
        parser.error("Executable does not match the selected research fingerprint")
    root = args.output.resolve()
    if root.is_relative_to(executable.parent.parent) or root.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error("Analysis output must be outside the game and repository")
    if not 1 <= args.limit <= 2000:
        parser.error("limit must be 1..2000")
    headless = next((args.tools / "ghidra").rglob("analyzeHeadless.bat"))
    java = next((args.tools / "jdk").rglob("javac.exe")).parent.parent
    root.mkdir(parents=True, exist_ok=True)
    project = root / "projects"
    project.mkdir(exist_ok=True)
    export = root / "export"
    environment = dict(os.environ, JAVA_HOME=str(java), GHIDRA_JAVA_HOME=str(java))
    environment["PATH"] = str(java / "bin") + os.pathsep + environment.get("PATH", "")
    project_name = "NMS-" + fingerprint[:12]
    common = [str(headless), str(project), project_name]
    if (project / (project_name + ".gpr")).exists():
        common += ["-process", executable.name]
    else:
        common += ["-import", str(executable)]
    command = ["cmd.exe", "/d", "/c", *common, "-max-cpu", "2",
               "-analysisTimeoutPerFile", "1800", "-scriptPath", str(Path(__file__).parent.resolve()),
               "-postScript", "ExportDeliveryCandidates.java", str(export), str(args.limit)]
    report = {"executable_sha256": fingerprint, "mode": "offline_only", "mutation": False,
              "started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "command": command}
    for key, source in (("driver_sha256", Path(__file__)),
                        ("exporter_sha256", Path(__file__).with_name("ExportDeliveryCandidates.java")),
                        ("tools_config_sha256", Path(__file__).with_name("offline-tools.json"))):
        with source.open("rb") as stream:
            report[key] = hashlib.file_digest(stream, "sha256").hexdigest()
    (root / "run.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"native_analysis_started project={project_name} log={root / 'headless.log'}", flush=True)
    with (root / "headless.log").open("w", encoding="utf-8") as log:
        result = subprocess.run(command, env=environment, stdout=log, stderr=subprocess.STDOUT)
    report["exit_code"] = result.returncode
    report["finished_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    report["export_exists"] = (export / "candidates.tsv").is_file()
    (root / "run.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)
    if result.returncode or not report["export_exists"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
