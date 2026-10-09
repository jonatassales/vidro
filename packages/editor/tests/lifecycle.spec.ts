import { expect, test } from '@playwright/test'
import type { VidroEditor } from 'vidropro'

test('readiness belongs to one connection and old settled promises keep their result', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  const result = await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    const detached = await editor.whenReady().then(
      () => 'resolved',
      (error) => error.name,
    )
    document.body.append(editor)
    const first = editor.whenReady()
    const sharedPending = first === editor.whenReady()
    await first
    const sharedReady = first === editor.whenReady()
    editor.remove()
    const oldStillResolved = await first.then(
      () => true,
      () => false,
    )
    const afterRemoval = await editor.whenReady().then(
      () => 'resolved',
      (error) => error.name,
    )
    document.body.append(editor)
    const second = editor.whenReady()
    const freshPromise = second !== first
    await second
    return {
      detached,
      sharedPending,
      sharedReady,
      oldStillResolved,
      afterRemoval,
      freshPromise,
      currentReady: second === editor.whenReady(),
    }
  })
  expect(result).toEqual({
    detached: 'InvalidStateError',
    sharedPending: true,
    sharedReady: true,
    oldStillResolved: true,
    afterRemoval: 'InvalidStateError',
    freshPromise: true,
    currentReady: true,
  })
})

test('a failed runtime asset request rejects one connection and reconnect retries from retained state', async ({
  page,
}) => {
  let failedOnce = false
  await page.route(
    /\/assets\/editor\.worker-[^/]+\.js(?:\?.*)?$/,
    async (route) => {
      if (!failedOnce) {
        failedOnce = true
        await route.abort('failed')
      } else {
        await route.continue()
      }
    },
  )
  await page.goto('/import-only.html')
  const result = await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.value = 'first'
    editor.language = 'json'
    const events: Array<{ value: string; origin: string }> = []
    editor.addEventListener('vidro-change', (event) =>
      events.push(event.detail),
    )
    document.body.append(editor)
    const failed = editor.whenReady()
    const sharedFailed = failed === editor.whenReady()
    const failure = await failed.then(
      () => ({ message: 'resolved', cause: 'none' }),
      (error) => ({
        message: error.message,
        cause:
          error.cause instanceof Error ? error.cause.name : typeof error.cause,
      }),
    )
    const stableFailure = failed === editor.whenReady()
    editor.value = 'after-failure'
    const silentBeforeSuccess = events.length === 0
    editor.remove()
    editor.value = 'detached-before-success'
    const silentDetached = events.length === 0
    document.body.append(editor)
    const retry = editor.whenReady()
    const freshPromise = retry !== failed
    await retry
    const mountedValue = editor.value
    editor.remove()
    editor.value = 'detached-after-success'
    return {
      sharedFailed,
      failure,
      stableFailure,
      silentBeforeSuccess,
      silentDetached,
      freshPromise,
      mountedValue,
      events,
    }
  })
  expect(failedOnce).toBe(true)
  expect(result).toEqual({
    sharedFailed: true,
    failure: {
      message: 'Vidro editor initialization failed',
      cause: 'TypeError',
    },
    stableFailure: true,
    silentBeforeSuccess: true,
    silentDetached: true,
    freshPromise: true,
    mountedValue: 'detached-before-success',
    events: [{ value: 'detached-after-success', origin: 'external' }],
  })
})

test('disconnect aborts pending readiness without preventing a second editor from becoming ready', async ({
  page,
}) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  const assetPattern = /\/assets\/editor\.worker-[^/]+\.js(?:\?.*)?$/
  await page.route(assetPattern, async (route) => {
    await held
    await route.continue()
  })
  await page.goto('/import-only.html')
  const request = page.waitForRequest(assetPattern)
  await page.evaluate(() => {
    const state = window as unknown as {
      editors: { first: VidroEditor; second: VidroEditor }
      firstPromise: Promise<void>
    }
    const first = document.createElement('vidro-editor')
    first.editable = true
    first.header = false
    const second = document.createElement('vidro-editor')
    second.editable = true
    second.header = false
    for (const editor of [first, second]) {
      editor.style.cssText = 'display:block;width:480px;height:240px'
      document.body.append(editor)
    }
    first.value = 'first'
    second.value = 'second'
    state.firstPromise = first.whenReady()
    state.firstPromise.then(
      () => {
        first.dataset.readyResult = 'resolved'
      },
      (error) => {
        first.dataset.readyResult = error.name
      },
    )
    second.whenReady().then(
      () => {
        second.dataset.readyResult = 'resolved'
      },
      (error) => {
        second.dataset.readyResult = error.name
      },
    )
    state.editors = { first, second }
  })
  await request
  await page.evaluate(() => {
    const state = window as unknown as {
      editors: { first: VidroEditor; second: VidroEditor }
      firstPromise: Promise<void>
    }
    state.editors.first.remove()
    void state.editors.first.whenReady().catch((error) => {
      state.editors.first.dataset.afterRemoval = error.name
    })
    document.body.append(state.editors.first)
    state.editors.first.dataset.freshPromise = String(
      state.editors.first.whenReady() !== state.firstPromise,
    )
  })
  release()
  const result = await page.evaluate(async () => {
    const state = window as unknown as {
      editors: { first: VidroEditor; second: VidroEditor }
      firstPromise: Promise<void>
    }
    const { first, second } = state.editors
    await first.whenReady()
    await second.whenReady()
    return {
      firstResult: first.dataset.readyResult,
      firstAfterRemoval: first.dataset.afterRemoval,
      firstRetryReady: first.dataset.freshPromise,
      firstValue: first.value,
      secondResult: second.dataset.readyResult,
      secondValue: second.value,
    }
  })
  expect(result).toEqual({
    firstResult: 'AbortError',
    firstAfterRemoval: 'InvalidStateError',
    firstRetryReady: 'true',
    firstValue: 'first',
    secondResult: 'resolved',
    secondValue: 'second',
  })
  const survivingEditor = page.locator('vidro-editor').first()
  await survivingEditor.click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('X')
  await expect
    .poll(() => survivingEditor.evaluate((element) => element.value))
    .toBe('secondX')
})

