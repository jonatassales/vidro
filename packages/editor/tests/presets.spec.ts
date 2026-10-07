import { expect, test } from '@playwright/test'

test('pre-registration preset properties upgrade and reconnect without replay', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'upgraded'
    Object.assign(editor, {
      preset: 'diff-list',
      editable: true,
      header: false,
      headerTitle: 'Review',
      icon: '/file.svg',
      clipboard: false,
      languageSelector: true,
      language: 'typescript',
      originalValue: 'before\r\n',
      files: [{ id: 'first.ts', originalValue: 'old\r\n', value: 'new\r\n' }],
    })
    editor.dataset.events = '0'
    editor.addEventListener('vidro-change', () => {
      editor.dataset.events = String(Number(editor.dataset.events) + 1)
    })
    document.addEventListener('DOMContentLoaded', () =>
      document.body.append(editor),
    )
  })
  await page.goto('/import-only.html')
  const result = await page.locator('#upgraded').evaluate(async (editor) => {
    await editor.whenReady()
    const keys = [
      'preset',
      'editable',
      'header',
      'headerTitle',
      'icon',
      'clipboard',
      'languageSelector',
      'originalValue',
      'files',
    ]
    const own = keys.filter((key) => Object.hasOwn(editor, key))
    const initial = {
      preset: editor.preset,
      editable: editor.editable,
      header: editor.header,
      headerTitle: editor.headerTitle,
      clipboard: editor.clipboard,
      languageSelector: editor.languageSelector,
      originalValue: editor.originalValue,
      files: editor.files,
    }
    editor.remove()
    document.body.append(editor)
    await editor.whenReady()
    return { own, initial, events: editor.dataset.events, files: editor.files }
  })
  expect(result.own).toEqual([])
  expect(result.initial).toMatchObject({
    preset: 'diff-list',
    editable: true,
    header: false,
    headerTitle: 'Review',
    clipboard: false,
    languageSelector: true,
    originalValue: 'before\n',
  })
  expect(result.files).toEqual([
    { id: 'first.ts', originalValue: 'old\n', value: 'new\n' },
  ])
  expect(result.events).toBe('0')
})

test('new properties validate atomically and retain independent file snapshots', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  const result = await page.evaluate(() => {
    const editor = document.createElement('vidro-editor')
    editor.title = 'Native tooltip'
    editor.headerTitle = 'Visible title'
    editor.originalValue = 'old\r\ntext'
    const input = [
      {
        id: 'file.ts',
        originalValue: 'a\r\nb',
        value: 'c\rd',
        language: 'typescript' as const,
      },
    ]
    editor.files = input
    input[0].value = 'mutated by caller'
    const errors: string[] = []
    for (const [key, value] of [
      ['editable', 'true'],
      ['header', 1],
      ['clipboard', null],
      ['languageSelector', 0],
      ['preset', 'unknown'],
      ['headerTitle', 12],
      ['icon', {}],
      ['originalValue', null],
      ['language', 'python'],
      ['files', {}],
      [
        'files',
        [
          { id: 'same', originalValue: '', value: '' },
          { id: 'same', originalValue: '', value: '' },
        ],
      ],
      [
        'files',
        [{ id: 'invalid', originalValue: '', value: '', language: 'rust' }],
      ],
    ] as const) {
      try {
        Reflect.set(editor, key, value)
      } catch (error) {
        errors.push((error as Error).name)
      }
    }
    return {
      errors,
      files: editor.files,
      originalValue: editor.originalValue,
      title: editor.title,
      headerTitle: editor.headerTitle,
      editable: editor.editable,
      header: editor.header,
      clipboard: editor.clipboard,
      languageSelector: editor.languageSelector,
    }
  })
  expect(result.errors).toEqual([
    'TypeError',
    'TypeError',
    'TypeError',
    'TypeError',
    'RangeError',
    'TypeError',
    'TypeError',
    'TypeError',
    'RangeError',
    'TypeError',
    'RangeError',
    'RangeError',
  ])
  expect(result.files).toEqual([
    {
      id: 'file.ts',
      originalValue: 'a\nb',
      value: 'c\nd',
      language: 'typescript',
    },
  ])
  expect(result).toMatchObject({
    originalValue: 'old\ntext',
    title: 'Native tooltip',
    headerTitle: 'Visible title',
    editable: false,
    header: true,
    clipboard: true,
    languageSelector: false,
  })
})

