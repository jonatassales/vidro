import { expect, test } from '@playwright/test'

test('browser composition keeps user changes immediate and suspends zero-delay leave', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, (event) => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push([name, event.detail.value])
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: 'あ',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('あ')
  await page.waitForTimeout(80)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'あ'],
    ['vidro-change', 'あ'],
  ])
  await cdp.send('Input.insertText', { text: 'あ' })
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toContain('vidro-type-leave')
})

test('composition end starts a fresh quiet interval using delay changed during composition', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 300
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, (event) => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push([name, event.detail.value])
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: 'あ',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('あ')
  await editor.evaluate((element) => {
    element.debounceMs = 120
  })
  await page.waitForTimeout(240)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'あ'],
    ['vidro-change', 'あ'],
  ])
  await cdp.send('Input.insertText', { text: 'あ' })
  await page.waitForTimeout(40)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'あ'],
    ['vidro-change', 'あ'],
  ])
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toContain('vidro-type-leave')
})

test('a replacement during composition cancels the old editing session', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, (event) => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push([name, event.detail.value, event.detail.origin])
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: 'あ',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('あ')
  await editor.evaluate((element) => {
    element.value = 'replacement'
  })
  await cdp.send('Input.imeSetComposition', {
    text: '',
    selectionStart: 0,
    selectionEnd: 0,
  })
  await page.waitForTimeout(80)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'あ', 'user'],
    ['vidro-change', 'あ', 'user'],
    ['vidro-change', 'replacement', 'external'],
  ])
  expect(await editor.evaluate((element) => element.value)).toBe('replacement')
})

test('composition without a content change creates no editing session', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '0'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, () => {
        editor.dataset.events = String(Number(editor.dataset.events) + 1)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: '',
    selectionStart: 0,
    selectionEnd: 0,
  })
  await cdp.send('Input.imeSetComposition', {
    text: '',
    selectionStart: 0,
    selectionEnd: 0,
  })
  await page.waitForTimeout(80)
  expect(await editor.getAttribute('data-events')).toBe('0')
  expect(await editor.evaluate((element) => element.value)).toBe('')
})

test('removal during composition cancels pending completion and late input', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: 'あ',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('あ')
  const detached = await editor.elementHandle()
  expect(detached).not.toBeNull()
  const result = await editor.evaluate((element) => {
    element.remove()
    return { value: element.value, events: element.dataset.events }
  })
  await cdp.send('Input.imeSetComposition', {
    text: '',
    selectionStart: 0,
    selectionEnd: 0,
  })
  await cdp.send('Input.insertText', { text: 'late' })
  await page.waitForTimeout(80)
  expect(result).toEqual({
    value: 'あ',
    events: '["vidro-type-start","vidro-change"]',
  })
  expect(await detached?.evaluate((element) => element.value)).toBe('あ')
  expect(await detached?.getAttribute('data-events')).toBe(result.events)
})

test('nested start and leave listeners keep historical detail while replacement wins', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    const record = (name: string, value: string) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push({ name, value, live: editor.value })
      editor.dataset.events = JSON.stringify(events)
    }
    editor.addEventListener('vidro-type-start', (event) => {
      record('start-first', event.detail.value)
      if (event.detail.value === 'A') editor.value = 'B'
    })
    editor.addEventListener('vidro-type-start', (event) => {
      record('start-second', event.detail.value)
    })
    editor.addEventListener('vidro-change', (event) => {
      record(`change-${event.detail.origin}`, event.detail.value)
    })
    editor.addEventListener('vidro-type-leave', (event) => {
      record('leave', event.detail.value)
      editor.value = 'C'
    })
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  await page.waitForTimeout(80)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    { name: 'start-first', value: 'A', live: 'A' },
    { name: 'change-external', value: 'B', live: 'B' },
    { name: 'start-second', value: 'A', live: 'B' },
  ])
  await editor.click()
  await page.keyboard.type('D')
  await expect.poll(() => editor.getAttribute('data-events')).toContain('leave')
  const events = JSON.parse((await editor.getAttribute('data-events')) ?? '[]')
  expect(events.at(-2)).toEqual({ name: 'leave', value: 'BD', live: 'BD' })
  expect(events.at(-1)).toEqual({
    name: 'change-external',
    value: 'C',
    live: 'C',
  })
  expect(await editor.evaluate((element) => element.value)).toBe('C')
})

test('a start listener can remove and remount without continuing the old edit', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 0
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    editor.addEventListener('vidro-type-start', (event) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push(['start', event.detail.value])
      editor.dataset.events = JSON.stringify(events)
      if (editor.dataset.remounted === 'true') return
      editor.dataset.remounted = 'true'
      editor.remove()
      document.body.append(editor)
    })
    editor.addEventListener('vidro-change', (event) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push(['change', event.detail.value])
      editor.dataset.events = JSON.stringify(events)
    })
    editor.addEventListener('vidro-type-leave', (event) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push(['leave', event.detail.value])
      editor.dataset.events = JSON.stringify(events)
    })
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  await editor.evaluate((element) => element.whenReady())
  await page.waitForTimeout(80)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([['start', 'A']])
  expect(await editor.evaluate((element) => element.value)).toBe('A')
  await editor.click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('B')
  await expect.poll(() => editor.getAttribute('data-events')).toContain('leave')
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['start', 'A'],
    ['start', 'AB'],
    ['change', 'AB'],
    ['leave', 'AB'],
  ])
  expect(pageErrors).toEqual([])
})

test('configuration changes inside start use current settings without reviving stale work', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    editor.addEventListener('vidro-type-start', () => {
      editor.debounceMs = 0
      try {
        Reflect.set(editor, 'debounceMs', 'invalid')
      } catch (error) {
        editor.dataset.invalid =
          error instanceof TypeError ? 'TypeError' : 'other'
      }
      editor.fontSize = 16
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push('start')
      editor.dataset.events = JSON.stringify(events)
    })
    editor.addEventListener('vidro-change', () => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push('change')
      editor.dataset.events = JSON.stringify(events)
    })
    editor.addEventListener('vidro-type-leave', () => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push('leave')
      editor.dataset.events = JSON.stringify(events)
    })
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toBe('["start","change","leave"]')
  expect(
    await editor.evaluate((element) => ({
      debounceMs: element.debounceMs,
      fontSize: element.fontSize,
      invalid: element.dataset.invalid,
    })),
  ).toEqual({ debounceMs: 0, fontSize: 16, invalid: 'TypeError' })
})
