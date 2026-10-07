/** UI locale is independent of the programming language selected by `language`. */
export type VidroUiLocale = 'en' | 'pt-BR' | 'zh' | 'ja' | 'vi'

export interface VidroLocalizationStatus {
  readonly uiLocale: VidroUiLocale
  readonly monacoLocale: Exclude<VidroUiLocale, 'vi' | 'pt-BR'>
  readonly complete: boolean
}

export function localizationStatus(
  uiLocale: VidroUiLocale,
): VidroLocalizationStatus {
  return Object.freeze({
    uiLocale,
    monacoLocale: uiLocale === 'vi' || uiLocale === 'pt-BR' ? 'en' : uiLocale,
    complete: uiLocale !== 'vi' && uiLocale !== 'pt-BR',
  })
}

export function requiredUiLocale(
  value: unknown,
): asserts value is VidroUiLocale {
  if (typeof value !== 'string')
    throw new TypeError('uiLocale must be a string')
  if (!['en', 'pt-BR', 'zh', 'ja', 'vi'].includes(value))
    throw new RangeError('Unsupported Vidro UI locale')
}

type Copy = {
  plainText: string
  documentIcon: string
  editorLanguage: string
  editorText: string
  originalText: string
  modifiedText: string
  copyEditor: string
  copied: string
  copyFailed: string
  inline: string
  split: string
  fileLanguage: (file: string) => string
  copyFile: (file: string) => string
  expand: (file: string) => string
  collapse: (file: string) => string
  showInline: (file: string) => string
  showSplit: (file: string) => string
  changedFiles: (count: number) => string
  lines: (added: number, deleted: number, total?: boolean) => string
}
export const formatUiNumber = (locale: VidroUiLocale, value: number) =>
  new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale).format(value)