test('default is read only until editing is explicitly enabled', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  const defaults = await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.value = 'hello'
    document.body.append(editor)
    await editor.whenReady()
    return { editable: editor.editable, preset: editor.preset }
  })
  expect(defaults).toEqual({ editable: false, preset: 'default' })
  const subject = page.locator('#subject')
  await subject.getByText('hello', { exact: true }).click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('!')
  expect(await subject.evaluate((editor) => editor.value)).toBe('hello')
  await subject.evaluate((editor) => {
    editor.editable = true
  })
  await subject.getByText('hello', { exact: true }).click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowRight' : 'End',
  )
  await page.keyboard.type('!')
  await expect
    .poll(() => subject.evaluate((editor) => editor.value))
    .toBe('hello!')
})

test('header controls copy modified text and select syntax without edit events', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          if (document.body.dataset.copyFail)
            throw new DOMException('Denied', 'NotAllowedError')
          document.body.dataset.copied = value
        },
      },
    })
  })
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.headerTitle = '<example.ts>'
    editor.title = 'Native tooltip'
    editor.languageSelector = true
    editor.value = 'const modified = true'
    editor.originalValue = 'const original = false'
    editor.dataset.events = '0'
    for (const name of ['vidro-change', 'vidro-type-start', 'vidro-type-leave'])
      editor.addEventListener(name, () => {
        editor.dataset.events = String(Number(editor.dataset.events) + 1)
      })
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  await expect(editor.getByText('<example.ts>', { exact: true })).toBeVisible()
  await expect(editor).toHaveAttribute('title', 'Native tooltip')
  await editor.evaluate((e) => {
    e.icon = 'data:image/png;base64,broken'
  })
  const icon = editor.locator('.vidro-editor__icon')
  await expect(icon.getByText('<>', { exact: true })).toBeVisible()
  await expect(icon).toHaveCSS('width', '18px')
  const select = editor.getByRole('combobox', { name: 'Editor language' })
  expect(
    await select
      .locator('option')
      .evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      ),
  ).toEqual([
    'plaintext',
    'json',
    'javascript',
    'typescript',
    'html',
    'css',
    'markdown',
  ])
  await select.selectOption('typescript')
  await expect(icon.getByText('<>', { exact: true })).toBeVisible()
  expect(await editor.evaluate((e) => e.language)).toBe('typescript')
  for (const preset of ['default', 'diff', 'diff-split'] as const) {
    await editor.evaluate((e, preset) => {
      e.preset = preset
      e.editable = true
    }, preset)
    await editor.getByRole('button', { name: 'Copy editor text' }).click()
    await expect(page.locator('body')).toHaveAttribute(
      'data-copied',
      'const modified = true',
    )
    await expect(editor.getByRole('status')).toHaveText('Copied to clipboard')
  }
  await page.evaluate(() => {
    document.body.dataset.copyFail = 'true'
  })
  await editor.getByRole('button', { name: 'Copy editor text' }).click()
  await expect(editor.getByRole('status')).toHaveText(
    'Could not copy to clipboard',
  )
  await editor.evaluate((e) => {
    e.header = false
  })
  await expect(editor.getByRole('combobox')).toHaveCount(0)
  await expect(
    editor.getByRole('button', { name: 'Copy editor text' }),
  ).toHaveCount(0)
  await expect(editor).toHaveAttribute('data-events', '0')
})

