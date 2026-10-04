const {
  chromium,
  expect,
} = require('../../../packages/editor/node_modules/@playwright/test')
const { mkdir, writeFile, readFile } = require('node:fs/promises')
const { resolve } = require('node:path')
const base = process.env.WEBSITE_URL || 'http://127.0.0.1:3000'
const out = process.env.AUDIT_DIR || '/private/tmp/vidro-website-development'
;(async () => {
  await mkdir(out, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  const failures = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('favicon'))
      failures.push(`${r.status()} ${r.url()}`)
  })
  const checks = []
  async function check(name, action) {
    await action()
    checks.push(name)
    console.log('PASS', name)
  }
  try {
    await page.goto(base)
    await check('Hero editor follows its light and dark control', async () => {
      const heroFrame = page.locator('iframe[src^="/hero-editor/"]')
      const hero = page.frameLocator('iframe[src^="/hero-editor/"]')
      await hero.locator('body[data-ready=true]').waitFor({ timeout: 30000 })
      await expect
        .poll(() =>
          heroFrame.evaluate((e) => {
            const editor = e.contentDocument?.querySelector('vidro-editor')
            return editor
              ? Math.abs(e.clientHeight - editor.getBoundingClientRect().height - 4)
              : Infinity
          }),
        )
        .toBeLessThanOrEqual(2)
      const heading = await page.getByText('A clear view of your code.').boundingBox()
      const preview = await heroFrame.boundingBox()
      expect(heading && preview && preview.y > heading.y + heading.height).toBeTruthy()
      await expect(hero.locator('vidro-editor')).toHaveAttribute(
        'data-vidro-internal-theme',
        'light',
      )
      expect(await hero.locator('vidro-editor').evaluate((e) => e.language)).toBe(
        'typescript',
      )
      await page.getByRole('button', { name: 'Switch editor to dark theme' }).click()
      await expect(hero.locator('vidro-editor')).toHaveAttribute(
        'data-vidro-internal-theme',
        'dark',
      )
      await page.getByRole('button', { name: 'Switch editor to light theme' }).click()
      await expect(hero.locator('vidro-editor')).toHaveAttribute(
        'data-vidro-internal-theme',
        'light',
      )
    })
    const iframe = page.locator('iframe[src^="/playground/"]')
    await iframe.scrollIntoViewIfNeeded()
    const f = page.frameLocator('iframe[src^="/playground/"]')
    await f.locator('body[data-ready=true]').waitFor({ timeout: 30000 })
    await check('Branded editor page and section order', async () => {
      await expect(page).toHaveTitle('Vidro — A clear view of your code.')
      expect(
        await page
          .locator('main > section')
          .evaluateAll((es) => es.map((e) => e.id || 'hero')),
      ).toEqual(['hero', 'playground', 'pricing'])
      await expect(page.locator('#pricing')).toContainText('One-time purchase')
      expect(
        (await page.locator('#pricing').innerText()).replace(/\s+/g, ' '),
      ).toContain('R$ 3')
      await expect(page.locator('#pricing a')).toHaveAttribute(
        'href',
        '#playground',
      )
      expect(
        (await page.request.get(`${base}/editor-api.md`)).ok(),
      ).toBeTruthy()
    })
    await check(
      'Four public elements ready and read-only by default',
      async () => {
        expect(
          await f
            .locator('vidro-editor')
            .evaluateAll((es) =>
              es.map((e) => ({ preset: e.preset, editable: e.editable })),
            ),
        ).toEqual(
          ['default', 'diff', 'diff-split', 'diff-list'].map((preset) => ({
            preset,
            editable: false,
          })),
        )
        await f
          .locator('vidro-editor')
          .evaluateAll((es) => Promise.all(es.map((e) => e.whenReady())))
      },
    )
    if (process.env.CHECK_WATCH === '1')
      await check(
        'Editor package rebuild automatically refreshes embedded preview',
        async () => {
          await page.waitForTimeout(2000)
          const source = resolve(
            __dirname,
            '../../../packages/editor/src/index.ts',
          )
          const original = await readFile(source, 'utf8')
          try {
            await writeFile(
              source,
              original +
                '\ndocument.documentElement.dataset.watchProbe = "verified"\n',
            )
            await expect(f.locator('html')).toHaveAttribute(
              'data-watch-probe',
              'verified',
              { timeout: 30000 },
            )
          } finally {
            await writeFile(source, original)
          }
          await expect(f.locator('html')).not.toHaveAttribute(
            'data-watch-probe',
            { timeout: 30000 },
          )
          await f.locator('body[data-ready=true]').waitFor()
        },
      )
    await check(
      'Frame grows and shrinks without nested page scrolling',
      async () => {
        await page.waitForTimeout(500)
        const before = await iframe.evaluate((e) => e.clientHeight)
        await f
          .getByRole('button', { name: 'Expand styles.css', exact: true })
          .click()
        await f
          .getByRole('button', { name: 'Expand README.md', exact: true })
          .click()
        await expect
          .poll(() => iframe.evaluate((e) => e.clientHeight))
          .toBeGreaterThan(before)
        await f
          .getByRole('button', { name: 'Collapse styles.css', exact: true })
          .click()
        await f
          .getByRole('button', { name: 'Collapse README.md', exact: true })
          .click()
        await expect
          .poll(() => iframe.evaluate((e) => e.clientHeight))
          .toBe(before)
        expect(
          await iframe.evaluate((e) =>
            Math.abs(
              e.clientHeight - e.contentDocument.documentElement.scrollHeight,
            ),
          ),
        ).toBeLessThanOrEqual(1)
      },
    )
    await check(
      'Shared controls, language and header combinations',
      async () => {
        await f.locator('#control-language').selectOption('javascript')
        expect(
          await f
            .locator('vidro-editor')
            .evaluateAll((es) => es.every((e) => e.language === 'javascript')),
        ).toBeTruthy()
        await f.locator('#control-languageSelector').check()
        await expect(f.locator('#preview-default select')).toBeVisible()
        await f.locator('#control-header').uncheck()
        await expect(
          f.locator('#preview-default .vidro-editor__header'),
        ).toBeHidden()
        await expect(
          f.getByRole('button', { name: 'Expand styles.css', exact: true }),
        ).toBeVisible()
        await f.locator('#control-header').check()
        await f.locator('#reset-settings').click()
      },
    )
    await check(
      'Enabled editing emits Stone events and updates public value',
      async () => {
        await f.locator('#control-editable').check()
        const editor = f.locator('#preview-default')
        await editor.locator('.monaco-editor').click()
        await page.keyboard.press(
          process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
        )
        await page.keyboard.type('\n// web')
        await expect
          .poll(() => editor.evaluate((e) => e.value))
          .toContain('// web')
        const log = f.locator('[data-preset=default] .event-list')
        await expect(log).toContainText('vidro-type-leave', { timeout: 5000 })
        await expect(log).toContainText('vidro-type-start')
        await expect(log).toContainText('vidro-change')
      },
    )
    await check('Clipboard succeeds inside the same-origin frame', async () => {
      await f
        .locator('#preview-default')
        .getByRole('button', { name: 'Copy editor text', exact: true })
        .click()
      await expect(f.locator('#preview-default [role=status]')).toHaveText(
        'Copied to clipboard',
      )
      expect(
        await page.evaluate(() => navigator.clipboard.readText()),
      ).toContain('// web')
    })
    await check(
      'Diff-list layout toggle and expanded content work',
      async () => {
        await f
          .getByRole('button', {
            name: 'Show split comparison for src/greeting.ts',
            exact: true,
          })
          .click()
        await expect(
          f.getByRole('button', {
            name: 'Show inline comparison for src/greeting.ts',
            exact: true,
          }),
        ).toBeVisible()
        await f
          .getByRole('button', { name: 'Expand styles.css', exact: true })
          .click()
      },
    )
    await check('Theme switching updates all editor frames', async () => {
      await f.locator('#theme-toggle').click()
      await expect(f.locator('html')).toHaveAttribute('data-theme', 'dark')
      expect(
        await f
          .locator('vidro-editor')
          .evaluateAll((es) =>
            es.every((e) => getComputedStyle(e).backdropFilter === 'blur(8px)'),
          ),
      ).toBeTruthy()
      await page
        .locator('#playground')
        .screenshot({ path: `${out}/playground-dark.png` })
      await f.locator('#theme-toggle').click()
    })
    await check(
      'Forced colors keep editor controls visible and disable blur',
      async () => {
        await page.emulateMedia({ forcedColors: 'active' })
        expect(
          await f
            .locator('vidro-editor')
            .evaluateAll((es) =>
              es.every((e) => getComputedStyle(e).backdropFilter === 'none'),
            ),
        ).toBeTruthy()
        await page
          .locator('#playground')
          .screenshot({ path: `${out}/playground-forced-colors.png` })
        await page.emulateMedia({ forcedColors: 'none' })
      },
    )
    await check(
      'Locale changes persist and retain the live playground',
      async () => {
        await page.getByRole('tab', { name: 'PT-BR', exact: true }).click()
        await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
        await expect(page.locator('#pricing')).toContainText('Compra única')
        await page.reload()
        await iframe.scrollIntoViewIfNeeded()
        await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
        await f.locator('body[data-ready=true]').waitFor()
        for (const [label, locale] of [
          ['中文', 'zh'],
          ['あ', 'ja'],
          ['EN', 'en'],
        ]) {
          await page.getByRole('tab', { name: label, exact: true }).click()
          await expect(page.locator('html')).toHaveAttribute('lang', locale)
        }
      },
    )
    await page.screenshot({ path: `${out}/desktop.png`, fullPage: true })
    await check('Mobile page and iframe fit viewport', async () => {
      await page.setViewportSize({ width: 375, height: 812 })
      await iframe.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          iframe.evaluate((e) =>
            Math.abs(
              e.clientHeight - e.contentDocument.documentElement.scrollHeight,
            ),
          ),
        )
        .toBeLessThanOrEqual(1)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy()
      expect(
        await f.locator('html').evaluate((e) => e.scrollWidth <= innerWidth),
      ).toBeTruthy()
      await page.screenshot({ path: `${out}/mobile.png`, fullPage: true })
      await page
        .locator('#pricing')
        .screenshot({ path: `${out}/pricing-mobile.png` })
    })
    await check('No browser exceptions or failed resources', async () => {
      expect(errors).toEqual([])
      expect(failures).toEqual([])
    })
    await writeFile(
      `${out}/results.json`,
      JSON.stringify(
        { url: base, checks, errors, failures, date: new Date().toISOString() },
        null,
        2,
      ),
    )
    console.log(`${checks.length} website checks passed`)
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
