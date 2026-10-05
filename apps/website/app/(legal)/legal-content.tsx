import type { ReactNode } from 'react'

function inlineText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)]+\))/g).map((part) => {
    if (part.startsWith('**')) {
      return (
        <strong className="font-semibold text-foreground" key={part}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    const link = /^\[([^\]]+)\]\((\/[^)]+)\)$/.exec(part)
    if (link) {
      return (
        <a
          className="rounded-sm text-foreground underline underline-offset-4 hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-4"
          href={link[2]}
          key={part}
        >
          {link[1]}
        </a>
      )
    }
    return part
  })
}

// Only the supplied headings, lists, emphasis and internal links are supported.
// React renders plain text safely; this is not an HTML or general Markdown parser.
export function LegalContent({ content }: { content: string }) {
  return Array.from(
    content.trim().matchAll(/\S[\s\S]*?(?=\n\s*\n|$)/g),
    (match) => {
      const block = match[0]
      if (block.startsWith('# ') || block === '**Commercial software**')
        return null
      if (block.startsWith('## ')) {
        return (
          <h2
            className="mb-4 mt-10 text-xl font-medium text-foreground"
            key={match.index}
          >
            {block.slice(3)}
          </h2>
        )
      }
      if (block === '---')
        return <hr className="my-8 border-line" key={match.index} />
      if (block.startsWith('- ')) {
        return (
          <ul className="mb-6 list-disc space-y-1 pl-6" key={match.index}>
            {block.split('\n').map((item) => (
              <li key={item}>{inlineText(item.slice(2))}</li>
            ))}
          </ul>
        )
      }
      return (
        <p className="mb-6" key={match.index}>
          {inlineText(block)}
        </p>
      )
    },
  )
}