test('diff list supports multiple expansions, local language, counts, and per-file copy', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          document.body.dataset.copied = value
        },
      },
    })
  })
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.preset = 'diff-list'
    editor.editable = true
    editor.languageSelector = true
    editor.language = 'javascript'
    editor.files = [
      { id: 'first.ts', originalValue: 'a\nb\n', value: 'a\nc\nd\n' },
      {
        id: 'added.md',
        originalValue: '',
        value: '# hello\n',
        language: 'markdown',
      },
      {
        id: 'large.txt',
        headerTitle: '',
        originalValue: Array.from(
          { length: 1500 },
          (_, i) => `before ${i}`,
        ).join('\n'),
        value: Array.from({ length: 1500 }, (_, i) => `after ${i}`).join('\n'),
      },
    ]
    editor.dataset.events = '0'
    for (const name of ['vidro-change', 'vidro-type-start', 'vidro-type-leave'])
      editor.addEventListener(name, () => {
        editor.dataset.events = String(Number(editor.dataset.events) + 1)
      })
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  await expect(
    editor.getByRole('button', { name: 'Collapse first.ts' }),
  ).toHaveAttribute('aria-expanded', 'true')
  await editor.getByRole('button', { name: 'Expand added.md' }).click()
  await expect(
    editor.getByRole('button', { name: 'Collapse added.md' }),
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(
    editor.getByRole('button', { name: 'Collapse first.ts' }),
  ).toBeVisible()
  await expect(
    editor.getByLabel('2 added lines, 1 deleted line', { exact: true }),
  ).toBeVisible()
  await expect(
    editor.getByLabel('1 added line, 0 deleted lines', { exact: true }),
  ).toBeVisible()
  await expect(
    editor.getByLabel('1,500 added lines, 1,500 deleted lines', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    editor.getByRole('button', { name: 'Expand large.txt' }),
  ).toBeVisible()
  await editor
    .getByRole('button', { name: 'Show split comparison for first.ts' })
    .click()
  await expect(
    editor.getByRole('button', { name: 'Show inline comparison for first.ts' }),
  ).toBeVisible()
  const fileLanguage = editor.getByRole('combobox', {
    name: 'Language for first.ts',
  })
  await fileLanguage.focus()
  await fileLanguage.selectOption('typescript')
  await expect(fileLanguage).toBeFocused()
  expect(
    await editor.evaluate((e) => ({
      language: e.language,
      file: e.files[0].language,
    })),
  ).toEqual({ language: 'javascript', file: 'typescript' })
  await editor
    .getByRole('button', { name: 'Copy added.md modified text' })
    .click()
  await expect(page.locator('body')).toHaveAttribute('data-copied', '# hello\n')
  await editor.evaluate((e) => {
    e.header = false
  })
  await expect(editor.getByRole('combobox')).toHaveCount(0)
  await expect(editor.getByRole('button', { name: /^Copy / })).toHaveCount(0)
  await editor.getByRole('button', { name: 'Collapse first.ts' }).click()
  await expect(
    editor.getByRole('button', { name: 'Expand first.ts' }),
  ).toBeVisible()
  await expect(editor).toHaveAttribute('data-events', '0')
  const retained = await editor.evaluate(async (e) => {
    e.remove()
    document.body.append(e)
    await e.whenReady()
    return e.files
  })
  expect(retained[0].language).toBe('typescript')
  await expect(
    editor.getByRole('button', { name: 'Collapse first.ts' }),
  ).toBeVisible()
})

test('single-document preset switches retain undo and a pending completion while diffs stay read only', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.value = 'one'
    editor.originalValue = 'zero'
    editor.editable = true
    editor.debounceMs = 300
    editor.dataset.events = '[]'
    for (const name of ['vidro-change', 'vidro-type-start', 'vidro-type-leave'])
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  await editor.getByText('one', { exact: true }).click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowRight' : 'End',
  )
  await page.keyboard.type('!')
  await expect.poll(() => editor.evaluate((e) => e.value)).toBe('one!')
  for (const preset of ['diff', 'diff-split'] as const) {
    await editor.evaluate((e, preset) => {
      e.preset = preset
    }, preset)
    await expect
      .poll(() =>
        editor
          .getByText('1', { exact: true })
          .filter({ visible: true })
          .count(),
      )
      .toBeGreaterThan(0)
    await editor.getByText('one!', { exact: true }).click({ force: true })
    await page.keyboard.type('Z')
    expect(await editor.evaluate((e) => e.value)).toBe('one!')
  }
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toBe('["vidro-type-start","vidro-change","vidro-type-leave"]')
  await editor.evaluate((e) => {
    e.preset = 'default'
  })
  await editor.getByText('one!', { exact: true }).click({ force: true })
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => editor.evaluate((e) => e.value)).toBe('one')
  expect(errors).toEqual([])
})

