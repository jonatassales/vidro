import type { HomeLocale } from '@vidro/react/locale'

export interface HomeCopy {
  copyImport: string
  slogan: string
  description: string
  tryEditor: string
  heroEditorTitle: string
  playgroundLabel: string
  playgroundTitle: string
  playgroundDescription: string
  pricing: string
  pricingTitle: string
  pricingDescription: string
  supportOptional: string
  planDescription: string
  supportBadge: string
  pixCopy: string
  pixCopied: string
  pixCopyError: string
  pixInstructions: string
  pixCodeLabel: string
  pixQrAlt: string
  included: string
  features: string[]
  product: string
  license: string
  policies: string
  backedBy: string
  socialLinks: string
  footerDescription: string
}

export const HOME_COPY: Record<HomeLocale, HomeCopy> = {
  en: {
    copyImport: 'Copy import',
    slogan: 'A clear view of your code.',
    description:
      'Vidro is an embeddable Web Component code editor with a little glass. Edit, compare, and explore changes with four thoughtful presets, crisp syntax, and light and dark themes.',
    tryEditor: 'Try the editor',
    heroEditorTitle: 'Vidro code editor preview',
    playgroundLabel: 'Playground',
    playgroundTitle: 'Make it your own.',
    playgroundDescription:
      'Four perspectives on your code. Explore every preset, adjust the details, and watch the editor respond. Everything below runs right in your browser.',
    pricing: 'Support',
    pricingTitle: 'Help a developer keep creating.',
    pricingDescription: 'Vidro is free and open source under the MIT License.',
    supportOptional: 'Support is optional. Thank you for using Vidro.',
    planDescription:
      'I am unemployed and keep building Vidro. If the project has been useful to you, a R$ 5 contribution helps me keep going.',
    supportBadge: 'Voluntary support',
    pixCopy: 'Copy Pix code',
    pixCopied: 'Pix code copied',
    pixCopyError:
      'Could not copy. Open the Pix code below and copy it manually.',
    pixInstructions:
      'Scan the QR code with your Brazilian banking app, or copy the Pix code and paste it there. The contribution is R$ 5 (BRL).',
    pixCodeLabel: 'Pix copy-and-paste code',
    pixQrAlt: 'Pix QR code for a voluntary R$ 5 contribution',
    included: 'Inside Vidro',
    features: [
      'Default, unified diff, split diff, and file comparisons',
      'Light and dark themes with subtle glass styling',
      'Seven syntax languages and configurable typography',
      'Framework-independent Web Component and semantic events',
    ],
    product: 'Product',
    license: 'License',
    policies: 'Legal & Policies',
    backedBy: 'Backed by:',
    socialLinks: 'Social networks',
    footerDescription:
      'A little glass. A lot of clarity. An editor that feels at home in your application.',
  },
  'pt-BR': {
    copyImport: 'Copiar importação',
    slogan: 'Seu código com clareza.',
    description:
      'Um editor de código com um toque de vidro. Edite, compare e explore mudanças com quatro modos, sintaxe nítida e temas claro e escuro.',
    tryEditor: 'Experimente o editor',
    heroEditorTitle: 'Prévia do editor Vidro',
    playgroundLabel: 'Playground',
    playgroundTitle: 'Do seu jeito.',
    playgroundDescription:
      'Quatro perspectivas do seu código. Explore cada modo, ajuste os detalhes e veja o editor responder. Tudo abaixo funciona no seu navegador.',
    pricing: 'Apoie',
    pricingTitle: 'Ajude um desenvolvedor a continuar criando.',
    pricingDescription: 'O Vidro é gratuito e open source sob a licença MIT.',
    supportOptional: 'O apoio é opcional. Obrigado por usar o Vidro.',
    planDescription:
      'Estou desempregado e sigo construindo o Vidro. Se o projeto foi útil para você, uma contribuição de R$ 5 me ajuda a continuar.',
    supportBadge: 'Apoio voluntário',
    pixCopy: 'Copiar Pix',
    pixCopied: 'Código Pix copiado',
    pixCopyError:
      'Não foi possível copiar. Abra o código Pix abaixo e copie manualmente.',
    pixInstructions:
      'Leia o QR Code no aplicativo do seu banco ou copie o código Pix e cole nele. A contribuição é de R$ 5.',
    pixCodeLabel: 'Código Pix Copia e Cola',
    pixQrAlt: 'QR Code Pix para uma contribuição voluntária de R$ 5',
    included: 'No Vidro',
    features: [
      'Editor padrão, diff unificado, lado a lado e por arquivos',
      'Temas claro e escuro com um toque de vidro',
      'Sete linguagens e tipografia configurável',
      'Web Component independente de framework e eventos semânticos',
    ],
    product: 'Produto',
    license: 'Licença',
    policies: 'Jurídico e políticas',
    backedBy: 'Apoiado por:',
    socialLinks: 'Redes sociais',
    footerDescription:
      'Um toque de vidro. Muito mais clareza. Um editor que combina com a sua aplicação.',
  },
  zh: {
    copyImport: '复制导入语句',
    slogan: '清晰呈现每一行代码。',
    description:
      'Vidro 是带有轻盈玻璃质感的 Web Component 代码编辑器。四种预设、清晰的语法高亮，以及明暗主题，让编辑与比较更加直观。',
    tryEditor: '体验编辑器',
    heroEditorTitle: 'Vidro 代码编辑器预览',
    playgroundLabel: '体验区',
    playgroundTitle: '打造你的编辑体验。',
    playgroundDescription:
      '从四个角度查看代码。探索各个预设，调整细节，实时查看变化。以下体验完全在浏览器中运行。',
    pricing: '支持项目',
    pricingTitle: '帮助开发者继续创作。',
    pricingDescription: 'Vidro 是基于 MIT 许可证的免费开源软件。',
    supportOptional: '支持完全自愿。感谢你使用 Vidro。',
    planDescription: '如果 Vidro 对你有帮助，可以自愿支持开发者继续维护项目。',
    supportBadge: '自愿支持',
    pixCopy: '复制 Pix 代码',
    pixCopied: 'Pix 代码已复制',
    pixCopyError: '无法复制。请展开下方代码并手动复制。',
    pixInstructions:
      '使用巴西银行应用扫描二维码，或将 Pix 代码复制到应用中。支持金额为 5 巴西雷亚尔。',
    pixCodeLabel: 'Pix 支付代码',
    pixQrAlt: '自愿支持 5 巴西雷亚尔的 Pix 二维码',
    included: 'Vidro 包含',
    features: [
      '默认编辑、统一差异、并排差异及多文件比较',
      '带有轻盈玻璃质感的明暗主题',
      '七种语法语言与可配置的字体样式',
      '独立于框架的 Web Component 与语义事件',
    ],
    product: '产品',
    license: '许可证',
    policies: '法律与政策',
    backedBy: '支持方：',
    socialLinks: '社交平台',
    footerDescription: '一抹玻璃质感，更多代码清晰度。自然融入你的应用。',
  },
  ja: {
    copyImport: 'インポートをコピー',
    slogan: 'コードを、もっとクリアに。',
    description:
      'Vidro は、ほのかなガラスの質感を持つ Web Component コードエディター。4つのプリセット、鮮明な構文表示、ライト・ダークテーマで編集や比較を快適に。',
    tryEditor: 'エディターを試す',
    heroEditorTitle: 'Vidro コードエディターのプレビュー',
    playgroundLabel: 'プレイグラウンド',
    playgroundTitle: 'あなたらしい使い心地に。',
    playgroundDescription:
      '4つの視点でコードを確認。各プリセットを試し、細部を調整して、変化をその場で確認できます。すべてブラウザー内で動作します。',
    pricing: '支援',
    pricingTitle: '開発者の創作を応援する。',
    pricingDescription:
      'Vidro は MIT ライセンスの無料オープンソースソフトウェアです。',
    supportOptional:
      '支援は任意です。Vidro をご利用いただきありがとうございます。',
    planDescription:
      'Vidro が役に立ったら、開発の継続を任意でご支援いただけます。',
    supportBadge: '任意の支援',
    pixCopy: 'Pix コードをコピー',
    pixCopied: 'Pix コードをコピーしました',
    pixCopyError:
      'コピーできませんでした。下のコードを開いて手動でコピーしてください。',
    pixInstructions:
      'ブラジルの銀行アプリで QR コードを読み取るか、Pix コードを貼り付けてください。支援額は 5 ブラジルレアルです。',
    pixCodeLabel: 'Pix コード',
    pixQrAlt: '任意の 5 ブラジルレアルの支援用 Pix QR コード',
    included: 'Vidro の機能',
    features: [
      '標準編集、統合差分、左右比較、ファイル比較',
      'ガラスの質感を持つライト・ダークテーマ',
      '7つの構文言語と調整可能な文字設定',
      'フレームワークに依存しない Web Component とセマンティックイベント',
    ],
    product: '製品',
    license: 'ライセンス',
    policies: '法務・ポリシー',
    backedBy: '支える技術：',
    socialLinks: 'ソーシャルメディア',
    footerDescription:
      'ほのかなガラス、もっとクリアなコード。あなたのアプリケーションになじむエディター。',
  },
}
