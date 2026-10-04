import { expect, test } from '@playwright/test'

test('browser import registers without starting Monaco before connection', async ({
  page,
}) => {
  const assets: string[] = []
  page.on('response', (response) => {
    if (/runtime|worker/i.test(new URL(response.url()).pathname))
      assets.push(response.url())
  })
  await page.goto('/import-only.html')
  await expect(page.locator('body')).toHaveAttribute('data-registered', 'true')
  expect(assets).toEqual([])
})

test('built package registers a ready editor with canonical initial text', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')

  const result = await page.evaluate(async () => {
    await customElements.whenDefined('vidro-editor')
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    const mounted = document.querySelector('vidro-editor')
    if (!mounted) throw new Error('Vidro editor did not mount')
    await mounted.whenReady()
    return {
      defaultValue: editor.value,
      value: mounted.value,
      lightDom: mounted.shadowRoot === null && mounted.children.length > 0,
      syntheticEvents: mounted.dataset.editEvents,
      frameBorder: getComputedStyle(mounted).borderTopWidth,
    }
  })

  expect(result).toEqual({
    defaultValue: '',
    value: '\uFEFFalpha\nbeta\n',
    lightDom: true,
    syntheticEvents: '0',
    frameBorder: '1px',
  })
  expect(errors).toEqual([])
})

test('public element accepts user editing and retains text after remount', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const original = document.querySelector('vidro-editor')
    if (!original) throw new Error('Editor is missing')
    original.remove()
    const editor = document.createElement('vidro-editor')
    editor.editable = true
    editor.header = false
    editor.style.cssText = 'display:block;width:720px;height:360px'
    document.querySelector('#editor-slot')?.append(editor)
    await editor.whenReady()
  })

  await page.locator('vidro-editor').click()
  await page.keyboard.type('typed text')
  await expect
    .poll(() => page.locator('vidro-editor').evaluate((editor) => editor.value))
    .toBe('typed text')

  const remounted = await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    editor.remove()
    const detachedValue = editor.value
    document.querySelector('#editor-slot')?.append(editor)
    await editor.whenReady()
    return { detachedValue, connectedValue: editor.value }
  })
  expect(remounted).toEqual({
    detachedValue: 'typed text',
    connectedValue: 'typed text',
  })
})

test('pre-registration properties upgrade without accessor shadowing', async ({
  page,
}) => {
  await page.goto('/upgrade.html')
  await expect(page.locator('body')).toHaveAttribute('data-upgraded', 'true')
  await expect(page.locator('body')).toHaveAttribute(
    'data-detached-upgrade-value',
    '\uFEFFbefore\nregistration',
  )
  await expect(page.locator('body')).toHaveAttribute(
    'data-detached-upgrade-own-value',
    'false',
  )
  const result = await page.locator('vidro-editor').evaluate((editor) => ({
    value: editor.value,
    ownValue: Object.hasOwn(editor, 'value'),
    language: editor.language,
    aria: editor.getAttribute('aria-label'),
  }))
  expect(result.value).toBe('\uFEFFbefore\nregistration')
  expect(result.ownValue).toBe(false)
  expect(result.language).toBe('plaintext')
})

test('required package worker assets load through the consumer server', async ({
  page,
}) => {
  const workerResponses: Array<{ url: string; status: number }> = []
  const failed: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') failed.push(message.text())
  })
  page.on('response', (response) => {
    if (response.url().includes('worker')) {
      workerResponses.push({ url: response.url(), status: response.status() })
    }
  })
  page.on('requestfailed', (request) => failed.push(request.url()))
  page.on('pageerror', (error) => failed.push(error.message))
  await page.goto('/')
  await page.evaluate(async () => {
    const editor = document.querySelector('vidro-editor')
    if (!editor) throw new Error('Editor is missing')
    await editor.whenReady()
    editor.language = 'json'
    editor.value = '{"graph":true}'
  })
  await expect
    .poll(() => workerResponses.length, { timeout: 10_000 })
    .toBeGreaterThan(0)
  expect(workerResponses.every((response) => response.status === 200)).toBe(
    true,
  )
  expect(
    workerResponses.every((response) => response.url.startsWith('http://')),
  ).toBe(true)
  expect(failed).toEqual([])
})

test('configuration attributes do not initialize editors and instances own their text', async ({
  page,
}) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const first = document.createElement('vidro-editor')
    first.editable = true
    first.header = false
    const second = document.createElement('vidro-editor')
    second.editable = true
    second.header = false
    first.setAttribute('value', 'ignored')
    first.setAttribute('language', 'json')
    first.setAttribute('aria-label', 'Graph source')
    first.id = 'first'
    first.className = 'consumer-editor'
    for (const editor of [first, second]) {
      editor.style.cssText = 'display:block;width:320px;height:180px'
      document.querySelector('#editor-slot')?.append(editor)
    }
    second.value = 'second-only'
    await Promise.all([first.whenReady(), second.whenReady()])
    return {
      firstValue: first.value,
      firstLanguage: first.language,
      firstAria: first.getAttribute('aria-label'),
      firstId: first.id,
      firstClass: first.className,
      secondValue: second.value,
    }
  })
  expect(result).toEqual({
    firstValue: '',
    firstLanguage: 'plaintext',
    firstAria: 'Graph source',
    firstId: 'first',
    firstClass: 'consumer-editor',
    secondValue: 'second-only',
  })
})
