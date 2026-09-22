import { createHash } from 'node:crypto'
import { existsSync, promises as fs } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { execFileSync } from 'node:child_process'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const runtimeRoot = resolve(repositoryRoot, 'runtime')
const stagingRoot = resolve(runtimeRoot, 'staging')
const pythonRoot = resolve(stagingRoot, 'cpython')
const wheelRoot = resolve(runtimeRoot, 'vendor', 'wheels')
const noticesRoot = resolve(stagingRoot, 'licenses')
const templatePath = resolve(runtimeRoot, 'runtime-manifest.template.json')
const buildToolLockPath = resolve(runtimeRoot, 'build-tool-lock.json')
const outputPath = resolve(stagingRoot, 'runtime-manifest.json')

async function sha256(path) {
  const hash = createHash('sha256')
  const file = await fs.open(path, 'r')

  try {
    for await (const chunk of file.createReadStream()) {
      hash.update(chunk)
    }
  } finally {
    await file.close()
  }

  return hash.digest('hex')
}

async function listFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) {
      return listFiles(path)
    }

    if (!entry.isFile()) {
      return []
    }

    const stats = await fs.stat(path)
    return [{
      path: relative(stagingRoot, path).split(sep).join('/'),
      sha256: await sha256(path),
      size: stats.size
    }]
  }))

  return nested.flat().sort((left, right) => left.path.localeCompare(right.path))
}

async function removePythonBytecode(root) {
  const entries = await fs.readdir(root, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__pycache__') {
        await fs.rm(path, { recursive: true, force: true })
      } else {
        await removePythonBytecode(path)
      }
    } else if (entry.isFile() && entry.name.endsWith('.pyc')) {
      await fs.rm(path, { force: true })
    }
  }))
}

async function inspectWheels(interpreter) {
  const script = String.raw`
import json
import os
import re
import shutil
import sys
import zipfile

wheel_root, notices_root, bootstrap_wheel, site_packages = sys.argv[1:]
shutil.rmtree(notices_root, ignore_errors=True)
os.makedirs(notices_root, exist_ok=True)
records = []

def normalize(name):
    return re.sub(r'[-_.]+', '-', name).lower()

installed = set()
for entry in os.listdir(site_packages):
    metadata_path = os.path.join(site_packages, entry, 'METADATA')
    if entry.endswith('.dist-info') and os.path.isfile(metadata_path):
        for line in open(metadata_path, encoding='utf-8'):
            if line.startswith('Name: '):
                installed.add(normalize(line[6:].strip()))
                break

for wheel_name in sorted(name for name in os.listdir(wheel_root) if name.lower().endswith('.whl')):
    if wheel_name == bootstrap_wheel:
        continue
    wheel_path = os.path.join(wheel_root, wheel_name)
    with zipfile.ZipFile(wheel_path) as archive:
        metadata_names = [name for name in archive.namelist() if name.endswith('.dist-info/METADATA')]
        if len(metadata_names) != 1:
            raise RuntimeError(f'Expected one METADATA file in {wheel_name}, found {len(metadata_names)}')
        metadata = archive.read(metadata_names[0]).decode('utf-8')
        headers = {}
        for line in metadata.splitlines():
            if ': ' in line:
                key, value = line.split(': ', 1)
                headers.setdefault(key.lower(), []).append(value)
        distribution = headers.get('name', [wheel_name])[0]
        if normalize(distribution) not in installed:
            continue
        version = headers.get('version', ['unknown'])[0]
        expression = headers.get('license-expression', [None])[0]
        declared = headers.get('license', [None])[0]
        notice_names = [
            name for name in archive.namelist()
            if not name.endswith('/') and re.search(r'(^|/)(license|licence|copying|notice)([._-]|$)', os.path.basename(name), re.I)
        ]
        notices = []
        prefix = re.sub(r'[^A-Za-z0-9._-]+', '_', f'{distribution}-{version}')
        for index, notice_name in enumerate(notice_names):
            target_name = f'{prefix}-{index + 1}-{os.path.basename(notice_name)}'
            target_path = os.path.join(notices_root, target_name)
            with open(target_path, 'wb') as target:
                target.write(archive.read(notice_name))
            notices.append(target_name)
        records.append({
            'wheel': wheel_name,
            'sha256': __import__('hashlib').sha256(open(wheel_path, 'rb').read()).hexdigest(),
            'distribution': distribution,
            'version': version,
            'licenseExpression': expression,
            'declaredLicense': declared,
            'noticeFiles': notices,
        })

print(json.dumps(records, sort_keys=True))
`
  const buildTools = JSON.parse(await fs.readFile(buildToolLockPath, 'utf8'))
  const output = execFileSync(interpreter, ['-I', '-S', '-c', script, wheelRoot, noticesRoot, buildTools.pip.wheel, resolve(pythonRoot, 'Lib', 'site-packages')], {
    encoding: 'utf8',
    env: {
      SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
      WINDIR: process.env.WINDIR ?? 'C:\\Windows'
    }
  })
  return JSON.parse(output)
}

async function main() {
  const interpreter = resolve(pythonRoot, 'python.exe')
  if (!existsSync(interpreter) || !existsSync(wheelRoot)) {
    throw new Error('The private interpreter and wheel cache must be staged before generating a runtime manifest.')
  }

  const template = JSON.parse(await fs.readFile(templatePath, 'utf8'))
  await removePythonBytecode(pythonRoot)
  const dependencies = await inspectWheels(interpreter)
  await removePythonBytecode(pythonRoot)
  const files = await listFiles(pythonRoot)
  const licenseFiles = await listFiles(noticesRoot)
  const manifest = {
    ...template,
    dependencies,
    files: [...files, ...licenseFiles].sort((left, right) => left.path.localeCompare(right.path))
  }

  await fs.mkdir(stagingRoot, { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`Runtime manifest generated at ${outputPath}`)
  console.log(`Recorded ${dependencies.length} wheels and ${manifest.files.length} runtime files.`)
}

await main()
