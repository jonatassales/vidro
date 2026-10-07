import { expect, test } from '@playwright/test'

type Locale = 'en' | 'pt-BR' | 'zh' | 'ja' | 'vi'
const cases = [
  {
    locale: 'en',
    copy: 'Copy editor text',
    success: 'Copied to clipboard',
    failure: 'Could not copy to clipboard',
    counts: ['0 changed files', '1 changed file', '2 changed files'],
    expand: 'Expand one.ts',
    collapse: 'Collapse one.ts',
    plain: 'Plain text',
    text: 'Editor text',
    added: '2 added lines, 1 deleted line',
    total: '2 added lines, 1 deleted line total',
    split: 'Split',
    monaco: 'en',
    complete: true,
  },
  {
    locale: 'pt-BR',
    copy: 'Copiar texto do editor',
    success: 'Copiado para a área de transferência',
    failure: 'Não foi possível copiar para a área de transferência',
    counts: [
      '0 arquivos alterados',
      '1 arquivo alterado',
      '2 arquivos alterados',
    ],
    expand: 'Expandir one.ts',
    collapse: 'Recolher one.ts',
    plain: 'Texto simples',
    text: 'Texto do editor',
    added: '2 linhas adicionadas, 1 linha excluída',
    total: 'Total: 2 linhas adicionadas, 1 linha excluída',
    split: 'Diff lado a lado',
    monaco: 'pt-BR',
    complete: true,
  },
  {
    locale: 'zh',
    copy: '复制编辑器文本',
    success: '已复制到剪贴板',
    failure: '无法复制到剪贴板',
    counts: ['0 个已更改文件', '1 个已更改文件', '2 个已更改文件'],
    expand: '展开 one.ts',
    collapse: '折叠 one.ts',
    plain: '纯文本',
    text: '编辑器文本',
    added: '新增 2 行，删除 1 行',
    total: '共新增 2 行，删除 1 行',
    split: '并排对比',
    monaco: 'zh',
    complete: true,
  },
  {
    locale: 'ja',
    copy: 'エディターのテキストをコピー',
    success: 'クリップボードにコピーしました',
    failure: 'クリップボードにコピーできませんでした',
    counts: ['0 件の変更ファイル', '1 件の変更ファイル', '2 件の変更ファイル'],
    expand: 'one.ts を展開',
    collapse: 'one.ts を折りたたむ',
    plain: 'プレーンテキスト',
    text: 'エディターのテキスト',
    added: '2 行追加、1 行削除',
    total: '合計：2 行追加、1 行削除',
    split: '左右比較',
    monaco: 'ja',
    complete: true,
  },
  {
    locale: 'vi',
    copy: 'Sao chép văn bản trong trình soạn thảo',
    success: 'Đã sao chép vào bộ nhớ tạm',
    failure: 'Không thể sao chép vào bộ nhớ tạm',
    counts: ['0 tệp đã thay đổi', '1 tệp đã thay đổi', '2 tệp đã thay đổi'],
    expand: 'Mở rộng one.ts',
    collapse: 'Thu gọn one.ts',
    plain: 'Văn bản thuần',
    text: 'Văn bản trong trình soạn thảo',
    added: 'thêm 2 dòng, xóa 1 dòng',
    total: 'Tổng cộng: thêm 2 dòng, xóa 1 dòng',
    split: 'So sánh cạnh nhau',
    monaco: 'vi',
    complete: true,
  },
] as const

