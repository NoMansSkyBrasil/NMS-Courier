// Developer Electron acceptance; game data and screenshots remain external.
const { _electron: electron } = require(process.argv[6] || 'playwright')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

async function validate() {
  const [modelFile, paletteFile, referenceFile, destination] = process.argv.slice(2)
  if (!modelFile || !paletteFile || !referenceFile || !destination)
    throw new Error('Usage: node validate-palette-preview.cjs <Royal.glb> <palette.mbin> <Python-report.json> <new-output-directory> [playwright-module]')
  const root = path.resolve(__dirname, '../..')
  const output = path.resolve(destination)
  if (output === root || output.startsWith(root + path.sep) || fs.existsSync(output))
    throw new Error('Output must be new and outside the repository.')
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8'))
  if (reference.rows?.length !== 66 || reference.runtime_verified !== false)
    throw new Error('Expected an experimental Python base-palette report.')
  fs.mkdirSync(output, { recursive: true })
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({
    executablePath: path.join(root, 'apps/desktop/node_modules/electron/dist/electron.exe'),
    args: [path.join(root, 'apps/desktop'), '--user-data-dir=' + path.join(output, 'profile')],
    env, timeout: 30000
  })
  const errors = []
  try {
    const page = await app.firstWindow()
    page.on('pageerror', error => errors.push(error.message))
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const select = async (button, file) => {
      await app.evaluate(({ dialog }, filePath) => {
        dialog.showOpenDialog = async () => ({ canceled: !filePath, filePaths: filePath ? [filePath] : [] })
      }, file ? path.resolve(file) : null)
      await page.getByRole('button', { name: button, exact: true }).click()
    }
    await page.getByRole('button', { name: 'Tool Catalog', exact: true }).click()
    await page.getByRole('link', { name: 'Model workshop', exact: true }).click()
    await select('Open GLB model', modelFile)
    await page.getByRole('checkbox').first().waitFor()
    await select('Open palette MBIN', paletteFile)
    await page.getByRole('button', { name: 'Calculate color samples', exact: true }).click()
    await page.getByText('Calculated seed: 0x7', { exact: true }).waitFor()
    const actual = await page.evaluate(seed => window.nms.previewPaletteSeed(seed), reference.seed)
    const expected = reference.rows.map(row => ({ name: row.family, colors: row.colors.map(color => ({ index: color.index, lookupIndex: color.lookup_index, rgba: color.rgba })) }))
    if (actual.state !== 'calculated' || JSON.stringify(actual.preview.families) !== JSON.stringify(expected))
      throw new Error('TypeScript result differs from the independent Python calculation.')
    const families = actual.preview.families.length
    const samples = actual.preview.families.flatMap(row => row.colors).length
    await page.getByRole('button', { name: 'Hide all', exact: true }).click()
    for (const name of ['_SClassShip_Royal', '_Engine_A', '_Thruster_1', '_Wings_A', '_TopWing_A'])
      await page.getByRole('checkbox', { name, exact: true }).check()
    await page.getByRole('button', { name: 'Reset camera', exact: true }).click()
    const canvas = page.locator('canvas')
    await canvas.scrollIntoViewIfNeeded()
    await settle()
    const before = await canvas.screenshot()
    await page.getByLabel('Apply to', { exact: true }).click()
    await page.getByRole('option', { name: '_Wings_A', exact: true }).click()
    await page.getByRole('button', { name: 'Color sample 2', exact: true }).click()
    await page.getByRole('button', { name: 'Apply selected color', exact: true }).click()
    await settle()
    const partColor = await canvas.screenshot()
    if (before.equals(partColor)) throw new Error('Per-part palette application did not change the canvas.')
    await page.screenshot({ path: path.join(output, 'part-color.png') })
    await page.getByLabel('Apply to', { exact: true }).click()
    await page.getByRole('option', { name: 'All visible parts', exact: true }).click()
    if (!(await page.getByLabel('Apply to', { exact: true }).innerText()).includes('All visible parts'))
      throw new Error('Target control displays an internal value instead of its label.')
    await page.getByRole('button', { name: 'Color sample 3', exact: true }).click()
    await page.getByRole('button', { name: 'Apply selected color', exact: true }).click()
    await settle()
    const allColor = await canvas.screenshot()
    if (allColor.equals(partColor)) throw new Error('Visible-part palette application did not change the canvas.')
    await page.screenshot({ path: path.join(output, 'all-colors.png') })
    await page.getByRole('button', { name: 'Restore model colors', exact: true }).click()
    await settle()
    if (!(await canvas.screenshot()).equals(before)) throw new Error('Original colors did not restore.')
    await page.getByLabel('Experimental color seed', { exact: true }).fill('0xFFFFFFFFFFFFFFFF')
    await page.getByRole('button', { name: 'Calculate color samples', exact: true }).click()
    await page.getByText('Calculated seed: 0xFFFFFFFFFFFFFFFF', { exact: true }).waitFor()
    await page.getByLabel('Experimental color seed', { exact: true }).fill('0xinvalid')
    await page.getByRole('button', { name: 'Calculate color samples', exact: true }).click()
    await page.getByRole('alert').waitFor()
    if (!(await page.getByRole('alert').innerText()).includes('hexadecimal')) throw new Error('Invalid seed explanation missing.')
    await select('Open palette MBIN', null)
    await select('Open palette MBIN', modelFile)
    await page.getByRole('alert').waitFor()
    if (!(await page.getByRole('alert').innerText()).includes('fingerprint')) throw new Error('Wrong palette fingerprint was accepted.')
    await page.getByLabel('Experimental color seed', { exact: true }).fill('0x7')
    await page.getByRole('button', { name: 'Calculate color samples', exact: true }).click()
    await page.getByText('Calculated seed: 0x7', { exact: true }).waitFor()
    if (await page.getByRole('alert').count()) throw new Error('Valid state was lost after a canceled or failed import.')
    await app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0]
      window.unmaximize()
      window.setSize(1024, 720)
    })
    await page.waitForFunction(() => innerWidth <= 1024 && innerWidth >= 980)
    await page.getByRole('button', { name: 'Change language', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Português (Brasil)', exact: true }).click()
    await page.getByLabel('Família de paleta', { exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(output, 'palette-pt-BR.png') })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (overflow || errors.length) throw new Error(JSON.stringify({ overflow, errors }))
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({
      paletteSha256: crypto.createHash('sha256').update(fs.readFileSync(paletteFile)).digest('hex'),
      modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelFile)).digest('hex'),
      independentPythonSeed: reference.seed, families, samples, identicalPythonResult: true,
      partColorChanged: true, allVisibleColorsChanged: true, originalColorsRestored: true,
      maximumSeedAccepted: true, malformedSeedRejected: true, badImportPreservedBank: true,
      minimumWindowViewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
      overflow, errors
    }, null, 2))
    console.log('Electron palette acceptance passed.')
  } finally { await app.close() }
}
validate().catch(error => { console.error(error); process.exitCode = 1 })
