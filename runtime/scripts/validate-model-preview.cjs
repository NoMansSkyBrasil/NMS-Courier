// Developer acceptance harness; reference models and screenshots stay external.
const { _electron: electron } = require(process.argv[5] || 'playwright')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

async function validate() {
  const [modelFile, unsupportedFile, destination] = process.argv.slice(2)
  if (!modelFile || !unsupportedFile || !destination)
    throw new Error('Usage: node validate-model-preview.cjs <Royal.glb> <unsupported.glb> <new-output-directory> [playwright-module]')
  const root = path.resolve(__dirname, '../..')
  const output = path.resolve(destination)
  if (output === root || output.startsWith(root + path.sep) || fs.existsSync(output))
    throw new Error('Output must be new and outside the repository.')
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
    const capture = name => page.screenshot({ path: path.join(output, name + '.png') })
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const select = async file => {
      await app.evaluate(({ dialog }, filePath) => { dialog.showOpenDialog = async () => ({ canceled: !filePath, filePaths: filePath ? [filePath] : [] }) }, file ? path.resolve(file) : null)
      await page.getByRole('button', { name: 'Open GLB model', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Tool Catalog', exact: true }).click()
    await page.getByRole('link', { name: 'Model workshop', exact: true }).click()
    await page.getByRole('button', { name: 'Open GLB model', exact: true }).waitFor()
    await capture('empty')
    await select(modelFile)
    await page.getByRole('checkbox').first().waitFor({ timeout: 30000 })
    const parts = await page.getByRole('checkbox').count()
    if (parts !== 13 || await page.getByRole('alert').count()) throw new Error('Royal reference did not load 13 meshes.')
    await page.getByRole('button', { name: 'Hide all', exact: true }).click()
    for (const name of ['_SClassShip_Royal', '_Engine_A', '_Thruster_1', '_Wings_A', '_TopWing_A'])
      await page.getByRole('checkbox', { name, exact: true }).check()
    await page.getByRole('button', { name: 'Reset camera', exact: true }).click()
    await page.locator('canvas').scrollIntoViewIfNeeded()
    await settle()
    await capture('royal')
    const before = await page.locator('canvas').screenshot()
    await page.getByLabel('Preview tint', { exact: true }).fill('#e11d48')
    await settle()
    const after = await page.locator('canvas').screenshot()
    if (before.equals(after)) throw new Error('Tint did not change the rendered canvas.')
    await capture('royal-tint')
    await page.getByRole('button', { name: 'Restore model colors', exact: true }).click()
    await page.getByLabel('Visible parts', { exact: false }).fill('_Wings')
    const filterMatches = await page.getByRole('checkbox').count()
    if (filterMatches !== 3) throw new Error('Part filter did not return three wing alternatives.')
    await page.getByLabel('Visible parts', { exact: false }).fill('')
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 40, { steps: 8 })
    await page.mouse.up()
    await settle()
    const rotated = await canvas.screenshot()
    if (before.equals(rotated)) throw new Error('Orbit did not change the rendered canvas.')
    await page.mouse.wheel(0, -200)
    await settle()
    const zoomed = await canvas.screenshot()
    if (rotated.equals(zoomed)) throw new Error('Zoom did not change the rendered canvas.')
    await select(null)
    if (await page.getByRole('checkbox').count() !== 13) throw new Error('Cancel discarded the model.')
    await select(unsupportedFile)
    await page.getByRole('alert').waitFor()
    if (!(await page.getByRole('alert').innerText()).includes('textures')) throw new Error('Unsupported model rejection missing.')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (overflow || errors.length) throw new Error(JSON.stringify({ overflow, errors }))
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1024, 720))
    await settle()
    await capture('narrow')
    const narrowOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (narrowOverflow) throw new Error('Minimum desktop window overflows horizontally.')
    await page.getByRole('button', { name: 'Change language', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Português (Brasil)', exact: true }).click()
    await page.getByText('Oficina de modelos', { exact: true }).first().waitFor()
    await capture('narrow-pt-BR')
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({
      modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelFile)).digest('hex'),
      parts, filterMatches, tintChanged: true, zoomChanged: true, cancelPreservedModel: true,
      unsupportedModelRejected: true, overflow, narrowOverflow, errors
    }, null, 2))
    console.log('Electron preview acceptance passed.')
  } finally { await app.close() }
}
validate().catch(error => { console.error(error); process.exitCode = 1 })
