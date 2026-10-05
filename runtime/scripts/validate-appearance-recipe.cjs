// Developer Electron acceptance; model assets and screenshots stay external.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { _electron: electron } = require(process.argv[5] || 'playwright')

async function validate() {
  const [modelFile, searchFile, destination] = process.argv.slice(2)
  if (!modelFile || !searchFile || !destination)
    throw new Error('Usage: node validate-appearance-recipe.cjs <model.glb> <search-report.json> <new-output-directory> [playwright-module]')
  const root = path.resolve(__dirname, '../..')
  const output = path.resolve(destination)
  if (output === root || output.startsWith(root + path.sep) || fs.existsSync(output))
    throw new Error('Output must be new and outside the repository.')
  const search = JSON.parse(fs.readFileSync(searchFile, 'utf8'))
  const recipe = search.preview_recipe
  const modelHash = crypto.createHash('sha256').update(fs.readFileSync(modelFile)).digest('hex')
  if (search.appearance_evaluator_complete !== false || recipe?.modelSha256 !== modelHash || recipe.evidence !== 'candidate')
    throw new Error('Expected a candidate search recipe for the supplied model.')
  fs.mkdirSync(output, { recursive: true })
  const mismatch = path.join(output, 'mismatch.json')
  const invalid = path.join(output, 'invalid.json')
  fs.writeFileSync(mismatch, JSON.stringify({ ...recipe, modelSha256: '0'.repeat(64) }))
  fs.writeFileSync(invalid, JSON.stringify({ ...recipe, evidence: 'verified' }))
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({
    executablePath: path.join(root, 'apps/desktop/node_modules/electron/dist/electron.exe'),
    args: [path.join(root, 'apps/desktop'), '--user-data-dir=' + path.join(output, 'profile')],
    env, timeout: 30000
  })
  const errors = []
  try {
    const page = await app.firstWindow()
    page.on('pageerror', error => errors.push(error.message))
    const select = async (button, file) => {
      await app.evaluate(({ dialog }, selected) => {
        dialog.showOpenDialog = async () => ({ canceled: !selected, filePaths: selected ? [selected] : [] })
      }, file ? path.resolve(file) : null)
      await page.getByRole('button', { name: button, exact: true }).click()
    }
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.getByRole('button', { name: 'Tool Catalog', exact: true }).click()
    await page.getByRole('link', { name: 'Model workshop', exact: true }).click()
    await select('Open GLB model', modelFile)
    await page.getByRole('checkbox').first().waitFor()
    const before = await page.locator('canvas').screenshot()
    await select('Open appearance recipe', searchFile)
    await page.getByText('Candidate seed: ' + recipe.seed, { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Apply recipe to preview', exact: true }).click()
    await page.getByText('Recipe applied to the preview', { exact: true }).waitFor()
    for (const part of recipe.parts)
      if (await page.getByRole('checkbox', { name: part.name, exact: true }).isChecked() !== part.visible)
        throw new Error('Explicit recipe visibility did not apply.')
    await settle()
    const applied = await page.locator('canvas').screenshot()
    if (before.equals(applied)) throw new Error('Recipe did not change the rendered canvas.')
    await page.screenshot({ path: path.join(output, 'recipe-applied.png'), fullPage: true })
    await select('Open appearance recipe', mismatch)
    await page.getByRole('button', { name: 'Apply recipe to preview', exact: true }).click()
    await page.getByText('The model fingerprint or mesh names do not match. No changes were applied.', { exact: true }).waitFor()
    if (!(await page.locator('canvas').screenshot()).equals(applied))
      throw new Error('Mismatching recipe changed the preview.')
    await select('Open appearance recipe', searchFile)
    await select('Open appearance recipe', invalid)
    await page.getByText('The file could not be read as a supported appearance recipe.', { exact: true }).waitFor()
    await page.getByText('Candidate seed: ' + recipe.seed, { exact: true }).waitFor()
    await select('Open appearance recipe', null)
    await page.getByText('Candidate seed: ' + recipe.seed, { exact: true }).waitFor()
    await app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0]
      window.unmaximize(); window.setSize(1024, 720)
    })
    await page.waitForFunction(() => innerWidth <= 1024 && innerWidth >= 980)
    await page.getByRole('button', { name: 'Change language', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Português (Brasil)', exact: true }).click()
    await page.getByRole('button', { name: 'Aplicar receita ao preview', exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(output, 'recipe-pt-BR.png') })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (overflow || errors.length) throw new Error(JSON.stringify({ overflow, errors }))
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ modelHash, seed: recipe.seed,
      recipeApplied: true, canvasChanged: true, mismatchPreservedPreview: true,
      invalidAndCanceledImportsPreservedRecipe: true, overflow, errors,
      nativePixelsProven: false, bindingCount: recipe.parts.length }, null, 2))
    console.log('Electron appearance recipe acceptance passed.')
  } finally { await app.close() }
}
validate().catch(error => { console.error(error); process.exitCode = 1 })
