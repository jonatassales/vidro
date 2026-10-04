import { expect, test } from '@playwright/test'

test('one requested theme follows existing, new, and reconnected editors', async ({
  page,
}) => {
  await page.goto('/theme.html')
  const first = page.locator('#first')
  const second = page.locator('#second')
  await page.evaluate(async () => {
    await Promise.all(
      [...document.querySelectorAll('vidro-editor')].map((editor) =>
        editor.whenReady(),
      ),
    )
  })
  const frame = async () =>
    first.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      content: getComputedStyle(
        element.querySelector('.vidro-editor__body') as HTMLElement,
      ).backgroundColor,
      border: getComputedStyle(element).borderColor,
      radius: getComputedStyle(element).borderRadius,
    }))
  expect(await frame()).toEqual({
    background: 'rgba(0, 0, 0, 0)',
    content: 'rgba(255, 255, 255, 0.8)',
    border: 'rgb(235, 235, 235)',
    radius: '12px',
  })
  await page.locator('#dark').click()
  expect((await frame()).content).toBe('rgba(23, 23, 23, 0.8)')
  await first.click()
  expect(
    await first.evaluate((element) => getComputedStyle(element).outlineColor),
  ).toBe('rgb(138, 180, 255)')
  await second.evaluate((element) => {
    element.classList.remove('frame-override')
  })
  expect(
    await second.evaluate(
      (element) =>
        getComputedStyle(
          element.querySelector('.vidro-editor__body') as HTMLElement,
        ).backgroundColor,
    ),
  ).toBe('rgba(23, 23, 23, 0.8)')
  await page.locator('#reconnect').click()
  await second.evaluate((element) => element.whenReady())
  expect(
    await second.evaluate(
      (element) =>
        getComputedStyle(
          element.querySelector('.vidro-editor__body') as HTMLElement,
        ).backgroundColor,
    ),
  ).toBe('rgba(23, 23, 23, 0.8)')
  const third = await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:200px;height:100px'
    document.body.append(editor)
    await editor.whenReady()
    return {
      background: getComputedStyle(editor).backgroundColor,
      content: getComputedStyle(
        editor.querySelector('.vidro-editor__body') as HTMLElement,
      ).backgroundColor,
    }
  })
  expect(third).toEqual({
    background: 'rgba(0, 0, 0, 0)',
    content: 'rgba(23, 23, 23, 0.8)',
  })
})

