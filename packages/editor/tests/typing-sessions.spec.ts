import { expect, test } from '@playwright/test'

test('user edits start one session and publish one idle completion after changes', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.value = ''
    editor.dataset.sessionEvents = '[]'
    for (const name of [
      'vidro-type-start',
      'vidro-change',
      'vidro-type-leave',
    ] as const) {
      editor.addEventListener(name, (event) => {
        const events = JSON.parse(editor.dataset.sessionEvents ?? '[]')
        events.push({
          name,
          detail: event.detail,
          bubbles: event.bubbles,
          composed: event.composed,
          cancelable: event.cancelable,
        })
        editor.dataset.sessionEvents = JSON.stringify(events)
      })
    }
  })

  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('AB', { delay: 30 })
  await expect
    .poll(() => editor.getAttribute('data-session-events'))
    .toContain('vidro-change')
  const beforeIdle = JSON.parse(
    (await editor.getAttribute('data-session-events')) ?? '[]',
  )
  expect(beforeIdle).toEqual([
    {
      name: 'vidro-type-start',
      detail: { value: 'A', origin: 'user' },
      bubbles: true,
      composed: true,
      cancelable: false,
    },
    {
      name: 'vidro-change',
      detail: { value: 'A', origin: 'user' },
      bubbles: true,
      composed: true,
      cancelable: false,
    },
    {
      name: 'vidro-change',
      detail: { value: 'AB', origin: 'user' },
      bubbles: true,
      composed: true,
      cancelable: false,
    },
  ])
  await expect
    .poll(() => editor.getAttribute('data-session-events'))
    .toContain('vidro-type-leave')
  const afterIdle = JSON.parse(
    (await editor.getAttribute('data-session-events')) ?? '[]',
  )
  expect(afterIdle.at(-1)).toEqual({
    name: 'vidro-type-leave',
    detail: { value: 'AB', origin: 'user' },
    bubbles: true,
    composed: true,
    cancelable: false,
  })
  expect(afterIdle).toHaveLength(4)
})

test('a different external value or removal cancels pending completion without replay', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 80
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
  await page.keyboard.type('A')
  await editor.evaluate((element) => {
    element.value = 'replacement'
  })
  await page.waitForTimeout(160)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'A', 'user'],
    ['vidro-change', 'A', 'user'],
    ['vidro-change', 'replacement', 'external'],
  ])

  await editor.click()
  await page.keyboard.type('B')
  const events = await editor.evaluate(async (element) => {
    element.remove()
    await new Promise((resolve) => window.setTimeout(resolve, 160))
    return element.dataset.events
  })
  expect(JSON.parse(events ?? '[]')).toEqual([
    ['vidro-type-start', 'A', 'user'],
    ['vidro-change', 'A', 'user'],
    ['vidro-change', 'replacement', 'external'],
    ['vidro-type-start', 'replacementB', 'user'],
    ['vidro-change', 'replacementB', 'user'],
  ])
})

test('a start listener replacement invalidates the old user continuation', async ({
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
        if (name === 'vidro-type-start') editor.value = 'replacement'
      })
    }
  })
  await page.locator('vidro-editor').click()
  await page.keyboard.type('A')
  await page.waitForTimeout(50)
  const editor = page.locator('vidro-editor')
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'A', 'user'],
    ['vidro-change', 'replacement', 'external'],
  ])
  expect(await editor.evaluate((element) => element.value)).toBe('replacement')
})

