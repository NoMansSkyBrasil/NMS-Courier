"""Run bounded Ghidra seed analysis on an explicitly selected executable hash."""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import subprocess
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--tools', type=Path, required=True)
    parser.add_argument('--seeds', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--timeout', type=int, default=900)
    parser.add_argument('--project-name')
    parser.add_argument('--stage', default='base')
    parser.add_argument('--script', choices=('ExportAcquisitionSeeds.java', 'ExportNativeDataReferences.java'),
                        default='ExportAcquisitionSeeds.java')
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', args.stage) or (args.project_name and not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', args.project_name)):
        parser.error('Invalid project or stage name')
    exe, root = args.executable.resolve(), args.output.resolve()
    if root.is_relative_to(exe.parent.parent) or root.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be outside the game and repository')
    if not 1 <= args.timeout <= 1800:
        parser.error('Timeout must be 1..1800 seconds')
    fingerprint = hashlib.sha256(exe.read_bytes()).hexdigest()
    if fingerprint != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    rows = [row for row in args.seeds.read_text().splitlines() if row.strip()]
    if not 1 <= len(rows) <= 48:
        parser.error('Expected 1..48 seeds')
    headless = next((args.tools / 'ghidra').rglob('analyzeHeadless.bat'))
    java = next((args.tools / 'jdk').rglob('javac.exe')).parent.parent
    root.mkdir(parents=True, exist_ok=True)
    if shutil.disk_usage(root).free < 20 * 1024**3:
        parser.error('Insufficient free space for the 20 GiB reserve')
    project = root / 'projects'
    project.mkdir(exist_ok=True)
    name = args.project_name or 'Acquisition' + fingerprint[:12]
    export_name = 'export' if args.stage == 'base' else args.stage + '-export'
    report_path = root / ('run.json' if args.stage == 'base' else 'run-' + args.stage + '.json')
    mode = ['-process', exe.name] if (project / (name + '.gpr')).exists() else ['-import', str(exe)]
    command = ['cmd.exe', '/d', '/c', str(headless), str(project), name, *mode,
               '-noanalysis', '-max-cpu', '2', '-scriptPath', str(Path(__file__).parent.resolve()),
               '-postScript', args.script, str(args.seeds.resolve()), str(root / export_name)]
    env = dict(os.environ, JAVA_HOME=str(java), GHIDRA_JAVA_HOME=str(java), JAVA_TOOL_OPTIONS='-XX:ActiveProcessorCount=2 -Xmx4g')
    report = {'mode': 'offline_only', 'exe_sha256': fingerprint, 'seeds_sha256': hashlib.sha256(args.seeds.read_bytes()).hexdigest(), 'command': command, 'status': 'running'}
    started = time.monotonic()
    with (root / ('headless-' + args.stage + '.log')).open('w', encoding='utf-8') as log:
        process = subprocess.Popen(command, env=env, stdout=log, stderr=subprocess.STDOUT)
        report['pid'] = process.pid
        report_path.write_text(json.dumps(report, indent=2))
        while process.poll() is None:
            reason = 'timeout' if time.monotonic() - started > args.timeout else 'low_space' if shutil.disk_usage(root).free < 20 * 1024**3 else None
            if reason:
                # Stop only this owned analysis process tree; preserve all project artifacts.
                subprocess.run(['taskkill.exe', '/PID', str(process.pid), '/T', '/F'], capture_output=True, timeout=30)
                report['status'] = reason
                break
            time.sleep(1)
        report['exit_code'] = process.wait(timeout=30)
    if report['status'] == 'running':
        report['status'] = 'completed' if report['exit_code'] == 0 and (root / export_name / 'manifest.tsv').is_file() else 'failed'
    report['elapsed_seconds'] = round(time.monotonic() - started, 1)
    report_path.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    if report['status'] != 'completed':
        raise SystemExit(1)


if __name__ == '__main__':
    main()