test('an invalid pre-registration property fails one attempt without shadowing a valid retry', async ({
  page,
}) => {
  await page.goto('/invalid-upgrade.html')
  const result = await page.evaluate(async () => {
    await customElements.whenDefined('vidro-editor')
    const editors = Array.from(document.querySelectorAll('vidro-editor'))
    const editor = editors.find((element) => element.id === 'invalid-editor')
    if (!editor) throw new Error('Editor is missing')
    const healthy = editors.find((element) => element.id === 'healthy-editor')
    if (!healthy) throw new Error('Healthy editor is missing')
    await healthy.whenReady()
    const failure = await editor.whenReady().then(
      () => 'resolved',
      (error) => ({ message: error.message, cause: error.cause?.name }),
    )
    const noShadow = !Object.hasOwn(editor, 'debounceMs')
    const retainedBeforeRetry = {
      value: editor.value,
      debounceMs: editor.debounceMs,
    }
    editor.remove()
    document.body.append(editor)
    await editor.whenReady()
    return {
      failure,
      noShadow,
      healthyValue: healthy.value,
      retainedBeforeRetry,
      afterRetry: { value: editor.value, debounceMs: editor.debounceMs },
    }
  })
  expect(result).toEqual({
    failure: {
      message: 'Vidro editor initialization failed',
      cause: 'TypeError',
    },
    noShadow: true,
    healthyValue: 'healthy',
    retainedBeforeRetry: { value: 'retained', debounceMs: 500 },
    afterRetry: { value: 'retained', debounceMs: 500 },
  })
})

test('readiness mounts the latest retained value after delayed runtime preparation', async ({
  page,
}) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  const assetPattern = /\/assets\/editor\.worker-[^/]+\.js(?:\?.*)?$/
  await page.route(assetPattern, async (route) => {
    await held
    await route.continue()
  })
  await page.goto('/import-only.html')
  const request = page.waitForRequest(assetPattern)
  await page.evaluate(() => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.value = 'obsolete'
    editor.dataset.events = '[]'
    editor.addEventListener('vidro-change', (event) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push(event.detail)
      editor.dataset.events = JSON.stringify(events)
    })
    document.body.append(editor)
  })
  await request
  await page.locator('vidro-editor').evaluate((editor) => {
    editor.value = 'latest'
    editor.language = 'json'
    editor.fontSize = 16
  })
  release()
  await page.locator('vidro-editor').evaluate((editor) => editor.whenReady())
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('X')
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('latestX')
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual([{ value: 'latestX', origin: 'user' }])
  expect(
    await editor.evaluate((element) => ({
      language: element.language,
      fontSize: element.fontSize,
    })),
  ).toEqual({ language: 'json', fontSize: 16 })
})

test('DOM moves retain public state and listeners but reset history and pending sessions', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.debounceMs = 150
    editor.fontSize = 16
    editor.value = ''
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
    document.body.append(editor)
    await editor.whenReady()
  })
  const editor = page.locator('vidro-editor')
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await editor.click()
  await page.keyboard.type('old')
  const beforeMove = JSON.parse(
    (await editor.getAttribute('data-events')) ?? '[]',
  )
  await editor.evaluate(async (element) => {
    const host = document.createElement('div')
    document.body.append(host)
    host.append(element)
    await element.whenReady()
  })
  await page.waitForTimeout(250)
  expect(
    JSON.parse((await editor.getAttribute('data-events')) ?? '[]'),
  ).toEqual(beforeMove)
  await editor.click()
  await page.keyboard.press(`${modifier}+Z`)
  expect(await editor.evaluate((element) => element.value)).toBe('old')
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('X')
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('oldX')
  await expect
    .poll(() => editor.getAttribute('data-events'))
    .toContain('vidro-type-leave')
  expect(
    await editor.evaluate((element) => ({
      value: element.value,
      debounceMs: element.debounceMs,
      fontSize: element.fontSize,
    })),
  ).toEqual({ value: 'oldX', debounceMs: 150, fontSize: 16 })
})