test('dark selected before connection, invalid requests, and independent frame overrides', async ({
  page,
}) => {
  await page.goto('/theme.html?initial=dark')
  await page.evaluate(async () => {
    await Promise.all(
      [...document.querySelectorAll('vidro-editor')].map((editor) =>
        editor.whenReady(),
      ),
    )
  })
  const first = page.locator('#first')
  const second = page.locator('#second')
  const before = await page.evaluate(() =>
    [...document.querySelectorAll('vidro-editor')].map((element) => ({
      value: element.value,
      background: getComputedStyle(element).backgroundColor,
      content: getComputedStyle(
        element.querySelector('.vidro-editor__body') as HTMLElement,
      ).backgroundColor,
      border: getComputedStyle(element).borderColor,
      radius: getComputedStyle(element).borderRadius,
      shadow: getComputedStyle(element).boxShadow,
    })),
  )
  expect(before[0]).toMatchObject({
    value: '{"name":"Vidro","count":2}',
    background: 'rgba(0, 0, 0, 0)',
    content: 'rgba(23, 23, 23, 0.8)',
    border: 'rgb(51, 51, 51)',
    radius: '12px',
    shadow: 'none',
  })
  expect(before[1]).toMatchObject({
    background: 'rgb(245, 241, 255)',
    border: 'rgb(121, 40, 202)',
    radius: '20px',
  })
  await page.locator('#unsupported').click()
  await expect(page.locator('#theme-result')).toHaveText('RangeError')
  await page.locator('#wrong-type').click()
  await expect(page.locator('#theme-result')).toHaveText('TypeError')
  await first.evaluate((element) => {
    element.className = 'consumer-editor'
  })
  await expect(first).toHaveClass('consumer-editor')
  expect(
    await first.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe('rgba(0, 0, 0, 0)')
  expect(
    await second.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe('rgb(245, 241, 255)')
})

test('forced colors preserves the requested mode and overrides frame colors', async ({
  page,
}) => {
  await page.goto('/theme.html')
  await page.evaluate(async () => {
    await Promise.all(
      [...document.querySelectorAll('vidro-editor')].map((editor) =>
        editor.whenReady(),
      ),
    )
  })
  await page.emulateMedia({ forcedColors: 'active', colorScheme: 'dark' })
  const forced = await page.locator('#second').evaluate((element) => ({
    active: matchMedia('(forced-colors: active)').matches,
    background: getComputedStyle(element).backgroundColor,
    border: getComputedStyle(element).borderColor,
    backdrop: getComputedStyle(element).backdropFilter,
  }))
  expect(forced.active).toBe(true)
  expect(forced.background).not.toBe('rgb(245, 241, 255)')
  expect(forced.border).not.toBe('rgb(121, 40, 202)')
  expect(forced.backdrop).toBe('none')
  await page.locator('#first').click()
  const focus = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.outline = '2px solid Highlight'
    document.body.append(probe)
    const expected = getComputedStyle(probe).outlineColor
    probe.remove()
    const editor = document.querySelector('vidro-editor#first')
    if (!editor) throw new Error('Editor missing')
    return { actual: getComputedStyle(editor).outlineColor, expected }
  })
  expect(focus.actual).toBe(focus.expected)
  await page.locator('#dark').click()
  expect(
    await page
      .locator('#second')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe(forced.background)
  await page.emulateMedia({ forcedColors: 'none', colorScheme: 'light' })
  expect(
    await page
      .locator('#first')
      .evaluate(
        (element) =>
          getComputedStyle(
            element.querySelector('.vidro-editor__body') as HTMLElement,
          ).backgroundColor,
      ),
  ).toBe('rgba(23, 23, 23, 0.8)')
})

test('theme and frame updates preserve text, undo, and editing notifications', async ({
  page,
}) => {
  await page.goto('/theme.html')
  const first = page.locator('#first')
  const second = page.locator('#second')
  await first.evaluate(async (element) => {
    await element.whenReady()
    element.debounceMs = 1500
    element.dataset.events = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      element.addEventListener(name, () => {
        const events = JSON.parse(element.dataset.events ?? '[]')
        events.push(name)
        element.dataset.events = JSON.stringify(events)
      })
    }
  })
  const initial = await first.evaluate((element) => element.value)
  await first.click()
  await page.keyboard.type('x')
  await expect
    .poll(() => first.evaluate((element) => element.value))
    .not.toBe(initial)
  const edited = await first.evaluate((element) => element.value)
  const before = await first.getAttribute('data-events')
  expect(before).toBe('["vidro-type-start","vidro-change"]')
  await page.locator('#dark').click()
  await second.evaluate((element) => {
    element.style.setProperty('--vidro-frame-border-color', '#0070f3')
  })
  expect(await first.evaluate((element) => element.value)).toBe(edited)
  expect(await first.getAttribute('data-events')).toBe(before)
  await first.click()
  await page.keyboard.press('ControlOrMeta+z')
  await expect
    .poll(() => first.evaluate((element) => element.value))
    .toBe(initial)
  await second.click()
  expect(
    await second.evaluate((element) => getComputedStyle(element).outlineColor),
  ).toBe('rgb(121, 40, 202)')
})

