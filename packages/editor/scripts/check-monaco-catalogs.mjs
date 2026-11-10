import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const monaco = join(root, 'node_modules/monaco-editor')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const manifest = readJson(join(root, 'localization/monaco-source.json'))
assert.equal(
  readJson(join(monaco, 'package.json')).version,
  manifest.monacoVersion,
)
const expected = new Map(manifest.entries.map((entry) => [entry.id, entry]))
const seen = new Set()
const unchanged = readJson(join(root, 'localization/unchanged-exceptions.json'))
const esm = join(monaco, 'esm')
for (const file of readdirSync(esm, { recursive: true }).filter((file) =>
  file.endsWith('.js'),
)) {
  const ast = ts.createSourceFile(
    file,
    readFileSync(join(esm, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      /(^|\.)(localize|localize2)$/.test(node.expression.getText(ast))
    ) {
      const [id, message] = node.arguments
      assert(id && ts.isNumericLiteral(id), `Non-numeric NLS ID: ${file}`)
      assert(
        message && ts.isStringLiteralLike(message),
        `Non-literal NLS message: ${file}`,
      )
      const numericId = Number(id.text)
      const entry = expected.get(numericId)
      assert(entry, `Unknown NLS ID ${numericId}`)
      assert.equal(entry.module, file.slice(0, -3))
      assert.equal(
        entry.english,
        message.text,
        `Source changed for NLS ID ${numericId}`,
      )
      assert(!seen.has(numericId), `Duplicate NLS ID ${numericId}`)
      seen.add(numericId)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
assert.equal(seen.size, expected.size)
assert.equal(seen.size, 2146)
// Official Monaco catalogs completed by the shared supplement ID map and per-ID corrections.
const officialCatalogs = { es: 'es', zh: 'zh-cn', ja: 'ja' }
const placeholders = (value) =>
  [...value.matchAll(/\{\d+\}/g)].map(([token]) => token).sort()
for (const locale of process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['en', 'pt-BR', 'es', 'zh', 'ja', 'vi']) {
  let messages
  if (locale === 'en') {
    messages = Array(2153).fill(null)
    for (const entry of expected.values()) messages[entry.id] = entry.english
  } else if (Object.hasOwn(officialCatalogs, locale)) {
    const upstream = readFileSync(
      join(esm, `vs/nls/lang/${officialCatalogs[locale]}.js`),
      'utf8',
    )
    const literal = upstream.match(/_VSCODE_NLS_MESSAGES=(\[.*\]);/)
    assert(literal, 'Unexpected upstream catalog format')
    messages = JSON.parse(literal[1])
    const supplement = readJson(
      join(root, `localization/${locale}-supplement.json`),
    )
    const idMap = readJson(join(root, 'localization/cjk-message-ids.json'))
    assert.deepEqual(Object.keys(supplement).sort(), Object.keys(idMap).sort())
    for (const [english, ids] of Object.entries(idMap)) {
      for (const id of ids) {
        assert.equal(expected.get(id)?.english, english)
        assert(
          messages[id] === null || messages[id] === english,
          `Supplement must only fill absent or untranslated upstream ${locale} ID ${id}`,
        )
        messages[id] = supplement[english]
      }
    }
    const corrections = readJson(
      join(root, `localization/${locale}-corrections.json`),
    )
    const originals = readJson(
      join(root, 'localization/cjk-corrections-source.json'),
    )[locale]
    assert.deepEqual(
      Object.keys(corrections).sort(),
      Object.keys(originals).sort(),
    )
    for (const [id, translation] of Object.entries(corrections)) {
      assert.equal(expected.get(Number(id))?.english, originals[id].english)
      assert.equal(messages[Number(id)], originals[id].upstream)
      messages[Number(id)] = translation
    }
  } else {
    messages = readJson(join(root, `localization/${locale}.json`))
  }
  assert.equal(messages.length, 2153)
  for (let id = 0; id < messages.length; id++) {
    const entry = expected.get(id)
    if (!entry) {
      assert(manifest.unreferencedIds.includes(id))
      if (!Object.hasOwn(officialCatalogs, locale))
        assert.equal(messages[id], null)
      continue
    }
    assert(
      typeof messages[id] === 'string' && messages[id].trim(),
      `${locale}: missing message ${id}`,
    )
    if (locale !== 'en' && messages[id] === entry.english) {
      const allowed = Object.values(unchanged[locale]).flat()
      assert(
        allowed.includes(id),
        `${locale}: unreviewed English fallback ${id}: ${entry.english}`,
      )
    }
    const tokens = [
      ...entry.english.matchAll(/`([^`\n]+)`|https?:\/\/[^\s)]+/g),
    ].map((match) => match[1] ?? match[0])
    for (const token of tokens)
      assert(
        messages[id].includes(token),
        `${locale}: missing code/URL token in ${id}: ${token}`,
      )
    for (const [fence] of entry.english.matchAll(/```[\s\S]*?```/g))
      assert(
        messages[id].replaceAll('\r\n', '\n').includes(fence),
        `${locale}: changed code fence in ${id}`,
      )
    assert.deepEqual(
      placeholders(messages[id]),
      placeholders(entry.english),
      `${locale}: placeholder mismatch ${id}`,
    )
  }
  console.log(
    `${locale}: all ${seen.size} shipped Monaco NLS IDs and placeholders verified`,
  )
}
