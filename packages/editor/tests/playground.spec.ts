import { expect, test } from '@playwright/test'

test('the workbench loads four public presets with editing disabled', async ({
  page,
}) => {
  const errors: string[] = []
  const externalRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1')
      externalRequests.push(request.url())
  })
  await page.goto('/sandbox/')
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
  await expect(
    page.getByRole('heading', { name: 'Vidro Sandbox' }),
  ).toBeVisible()
  const values = await page
    .locator('.preview-slot > vidro-editor')
    .evaluateAll((editors) =>
      editors.map((editor) => ({
        preset: editor.preset,
        editable: editor.editable,
        header: editor.header,
        clipboard: editor.clipboard,
        languageSelector: editor.languageSelector,
        language: editor.language,
      })),
    )
  expect(values).toEqual(
    ['default', 'diff', 'diff-split', 'diff-list'].map((preset) => ({
      preset,
      editable: false,
      header: true,
      clipboard: true,
      languageSelector: false,
      language: 'typescript',
    })),
  )
  await expect(page.locator('.mode-label')).toHaveText([
    'Read only',
    'Read only',
    'Read only',
    'Read only',
  ])
  await expect(page.locator('.event-details > summary')).toHaveText([
    'Events · 0',
    'Events · 0',
    'Events · 0',
    'Events · 0',
  ])
  expect(
    await page
      .locator('.preview-slot > vidro-editor')
      .evaluateAll((editors) =>
        editors.map((editor) => getComputedStyle(editor).maxHeight),
      ),
  ).toEqual(['none', 'none', 'none', 'none'])
  const fileList = page.locator('#preview-diff-list')
  for (const name of ['src/greeting.ts', 'styles.css', 'README.md']) {
    const filename = fileList.getByText(name, { exact: true })
    await expect(filename).toBeVisible()
    await expect
      .poll(async () => {
        const card = await fileList.boundingBox()
        const label = await filename.boundingBox()
        return Boolean(
          card &&
            label &&
            label.y >= card.y &&
            label.y + label.height <= card.y + card.height,
        )
      })
      .toBe(true)
  }
  expect(errors).toEqual([])
  expect(externalRequests).toEqual([])
})

test('shared controls update every preview while comparisons remain read only', async ({
  page,
}) => {
  await page.goto('/sandbox/')
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
  await page.locator('#control-headerTitle').fill('Shared title')
  await page.locator('#control-language').selectOption('javascript')
  await page.locator('#control-languageSelector').check()
  await page.locator('#control-clipboard').uncheck()
  await page.getByText('Typography', { exact: true }).click()
  await page.locator('#control-fontSize').fill('16')
  await page.locator('#control-lineHeight').fill('24')
  await page.locator('#control-lineHeight').blur()
  await page.locator('#sample-icon').click()
  const shared = await page
    .locator('.preview-slot > vidro-editor')
    .evaluateAll((editors) =>
      editors.map((editor) => ({
        title: editor.headerTitle,
        language: editor.language,
        selector: editor.languageSelector,
        clipboard: editor.clipboard,
        fontSize: editor.fontSize,
        lineHeight: editor.lineHeight,
        icon: Boolean(editor.icon),
      })),
    )
  expect(shared).toEqual(
    Array.from({ length: 4 }, () => ({
      title: 'Shared title',
      language: 'javascript',
      selector: true,
      clipboard: false,
      fontSize: 16,
      lineHeight: 24,
      icon: true,
    })),
  )
  await page.locator('#control-headerTitle').fill('')
  expect(
    await page
      .locator('.preview-slot > vidro-editor')
      .evaluateAll((editors) =>
        editors.every((editor) => editor.headerTitle === undefined),
      ),
  ).toBe(true)
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('#theme-toggle')).toHaveAccessibleName(
    'Switch to light theme',
  )
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.locator('#control-editable').check()
  const editable = page.locator('#preview-default')
  const before = await editable.evaluate((editor) => editor.value)
  await editable.locator('.monaco-editor').click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('\n// edited in the sandbox')
  await expect
    .poll(() => editable.evaluate((editor) => editor.value))
    .toBe(`${before}\n// edited in the sandbox`)
  await expect(page.locator('[data-mode="default"]')).toHaveText('Editable')

  for (const preset of ['diff', 'diff-split', 'diff-list']) {
    const editor = page.locator(`#preview-${preset}`)
    const original = await editor.evaluate((element) => ({
      value: element.value,
      files: element.files,
    }))
    await editor.locator('.monaco-editor:visible:not(.gutter)').first().click()
    await page.keyboard.type('unexpected edit')
    expect(
      await editor.evaluate((element) => ({
        value: element.value,
        files: element.files,
      })),
    ).toEqual(original)
  }
  await page.locator('#reset-settings').click()
  await expect(page.locator('#control-editable')).not.toBeChecked()
  await expect(page.locator('#settings-feedback')).toBeEmpty()
})

test('source and file forms apply through their public properties', async ({
  page,
}) => {
  await page.goto('/sandbox/')
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
  const diff = page.locator('[data-preset="diff"]')
  await diff.getByText('Source inputs', { exact: true }).click()
  await diff
    .getByLabel('Original value (diff)', { exact: true })
    .fill('before\r\n')
  await diff.getByLabel('Value (diff)', { exact: true }).fill('after\n')
  await diff.getByRole('button', { name: 'Apply source', exact: true }).click()
  expect(
    await page.locator('#preview-diff').evaluate((editor) => ({
      original: editor.originalValue,
      value: editor.value,
    })),
  ).toEqual({ original: 'before\n', value: 'after\n' })
  await expect(diff.locator('.event-details > summary')).toHaveText(
    'Events · 1',
  )

  const list = page.locator('[data-preset="diff-list"]')
  await list.getByText('File inputs', { exact: true }).click()
  await list.getByLabel('File ID', { exact: true }).fill('example.json')
  await list.getByLabel('File title', { exact: true }).fill('Example JSON')
  await list.getByLabel('File language', { exact: true }).selectOption('json')
  await list
    .getByLabel('Original file value', { exact: true })
    .fill('{"before":true}')
  await list
    .getByLabel('Modified file value', { exact: true })
    .fill('{"after":true}')
  await list.getByRole('button', { name: 'Apply file', exact: true }).click()
  expect(
    await page
      .locator('#preview-diff-list')
      .evaluate((editor) => editor.files[0]),
  ).toEqual({
    id: 'example.json',
    headerTitle: 'Example JSON',
    language: 'json',
    originalValue: '{"before":true}',
    value: '{"after":true}',
  })
  await list.getByRole('button', { name: 'Add file', exact: true }).click()
  expect(
    await page
      .locator('#preview-diff-list')
      .evaluate((editor) => editor.files.length),
  ).toBe(4)
  await list.getByRole('button', { name: 'Remove file', exact: true }).click()
  expect(
    await page
      .locator('#preview-diff-list')
      .evaluate((editor) => editor.files.length),
  ).toBe(3)
  await expect(list.locator('.event-details > summary')).toHaveText(
    'Events · 0',
  )
})