test('entering the list from an editing callback cancels the old session safely', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.value = 'one'
    editor.editable = true
    editor.debounceMs = 20
    editor.files = [{ id: 'review.txt', originalValue: 'old', value: 'new' }]
    editor.dataset.events = '[]'
    for (const name of ['vidro-change', 'vidro-type-start', 'vidro-type-leave'])
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    editor.addEventListener(
      'vidro-type-start',
      () => {
        editor.preset = 'diff-list'
      },
      { once: true },
    )
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  await editor.getByText('one', { exact: true }).click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowRight' : 'End',
  )
  await page.keyboard.type('!')
  await expect(
    editor.getByRole('button', { name: 'Collapse review.txt' }),
  ).toBeVisible()
  await page.waitForTimeout(100)
  expect(await editor.evaluate((e) => e.value)).toBe('one!')
  await expect(editor).toHaveAttribute('data-events', '["vidro-type-start"]')
  expect(errors).toEqual([])
})

test('cards fit changed content and honor explicit height and max-height constraints', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.value = 'short'
    editor.style.width = '700px'
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  const height = () => editor.evaluate((e) => e.getBoundingClientRect().height)
  await expect.poll(height).toBeGreaterThan(45)
  await expect.poll(height).toBeLessThan(180)
  const short = await height()
  await editor.evaluate((e) => {
    e.value = Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n')
  })
  await expect.poll(height).toBeGreaterThan(short + 600)
  await editor.evaluate((e) => {
    e.style.maxHeight = '180px'
  })
  await expect.poll(height).toBe(180)
  await editor.getByText('line 0', { exact: true }).click({ force: true })
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await expect(editor.getByText('line 39', { exact: true })).toBeInViewport()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowUp' : 'Control+Home',
  )
  await editor.hover()
  const firstLine = editor.getByText('line 0', { exact: true })
  const initialTop = await firstLine.evaluate(
    (line) => line.getBoundingClientRect().top,
  )
  await page.mouse.wheel(0, 800)
  await expect
    .poll(async () =>
      (await firstLine.count())
        ? firstLine.evaluate((line) => line.getBoundingClientRect().top)
        : Number.NEGATIVE_INFINITY,
    )
    .toBeLessThan(initialTop)
  // Monaco normalizes a large wheel delta; exercise repeated ordinary gestures.
  for (let gesture = 0; gesture < 20; gesture++) {
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(30)
  }
  await expect(editor.getByText('line 39', { exact: true })).toBeInViewport()
  await editor.evaluate((e) => {
    e.style.maxHeight = ''
    e.style.height = '220px'
  })
  await expect.poll(height).toBe(220)
  await editor.evaluate((e) => {
    e.style.height = ''
    e.value = 'short'
  })
  await expect.poll(height).toBeLessThan(180)
  for (const preset of ['diff', 'diff-split'] as const) {
    await editor.evaluate((e, preset) => {
      e.preset = preset
      e.originalValue = Array.from(
        { length: 35 },
        (_, i) => `deleted ${i}`,
      ).join('\n')
      e.value = 'replacement'
    }, preset)
    await expect.poll(height).toBeGreaterThan(600)
    await editor.evaluate((e) => {
      e.style.maxHeight = '240px'
    })
    await expect.poll(height).toBe(240)
    await editor.evaluate((e) => {
      e.style.maxHeight = ''
    })
  }
  expect(errors).toEqual([])
})

test('a constrained file list scrolls past an expanded comparison', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.id = 'subject'
    editor.preset = 'diff-list'
    editor.style.cssText = 'display:block;width:700px;max-height:200px'
    editor.files = [
      {
        id: 'long.txt',
        originalValue: '',
        value: Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n'),
      },
      { id: 'last.txt', originalValue: 'before', value: 'after' },
    ]
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('#subject')
  const last = editor.getByRole('button', { name: 'Expand last.txt' })
  await expect(last).not.toBeInViewport()
  await editor.hover({ position: { x: 80, y: 130 } })
  for (let gesture = 0; gesture < 10; gesture++) {
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(30)
  }
  await expect(last).toBeInViewport()
  await last.click()
  await expect(
    editor.getByRole('button', { name: 'Collapse last.txt' }),
  ).toBeVisible()
})