for (const item of cases) {
  test(`${item.locale}: public locale API, all presets, clipboard and dynamic counts`, async ({
    page,
  }) => {
    await page.goto(`/localization.html?locale=${item.locale}`)
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
    const editor = page.locator('vidro-editor')
    await expect(editor.locator('option[value="plaintext"]')).toHaveText(
      item.plain,
    )
    await expect(
      editor.getByRole('textbox', { name: item.text, exact: true }),
    ).toHaveAttribute('aria-label', new RegExp(item.text))
    expect(await editor.evaluate((el) => el.localizationStatus)).toEqual({
      uiLocale: item.locale,
      monacoLocale: item.monaco,
      complete: item.complete,
    })
    expect(await editor.evaluate((el) => el.language)).toBe('typescript')
    // A real keyboard edit still reaches the consumer through the public value API.
    await editor.getByRole('textbox', { name: item.text, exact: true }).focus()
    await page.keyboard.press('End')
    await page.keyboard.type(' // local')
    await expect
      .poll(() => editor.evaluate((el) => el.value))
      .toContain('// local')
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            document.body.dataset.copied = text
          },
        },
      }),
    )
    await page.getByRole('button', { name: item.copy, exact: true }).click()
    await expect(editor.getByRole('status')).toHaveText(item.success)
    await expect(page.locator('body')).toHaveAttribute('data-copied', /local/)
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('denied')
          },
        },
      }),
    )
    await page.getByRole('button', { name: item.copy, exact: true }).click()
    await expect(editor.getByRole('status')).toHaveText(item.failure)
    for (const preset of ['diff', 'diff-split'] as const) {
      await editor.evaluate((el, next) => {
        el.preset = next
      }, preset)
      await expect(editor.locator('.monaco-diff-editor')).toBeVisible()
    }
    await editor.evaluate((el) => {
      el.preset = 'diff-list'
    })
    await expect(editor.locator('.vidro-editor__header-title')).toHaveText(
      item.counts[1],
    )
    await expect(editor.locator('.vidro-editor__file-count')).toHaveAttribute(
      'aria-label',
      item.added,
    )
    await expect(editor.locator('.vidro-editor__total-count')).toHaveAttribute(
      'aria-label',
      item.total,
    )
    await page.getByRole('button', { name: item.collapse, exact: true }).click()
    await page.getByRole('button', { name: item.expand, exact: true }).click()
    await editor.locator('.vidro-editor__layout-button').click()
    await expect(editor.locator('.vidro-editor__layout-button')).toHaveText(
      item.split,
    )
    await editor.evaluate((el) => {
      el.files = [...el.files, { ...el.files[0], id: 'two.ts' }]
    })
    await expect(editor.locator('.vidro-editor__header-title')).toHaveText(
      item.counts[2],
    )
    await editor.evaluate((el) => {
      el.files = []
    })
    await expect(editor.locator('.vidro-editor__header-title')).toHaveText(
      item.counts[0],
    )
  })
}

test('invalid and connected locale mutations fail without changing the programming language', async ({
  page,
}) => {
  await page.goto('/localization.html')
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
  const result = await page.locator('vidro-editor').evaluate((el) => {
    let invalid = '',
      connected = ''
    try {
      el.uiLocale = 'xx' as Locale
    } catch (error) {
      invalid = (error as Error).name
    }
    try {
      el.uiLocale = 'ja'
    } catch (error) {
      connected = (error as Error).name
    }
    return { invalid, connected, locale: el.uiLocale, language: el.language }
  })
  expect(result).toEqual({
    invalid: 'RangeError',
    connected: 'InvalidStateError',
    locale: 'en',
    language: 'typescript',
  })
})

test('a conflicting document locale rejects readiness without disturbing the first editor', async ({
  page,
}) => {
  await page.goto('/localization.html?locale=zh')
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
  const result = await page.evaluate(async () => {
    const first = document.querySelector('vidro-editor')
    if (!first) throw new Error('Fixture editor is missing')
    const other = document.createElement('vidro-editor')
    other.uiLocale = 'ja'
    document.body.append(other)
    let rejected = false
    try {
      await other.whenReady()
    } catch {
      rejected = true
    }
    other.remove()
    await first.whenReady()
    return { rejected, language: first.language, locale: first.uiLocale }
  })
  expect(result).toEqual({
    rejected: true,
    language: 'typescript',
    locale: 'zh',
  })
})

const monacoLabels = {
  en: { find: 'Find', copy: 'Copy' },
  'pt-BR': { find: 'Localizar', copy: 'Copiar' },
  zh: { find: '查找', copy: '复制' },
  ja: { find: '検索', copy: 'コピー' },
  vi: { find: 'Tìm', copy: 'Sao chép' },
} as const
for (const item of cases) {
  test(`${item.locale}: Monaco Find, command palette and context menu are localized`, async ({
    page,
  }) => {
    await page.goto(`/localization.html?locale=${item.locale}`)
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true')
    const labels = monacoLabels[item.locale]
    const textbox = page.getByRole('textbox', { name: item.text, exact: true })
    await textbox.focus()
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+f' : 'Control+f',
    )
    await expect(
      page.getByRole('textbox', { name: labels.find, exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await textbox.focus()
    await page.keyboard.press('F1')
    const command = page.locator('.quick-input-widget input')
    await expect(command).toBeVisible()
    await command.fill(`>${labels.copy}`)
    await expect(
      page.getByRole('option').filter({ hasText: labels.copy }).first(),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await page.locator('.view-line').first().click({ button: 'right' })
    await expect(
      page
        .locator('.context-view .action-label')
        .getByText(labels.copy, { exact: true })
        .first(),
    ).toBeVisible()
  })
}
