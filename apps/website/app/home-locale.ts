import type { HomeLocale } from '@vidro/react/locale'

export interface HomeCopy {
  copyImport: string
  slogan: string
  description: string
  docs: string
  tryEditor: string
  pauseCarousel: string
  resumeCarousel: string
  heroEditorTitle: string
  playgroundLabel: string
  playgroundTitle: string
  playgroundDescription: string
  pricing: string
  pricingTitle: string
  pricingDescription: string
  oneTime: string
  planDescription: string
  buy: string
  included: string
  features: string[]
  product: string
  resources: string
  footerDescription: string
  backToTop: string
}

export const HOME_COPY: Record<HomeLocale, HomeCopy> = {
  en: {
    copyImport: 'Copy import',
    slogan: 'A clear view of your code.',
    description:
      'Vidro is an embeddable Web Component code editor with a little glass. Edit, compare, and explore changes with four thoughtful presets, crisp syntax, and light and dark themes.',
    docs: 'Docs',
    tryEditor: 'Try the editor',
    pauseCarousel: 'Pause carousel',
    resumeCarousel: 'Resume carousel',
    heroEditorTitle: 'Vidro code editor preview',
    playgroundLabel: 'Playground',
    playgroundTitle: 'Make it your own.',
    playgroundDescription:
      'Four perspectives on your code. Explore every preset, adjust the details, and watch the editor respond. Everything below runs right in your browser.',
    pricing: 'Pricing',
    pricingTitle: 'Small price. Clear choice.',
    pricingDescription: 'One editor. One payment. No subscription.',
    oneTime: 'One-time purchase',
    planDescription:
      'A considered code experience, ready to become part of your application.',
    buy: 'Get Vidro',
    included: 'Inside Vidro',
    features: [
      'Default, unified diff, split diff, and file comparisons',
      'Light and dark themes with subtle glass styling',
      'Seven syntax languages and configurable typography',
      'Framework-independent Web Component and semantic events',
    ],
    product: 'Product',
    resources: 'Resources',
    footerDescription:
      'A little glass. A lot of clarity. An editor that feels at home in your application.',
    backToTop: 'Back to top',
  },
  'pt-BR': {
    copyImport: 'Copiar importação',
    slogan: 'Seu código com clareza.',
    description:
      'Um editor de código com um toque de vidro. Edite, compare e explore mudanças com quatro modos, sintaxe nítida e temas claro e escuro.',
    docs: 'Docs',
    tryEditor: 'Experimente o editor',
    pauseCarousel: 'Pausar carrossel',
    resumeCarousel: 'Retomar carrossel',
    heroEditorTitle: 'Prévia do editor Vidro',
    playgroundLabel: 'Playground',
    playgroundTitle: 'Do seu jeito.',
    playgroundDescription:
      'Quatro perspectivas do seu código. Explore cada modo, ajuste os detalhes e veja o editor responder. Tudo abaixo funciona no seu navegador.',
    pricing: 'Preço',
    pricingTitle: 'Preço pequeno. Escolha simples.',
    pricingDescription: 'Um editor. Um pagamento. Sem assinatura.',
    oneTime: 'Compra única',
    planDescription:
      'Uma experiência de código cuidadosa, pronta para fazer parte da sua aplicação.',
    buy: 'Adquira o Vidro',
    included: 'No Vidro',
    features: [
      'Editor padrão, diff unificado, lado a lado e por arquivos',
      'Temas claro e escuro com um toque de vidro',
      'Sete linguagens e tipografia configurável',
      'Web Component independente de framework e eventos semânticos',
    ],
    product: 'Produto',
    resources: 'Recursos',
    footerDescription:
      'Um toque de vidro. Muito mais clareza. Um editor que combina com a sua aplicação.',
    backToTop: 'Voltar ao início',
  },
  zh: {
    copyImport: '复制导入语句',
    slogan: '清晰呈现每一行代码。',
    description:
      'Vidro 是带有轻盈玻璃质感的 Web Component 代码编辑器。四种预设、清晰的语法高亮，以及明暗主题，让编辑与比较更加直观。',
    docs: '文档',
    tryEditor: '体验编辑器',
    pauseCarousel: '暂停轮播',
    resumeCarousel: '继续轮播',
    heroEditorTitle: 'Vidro 代码编辑器预览',
    playgroundLabel: '体验区',
    playgroundTitle: '打造你的编辑体验。',
    playgroundDescription:
      '从四个角度查看代码。探索各个预设，调整细节，实时查看变化。以下体验完全在浏览器中运行。',
    pricing: '价格',
    pricingTitle: '小小价格，清晰选择。',
    pricingDescription: '一个编辑器，一次付款，无需订阅。',
    oneTime: '一次性购买',
    planDescription: '精心设计的代码体验，随时融入你的应用。',
    buy: '获取 Vidro',
    included: 'Vidro 包含',
    features: [
      '默认编辑、统一差异、并排差异及多文件比较',
      '带有轻盈玻璃质感的明暗主题',
      '七种语法语言与可配置的字体样式',
      '独立于框架的 Web Component 与语义事件',
    ],
    product: '产品',
    resources: '资源',
    footerDescription: '一抹玻璃质感，更多代码清晰度。自然融入你的应用。',
    backToTop: '返回顶部',
  },
  ja: {
    copyImport: 'インポートをコピー',
    slogan: 'コードを、もっとクリアに。',
    description:
      'Vidro は、ほのかなガラスの質感を持つ Web Component コードエディター。4つのプリセット、鮮明な構文表示、ライト・ダークテーマで編集や比較を快適に。',
    docs: 'ドキュメント',
    tryEditor: 'エディターを試す',
    pauseCarousel: 'カルーセルを一時停止',
    resumeCarousel: 'カルーセルを再開',
    heroEditorTitle: 'Vidro コードエディターのプレビュー',
    playgroundLabel: 'プレイグラウンド',
    playgroundTitle: 'あなたらしい使い心地に。',
    playgroundDescription:
      '4つの視点でコードを確認。各プリセットを試し、細部を調整して、変化をその場で確認できます。すべてブラウザー内で動作します。',
    pricing: '料金',
    pricingTitle: '小さな価格。シンプルな選択。',
    pricingDescription:
      'ひとつのエディター、一度のお支払い。サブスクリプションは不要です。',
    oneTime: '買い切り',
    planDescription:
      'あなたのアプリケーションに自然になじむ、丁寧に設計されたコード体験。',
    buy: 'Vidro を入手',
    included: 'Vidro の機能',
    features: [
      '標準編集、統合差分、左右比較、ファイル比較',
      'ガラスの質感を持つライト・ダークテーマ',
      '7つの構文言語と調整可能な文字設定',
      'フレームワークに依存しない Web Component とセマンティックイベント',
    ],
    product: '製品',
    resources: 'リソース',
    footerDescription:
      'ほのかなガラス、もっとクリアなコード。あなたのアプリケーションになじむエディター。',
    backToTop: 'トップへ戻る',
  },
}
