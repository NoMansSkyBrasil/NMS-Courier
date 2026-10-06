// Developer capture harness: loads one GLB in the model workshop and saves canvas screenshots from
// several orbit positions. Optional part filters select what stays visible. Outputs stay external.
const { _electron: electron } = require(process.argv[5] || 'playwright')
const fs = require('node:fs')
const path = require('node:path')

async function capture() {
  const [modelFile, destination, visible] = process.argv.slice(2)
  if (!modelFile || !destination)
    throw new Error('Usage: node capture-model-preview.cjs <model.glb> <new-output-directory> [visible-name-filter|*] [playwright-module]')
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
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1500, 1000))
    await app.evaluate(({ dialog }, filePath) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [filePath] }) }, path.resolve(modelFile))
    await page.getByRole('button', { name: 'Tool Catalog', exact: true }).click()
    await page.getByRole('link', { name: 'Model workshop', exact: true }).click()
    await page.getByRole('button', { name: 'Open GLB model', exact: true }).click()
    await page.getByRole('checkbox').first().waitFor({ timeout: 120000 })
    const parts = await page.getByRole('checkbox').count()
    if (visible && visible !== '*') {
      // Narrow the list with the workshop filter, then keep only the listed parts visible.
      await page.getByRole('button', { name: 'Hide all', exact: true }).click()
      await page.getByLabel('Visible parts', { exact: false }).fill(visible)
      const boxes = page.getByRole('checkbox')
      for (let index = 0, count = await boxes.count(); index < count; index++) await boxes.nth(index).check()
      await page.getByLabel('Visible parts', { exact: false }).fill('')
    }
    await page.getByRole('button', { name: 'Reset camera', exact: true }).click()
    const canvas = page.locator('canvas')
    await canvas.scrollIntoViewIfNeeded()
    await settle()
    const box = await canvas.boundingBox()
    const drag = async (dx, dy) => {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 10 })
      await page.mouse.up()
      await page.waitForTimeout(700)
      await settle()
    }
    await page.waitForTimeout(500)
    await canvas.screenshot({ path: path.join(output, 'view-1.png') })
    await drag(260, 0)
    await canvas.screenshot({ path: path.join(output, 'view-2.png') })
    await drag(260, 60)
    await canvas.screenshot({ path: path.join(output, 'view-3.png') })
    await drag(0, -220)
    await canvas.screenshot({ path: path.join(output, 'view-4.png') })
    await page.screenshot({ path: path.join(output, 'window.png') })
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ model: path.basename(modelFile), parts, visible: visible || '*', errors }, null, 2))
    console.log(JSON.stringify({ parts, errors }))
  } finally { await app.close() }
}
capture().catch(error => { console.error(error); process.exitCode = 1 })