test('glass surfaces preserve sharp text across presets and file layouts', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/theme.html')
  await page.evaluate(async () => {
    document.body.style.background =
      'repeating-linear-gradient(45deg, #c2dcff 0 12px, #f6d6e7 12px 24px)'
    for (const preset of [
      'default',
      'diff',
      'diff-split',
      'diff-list',
    ] as const) {
      const editor = document.createElement('vidro-editor')
      editor.id = `glass-${preset}`
      editor.preset = preset
      editor.headerTitle = preset
      editor.language = 'javascript'
      editor.languageSelector = true
      editor.originalValue = 'const message = "before"\nmessage'
      editor.value = 'const message = "Vidro"\nmessage'
      editor.files = ['one.js', 'two.js'].map((id) => ({
        id,
        originalValue: editor.originalValue,
        value: editor.value,
      }))
      editor.style.cssText =
        'width:720px;max-width:100%;height:auto;margin:16px 0'
      document.body.append(editor)
      await editor.whenReady()
    }
  })
  const editors = page.locator('vidro-editor[id^="glass-"]')
  for (const theme of ['light', 'dark'] as const) {
    await page.locator(`#${theme}`).click()
    const palette =
      theme === 'light'
        ? {
            code: 'rgba(255, 255, 255, 0.8)',
            header:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(250, 250, 250, 0.8))',
            keyword: 'rgb(209, 0, 92)',
          }
        : {
            code: 'rgba(23, 23, 23, 0.8)',
            header:
              'linear-gradient(135deg, rgba(38, 38, 38, 0.8), rgba(31, 31, 31, 0.8))',
            keyword: 'rgb(255, 92, 155)',
          }
    for (const editor of await editors.all()) {
      await editor.scrollIntoViewIfNeeded()
      const appearance = () =>
        editor.evaluate((element) => {
          const style = getComputedStyle(element)
          const layers = [
            element,
            ...element.querySelectorAll(
              '.vidro-editor__surface, .vidro-editor__body, .vidro-editor__code, .vidro-editor__file, .vidro-editor__file-content, .monaco-editor, .view-lines, .view-line, .view-line span',
            ),
          ].map((layer) => getComputedStyle(layer))
          const nativeLayers = [
            ...element.querySelectorAll(
              '.monaco-editor, .monaco-editor-background, .margin',
            ),
          ]
          const content = element.querySelector(
            element.preset === 'diff-list'
              ? '.vidro-editor__file-content:not([hidden])'
              : '.vidro-editor__body',
          )
          if (!content) throw new Error('Visible code content missing')
          return {
            background: style.backgroundColor,
            blur: style.backdropFilter,
            sharp: layers.every(
              (layer) => layer.opacity === '1' && layer.filter === 'none',
            ),
            nestedBlur: layers
              .slice(1)
              .some((layer) => layer.backdropFilter !== 'none'),
            nativeTransparent: nativeLayers.every((layer) =>
              getComputedStyle(layer).backgroundColor.endsWith(', 0)'),
            ),
            content: getComputedStyle(content).backgroundColor,
            headers: [
              ...element.querySelectorAll(
                '.vidro-editor__header, .vidro-editor__file-heading',
              ),
            ].map((header) => getComputedStyle(header).backgroundImage),
            keywords: [...element.querySelectorAll('.view-line span')]
              .filter((token) => token.textContent?.trim() === 'const')
              .map((token) => getComputedStyle(token).color),
            value: element.value,
          }
        })
      await expect.poll(appearance).toMatchObject({
        background: 'rgba(0, 0, 0, 0)',
        blur: 'blur(8px)',
        sharp: true,
        nestedBlur: false,
        nativeTransparent: true,
        content: palette.code,
        headers: expect.arrayContaining([palette.header]),
        keywords: expect.arrayContaining([palette.keyword]),
        value: 'const message = "Vidro"\nmessage',
      })
      if ((await editor.evaluate((element) => element.preset)) === 'diff-split')
        continue
      if ((await editor.evaluate((element) => element.preset)) === 'default')
        continue
      const deletedKeywords = () =>
        editor
          .locator('.view-zones .view-line span')
          .evaluateAll((tokens) =>
            tokens
              .filter((token) => token.textContent?.trim() === 'const')
              .map((token) => getComputedStyle(token).color),
          )
      await expect.poll(deletedKeywords).toContain(palette.keyword)
      await editor.evaluate((element) => {
        element.language = 'plaintext'
      })
      await expect.poll(deletedKeywords).not.toContain(palette.keyword)
      await editor.evaluate((element) => {
        element.language = 'javascript'
      })
      await expect.poll(deletedKeywords).toContain(palette.keyword)
    }
  }
  const list = page.locator('#glass-diff-list')
  await list.getByRole('button', { name: 'Expand two.js' }).click()
  await list
    .getByRole('button', { name: 'Show split comparison for two.js' })
    .click()
  await expect(
    list.getByRole('button', { name: 'Show inline comparison for two.js' }),
  ).toBeVisible()
  await list.evaluate((element) => {
    element.style.maxHeight = '200px'
  })
  await list
    .getByRole('button', { name: 'Collapse two.js' })
    .scrollIntoViewIfNeeded()
  await expect(
    list.getByRole('button', { name: 'Collapse two.js' }),
  ).toBeVisible()
  expect(
    await list.evaluate((element) => element.files.map((file) => file.value)),
  ).toEqual([
    'const message = "Vidro"\nmessage',
    'const message = "Vidro"\nmessage',
  ])
  expect(
    await list
      .locator('.vidro-editor__file-content')
      .last()
      .evaluate((content) => getComputedStyle(content).backgroundColor),
  ).toBe('rgba(23, 23, 23, 0.8)')
  expect(errors).toEqual([])
})

test('native dark editor pixels return after forced colors ends', async ({
  page,
}) => {
  await page.goto('/theme.html?initial=dark')
  const first = page.locator('#first')
  await first.evaluate(async (element) => {
    await element.whenReady()
    element.language = 'plaintext'
    element.value = 'Theme restoration'
  })
  await page.locator('#dark').click()
  const dark = await first.screenshot({ animations: 'disabled' })
  await page.emulateMedia({ forcedColors: 'active', colorScheme: 'dark' })
  const forced = await first.screenshot({ animations: 'disabled' })
  expect(forced).not.toEqual(dark)
  await page.emulateMedia({ forcedColors: 'none', colorScheme: 'light' })
  const restored = await first.screenshot({ animations: 'disabled' })
  expect(restored).toEqual(dark)
})