test('zero debounce remains asynchronous and invalid configuration preserves the active session', async ({
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
    editor.addEventListener('vidro-change', (event) => {
      if (event.detail.origin !== 'user') return
      const before = editor.dataset.events
      let typeError = false
      let rangeError = false
      try {
        Reflect.set(editor, 'debounceMs', '5')
      } catch (error) {
        typeError = error instanceof TypeError
      }
      try {
        editor.debounceMs = -1
      } catch (error) {
        rangeError = error instanceof RangeError
      }
      editor.dataset.validation = JSON.stringify({
        before,
        typeError,
        rangeError,
        delay: editor.debounceMs,
      })
    })
    for (const name of ['vidro-type-start', 'vidro-type-leave'] as const) {
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  expect(
    JSON.parse((await editor.getAttribute('data-validation')) ?? '{}'),
  ).toEqual({
    before: '["vidro-type-start"]',
    typeError: true,
    rangeError: true,
    delay: 0,
  })
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toBe('["vidro-type-start","vidro-type-leave"]')
})

test('a delay change uses the last edit deadline while non-editing interaction leaves it alone', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  // Playwright's clock omits performance entries used by Monaco input telemetry.
  // Preserve that native API while controlling performance.now and all timers.
  const measurements = await page.evaluateHandle(() => ({
    mark: performance.mark.bind(performance),
    measure: performance.measure.bind(performance),
    getEntriesByName: performance.getEntriesByName.bind(performance),
    clearMarks: performance.clearMarks.bind(performance),
    clearMeasures: performance.clearMeasures.bind(performance),
  }))
  await page.clock.install({ time: new Date('2026-01-01T08:00:00Z') })
  await page.evaluate(
    (native) => Object.assign(performance, native),
    measurements,
  )
  await measurements.dispose()
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    document.body.append(editor)
    await editor.whenReady()
    editor.dataset.events = '[]'
    for (const name of ['vidro-type-start', 'vidro-type-leave'] as const) {
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  // Let Monaco initialize normally, then hold performance.now and timers still.
  await page.clock.pauseAt(new Date('2026-01-01T10:00:00Z'))
  await page.keyboard.type('A')
  expect(await editor.getAttribute('data-events')).toBe('["vidro-type-start"]')
  await page.clock.runFor(260)
  await page.keyboard.press('ArrowLeft')
  await editor.hover()
  await editor.evaluate((element) => {
    element.value = 'A'
    element.debounceMs = 600
  })
  // The rescheduled deadline is 600 ms after the edit, not after the update.
  await page.clock.runFor(339)
  expect(await editor.getAttribute('data-events')).toBe('["vidro-type-start"]')
  await page.clock.runFor(1)
  expect(await editor.getAttribute('data-events')).toBe(
    '["vidro-type-start","vidro-type-leave"]',
  )
  await page.clock.runFor(260)
  expect(await editor.getAttribute('data-events')).toBe(
    '["vidro-type-start","vidro-type-leave"]',
  )
})

test('same-value echoes preserve the session and a change listener can cancel it', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 100
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
        if (name === 'vidro-type-start') editor.value = event.detail.value
        if (name === 'vidro-change' && event.detail.value === 'AB')
          editor.value = 'replacement'
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toContain('vidro-type-leave')
  await page.keyboard.type('B')
  await page.waitForTimeout(200)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([
    ['vidro-type-start', 'A', 'user'],
    ['vidro-change', 'A', 'user'],
    ['vidro-type-leave', 'A', 'user'],
    ['vidro-type-start', 'AB', 'user'],
    ['vidro-change', 'AB', 'user'],
    ['vidro-change', 'replacement', 'external'],
  ])
})

test('debounce accepts the full integer range and rejects unsupported values without mutation', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  const result = await page.evaluate(() => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    const defaultDelay = editor.debounceMs
    editor.debounceMs = 2_147_483_647
    const failures: string[] = []
    for (const value of [-1, 0.5, NaN, Infinity, 2_147_483_648]) {
      try {
        editor.debounceMs = value
      } catch (error) {
        failures.push(error instanceof RangeError ? 'RangeError' : 'other')
      }
    }
    try {
      Reflect.set(editor, 'debounceMs', null)
    } catch (error) {
      failures.push(error instanceof TypeError ? 'TypeError' : 'other')
    }
    const retained = editor.debounceMs
    editor.debounceMs = 0
    return { defaultDelay, retained, zero: editor.debounceMs, failures }
  })
  expect(result).toEqual({
    defaultDelay: 500,
    retained: 2_147_483_647,
    zero: 0,
    failures: [
      'RangeError',
      'RangeError',
      'RangeError',
      'RangeError',
      'RangeError',
      'TypeError',
    ],
  })
})

test('another edit extends the quiet interval while focus and selection changes do not', async ({
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
    for (const name of ['vidro-type-start', 'vidro-type-leave'] as const) {
      editor.addEventListener(name, () => {
        const events = JSON.parse(editor.dataset.events ?? '[]')
        events.push(name)
        editor.dataset.events = JSON.stringify(events)
      })
    }
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.type('A')
  await page.waitForTimeout(280)
  await page.keyboard.type('B')
  await page.keyboard.press('Shift+ArrowLeft')
  await editor.hover()
  await page.mouse.wheel(0, 100)
  await page.locator('body').click({ position: { x: 2, y: 2 } })
  await page.waitForTimeout(300)
  expect(await editor.getAttribute('data-events')).toBe('["vidro-type-start"]')
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toBe('["vidro-type-start","vidro-type-leave"]')
})
