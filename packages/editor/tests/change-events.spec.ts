import { expect, test } from '@playwright/test'

test('user edits publish an immediate canonical change through the public DOM event', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.value = ''
    editor.addEventListener('vidro-change', (event) => {
      editor.dataset.lastChange = JSON.stringify({
        detail: event.detail,
        bubbles: event.bubbles,
        composed: event.composed,
        cancelable: event.cancelable,
      })
    })
  })

  await page.locator('vidro-editor').click()
  await page.keyboard.type('x')
  await expect
    .poll(() => page.locator('vidro-editor').getAttribute('data-last-change'))
    .toBe(
      JSON.stringify({
        detail: { value: 'x', origin: 'user' },
        bubbles: true,
        composed: true,
        cancelable: false,
      }),
    )
})

test('external changes notify once after first readiness, including while detached', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  const result = await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    const direct: Array<{ value: string; origin: string }> = []
    const delegated: string[] = []
    editor.addEventListener('vidro-change', (event) =>
      direct.push(event.detail),
    )
    document.addEventListener('vidro-change', (event) =>
      delegated.push(event.detail.value),
    )
    editor.value = 'before\r\nready'
    document.body.append(editor)
    await editor.whenReady()
    const before = { direct: direct.length, delegated: delegated.length }
    editor.value = '\uFEFFé  \r\nlast\r'
    const attached = {
      value: editor.value,
      direct: direct.length,
      delegated: delegated.length,
    }
    editor.value = '\uFEFFé  \nlast\n'
    const afterCanonicalEcho = {
      value: editor.value,
      direct: direct.length,
      delegated: delegated.length,
    }
    let invalidType = false
    try {
      Reflect.set(editor, 'value', null)
    } catch (error) {
      invalidType = error instanceof TypeError
    }
    const afterInvalid = {
      value: editor.value,
      direct: direct.length,
      invalidType,
    }
    editor.remove()
    editor.value = 'detached'
    const detached = {
      value: editor.value,
      direct: direct.length,
      delegated: delegated.length,
    }
    document.body.append(editor)
    await editor.whenReady()
    return {
      before,
      attached,
      afterCanonicalEcho,
      afterInvalid,
      detached,
      afterReconnect: direct.length,
      events: direct,
    }
  })
  expect(result).toEqual({
    before: { direct: 0, delegated: 0 },
    attached: { value: '\uFEFFé  \nlast\n', direct: 1, delegated: 1 },
    afterCanonicalEcho: { value: '\uFEFFé  \nlast\n', direct: 1, delegated: 1 },
    afterInvalid: { value: '\uFEFFé  \nlast\n', direct: 1, invalidType: true },
    detached: { value: 'detached', direct: 2, delegated: 1 },
    afterReconnect: 2,
    events: [
      { value: '\uFEFFé  \nlast\n', origin: 'external' },
      { value: 'detached', origin: 'external' },
    ],
  })
})

test('Jotai draft follows immediate public changes and echoes safely', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.value = ''
  })
  await expect(page.locator('#draft')).toHaveText('')
  await page.locator('vidro-editor').click()
  await page.keyboard.type('graph')
  await expect(page.locator('#draft')).toHaveText('graph')
  await expect
    .poll(() => page.locator('vidro-editor').evaluate((editor) => editor.value))
    .toBe('graph')
})

test('a user edit preserves the BOM, Unicode, whitespace, and final-newline choice', async ({
  page,
}) => {
  await page.goto('/import-only.html')
  await page.evaluate(async () => {
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:480px;height:240px'
    editor.value = '\uFEFFa\r\n'
    document.body.append(editor)
    await editor.whenReady()
    editor.addEventListener('vidro-change', (event) => {
      editor.dataset.lastValue = event.detail.value
    })
  })
  const editor = page.locator('vidro-editor')
  await editor.click()
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  )
  await page.keyboard.type('é  ')
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('\uFEFFa\né  ')
  await expect(editor).toHaveAttribute('data-last-value', '\uFEFFa\né  ')
})

test('keyboard, cut, paste, undo, and redo changes keep user origin', async ({
  page,
}) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.value = ''
    editor.dataset.origins = ''
    editor.addEventListener('vidro-change', (event) => {
      editor.dataset.origins += `${event.detail.origin},`
    })
  })
  const editor = page.locator('vidro-editor')
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await editor.click()
  await page.keyboard.type('hello')
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('hello')
  await page.keyboard.press(`${modifier}+A`)
  await page.keyboard.press(`${modifier}+X`)
  await expect.poll(() => editor.evaluate((element) => element.value)).toBe('')
  await page.keyboard.press(`${modifier}+V`)
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('hello')
  await page.keyboard.press(`${modifier}+Z`)
  await expect.poll(() => editor.evaluate((element) => element.value)).toBe('')
  await page.keyboard.press(`${modifier}+Shift+Z`)
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('hello')
  const origins = await editor.getAttribute('data-origins')
  expect(
    origins
      ?.split(',')
      .filter(Boolean)
      .every((origin) => origin === 'user'),
  ).toBe(true)
})

test('canonical echoes preserve undo while different replacement discards old history', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.value = ''
    editor.dataset.externalCount = '0'
    editor.addEventListener('vidro-change', (event) => {
      if (event.detail.origin === 'external') {
        editor.dataset.externalCount = String(
          Number(editor.dataset.externalCount) + 1,
        )
      }
    })
  })
  const editor = page.locator('vidro-editor')
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await editor.click()
  await page.keyboard.type('old')
  await expect
    .poll(() => editor.evaluate((element) => element.value))
    .toBe('old')
  await editor.evaluate((element) => {
    element.value = 'old'
  })
  expect(await editor.getAttribute('data-external-count')).toBe('0')
  await page.keyboard.press(`${modifier}+Z`)
  await expect.poll(() => editor.evaluate((element) => element.value)).toBe('')
  await page.keyboard.type('old')
  await editor.evaluate((element) => {
    element.value = 'new'
  })
  expect(await editor.getAttribute('data-external-count')).toBe('1')
  await page.keyboard.press(`${modifier}+Z`)
  expect(await editor.evaluate((element) => element.value)).toBe('new')
})

test('nested external replacement wins without relabeling an already dispatched user snapshot', async ({
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
    const record = (
      listener: string,
      event: CustomEvent<{ value: string; origin: string }>,
    ) => {
      const events = JSON.parse(editor.dataset.events ?? '[]')
      events.push({ listener, detail: event.detail, live: editor.value })
      editor.dataset.events = JSON.stringify(events)
    }
    editor.addEventListener('vidro-change', (event) => {
      record('first', event)
      if (event.detail.origin === 'user' && event.detail.value === 'A')
        editor.value = 'B'
    })
    editor.addEventListener('vidro-change', (event) => record('second', event))
  })
  await page.locator('vidro-editor').click()
  await page.keyboard.type('A')
  await expect
    .poll(() => page.locator('vidro-editor').evaluate((editor) => editor.value))
    .toBe('B')
  const events = JSON.parse(
    (await page.locator('vidro-editor').getAttribute('data-events')) ?? '[]',
  )
  expect(events).toEqual([
    { listener: 'first', detail: { value: 'A', origin: 'user' }, live: 'A' },
    {
      listener: 'first',
      detail: { value: 'B', origin: 'external' },
      live: 'B',
    },
    {
      listener: 'second',
      detail: { value: 'B', origin: 'external' },
      live: 'B',
    },
    { listener: 'second', detail: { value: 'A', origin: 'user' }, live: 'B' },
  ])
})