export const UI_COPY: Record<VidroUiLocale, Copy> = {
  en: {
    plainText: 'Plain text',
    documentIcon: 'Document icon',
    editorLanguage: 'Editor language',
    editorText: 'Editor text',
    originalText: 'Original text',
    modifiedText: 'Modified text',
    copyEditor: 'Copy editor text',
    copied: 'Copied to clipboard',
    copyFailed: 'Could not copy to clipboard',
    inline: 'Inline',
    split: 'Split',
    fileLanguage: (f) => `Language for ${f}`,
    copyFile: (f) => `Copy ${f} modified text`,
    expand: (f) => `Expand ${f}`,
    collapse: (f) => `Collapse ${f}`,
    showInline: (f) => `Show inline comparison for ${f}`,
    showSplit: (f) => `Show split comparison for ${f}`,
    changedFiles: (n) =>
      `${formatUiNumber('en', n)} changed ${n === 1 ? 'file' : 'files'}`,
    lines: (a, d, total) =>
      `${formatUiNumber('en', a)} added ${a === 1 ? 'line' : 'lines'}, ${formatUiNumber('en', d)} deleted ${d === 1 ? 'line' : 'lines'}${total ? ' total' : ''}`,
  },
  'pt-BR': {
    plainText: 'Texto simples',
    documentIcon: 'Ícone de documento',
    editorLanguage: 'Linguagem de programação do editor',
    editorText: 'Texto do editor',
    originalText: 'Texto original',
    modifiedText: 'Texto modificado',
    copyEditor: 'Copiar texto do editor',
    copied: 'Copiado para a área de transferência',
    copyFailed: 'Não foi possível copiar para a área de transferência',
    inline: 'Diff em linha',
    split: 'Diff lado a lado',
    fileLanguage: (f) => `Linguagem de programação de ${f}`,
    copyFile: (f) => `Copiar texto modificado de ${f}`,
    expand: (f) => `Expandir ${f}`,
    collapse: (f) => `Recolher ${f}`,
    showInline: (f) => `Mostrar comparação em linha de ${f}`,
    showSplit: (f) => `Mostrar comparação lado a lado de ${f}`,
    changedFiles: (n) =>
      `${formatUiNumber('pt-BR', n)} ${n === 1 ? 'arquivo alterado' : 'arquivos alterados'}`,
    lines: (a, d, total) =>
      `${total ? 'Total: ' : ''}${formatUiNumber('pt-BR', a)} ${a === 1 ? 'linha adicionada' : 'linhas adicionadas'}, ${formatUiNumber('pt-BR', d)} ${d === 1 ? 'linha excluída' : 'linhas excluídas'}`,
  },
  zh: {
    plainText: '纯文本',
    documentIcon: '文档图标',
    editorLanguage: '编辑器编程语言',
    editorText: '编辑器文本',
    originalText: '原始文本',
    modifiedText: '修改后的文本',
    copyEditor: '复制编辑器文本',
    copied: '已复制到剪贴板',
    copyFailed: '无法复制到剪贴板',
    inline: '行内对比',
    split: '并排对比',
    fileLanguage: (f) => `${f} 的编程语言`,
    copyFile: (f) => `复制 ${f} 修改后的文本`,
    expand: (f) => `展开 ${f}`,
    collapse: (f) => `折叠 ${f}`,
    showInline: (f) => `显示 ${f} 的行内对比`,
    showSplit: (f) => `显示 ${f} 的并排对比`,
    changedFiles: (n) => `${formatUiNumber('zh', n)} 个已更改文件`,
    lines: (a, d, total) =>
      `${total ? '共' : ''}新增 ${formatUiNumber('zh', a)} 行，删除 ${formatUiNumber('zh', d)} 行`,
  },
  ja: {
    plainText: 'プレーンテキスト',
    documentIcon: 'ドキュメントのアイコン',
    editorLanguage: 'エディターのプログラミング言語',
    editorText: 'エディターのテキスト',
    originalText: '元のテキスト',
    modifiedText: '変更後のテキスト',
    copyEditor: 'エディターのテキストをコピー',
    copied: 'クリップボードにコピーしました',
    copyFailed: 'クリップボードにコピーできませんでした',
    inline: 'インライン差分',
    split: '左右比較',
    fileLanguage: (f) => `${f} のプログラミング言語`,
    copyFile: (f) => `${f} の変更後のテキストをコピー`,
    expand: (f) => `${f} を展開`,
    collapse: (f) => `${f} を折りたたむ`,
    showInline: (f) => `${f} のインライン比較を表示`,
    showSplit: (f) => `${f} の左右比較を表示`,
    changedFiles: (n) => `${formatUiNumber('ja', n)} 件の変更ファイル`,
    lines: (a, d, total) =>
      `${total ? '合計：' : ''}${formatUiNumber('ja', a)} 行追加、${formatUiNumber('ja', d)} 行削除`,
  },
  vi: {
    plainText: 'Văn bản thuần',
    documentIcon: 'Biểu tượng tài liệu',
    editorLanguage: 'Ngôn ngữ lập trình của trình soạn thảo',
    editorText: 'Văn bản trong trình soạn thảo',
    originalText: 'Văn bản gốc',
    modifiedText: 'Văn bản đã sửa',
    copyEditor: 'Sao chép văn bản trong trình soạn thảo',
    copied: 'Đã sao chép vào bộ nhớ tạm',
    copyFailed: 'Không thể sao chép vào bộ nhớ tạm',
    inline: 'So sánh nội dòng',
    split: 'So sánh cạnh nhau',
    fileLanguage: (f) => `Ngôn ngữ lập trình của ${f}`,
    copyFile: (f) => `Sao chép văn bản đã sửa của ${f}`,
    expand: (f) => `Mở rộng ${f}`,
    collapse: (f) => `Thu gọn ${f}`,
    showInline: (f) => `Hiện so sánh nội dòng cho ${f}`,
    showSplit: (f) => `Hiện so sánh cạnh nhau cho ${f}`,
    changedFiles: (n) => `${formatUiNumber('vi', n)} tệp đã thay đổi`,
    lines: (a, d, total) =>
      `${total ? 'Tổng cộng: ' : ''}thêm ${formatUiNumber('vi', a)} dòng, xóa ${formatUiNumber('vi', d)} dòng`,
  },
}
