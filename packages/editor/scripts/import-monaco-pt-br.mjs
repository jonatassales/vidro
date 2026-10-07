import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const [vscodeSource, catalogPath] = process.argv.slice(2)
assert(
  vscodeSource && catalogPath,
  'Usage: node scripts/import-monaco-pt-br.mjs /path/to/vscode /path/to/main.i18n.json',
)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const manifestPath = join(root, 'localization/monaco-source.json')
const provenance = readJson(manifestPath)
const catalogBytes = readFileSync(catalogPath)
assert.equal(
  createHash('sha256').update(catalogBytes).digest('hex'),
  provenance.ptBrCatalogSha256,
  'Expected the pinned Microsoft catalog',
)
const catalog = JSON.parse(catalogBytes).contents
const supplement = readJson(join(root, 'localization/pt-BR-supplement.json'))
const corrections = readJson(join(root, 'localization/pt-BR-corrections.json'))
const monaco = join(root, 'node_modules/monaco-editor')
assert.equal(
  readJson(join(monaco, 'package.json')).version,
  provenance.monacoVersion,
)
function calls(file) {
  const ast = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const result = []
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      /(^|\.)(localize|localize2)$/.test(node.expression.getText(ast))
    ) {
      let [key, message] = node.arguments
      if (key && ts.isObjectLiteralExpression(key))
        key = key.properties.find(
          (property) => property.name?.getText(ast) === 'key',
        )?.initializer
      if (
        key &&
        message &&
        (ts.isNumericLiteral(key) || ts.isStringLiteralLike(key)) &&
        ts.isStringLiteralLike(message)
      )
        result.push({ key: key.text, english: message.text })
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return result
}
const entries = []
const messages = Array(2153).fill(null)
const esm = join(monaco, 'esm')
for (const file of readdirSync(esm, { recursive: true }).filter((file) =>
  file.endsWith('.js'),
)) {
  const emitted = calls(join(esm, file)).filter((call) =>
    /^\d+$/.test(call.key),
  )
  if (!emitted.length) continue
  const module = file.slice(0, -3)
  const original = calls(join(vscodeSource, 'src', `${module}.ts`))
  for (const call of emitted) {
    const matching = original.filter(
      (candidate) => candidate.english === call.english,
    )
    const siblings = emitted.filter(
      (candidate) => candidate.english === call.english,
    )
    // Distinguish repeated English text by source occurrence only when counts match.
    const chosen =
      matching.length === siblings.length
        ? [matching[siblings.indexOf(call)]]
        : matching
    assert(chosen.length, `No source key for ${module}: ${call.english}`)
    const candidates = [
      ...new Set(
        chosen
          .map((candidate) => catalog[module]?.[candidate.key])
          .filter(Boolean),
      ),
    ]
    assert(
      candidates.length <= 1,
      `Ambiguous translation: ${module}: ${call.english}`,
    )
    const upstreamTranslation =
      Object.hasOwn(supplement, call.english) &&
      (!candidates[0] || candidates[0] === call.english)
        ? supplement[call.english]
        : candidates[0]
    const translation = Object.hasOwn(corrections, call.english)
      ? corrections[call.english]
      : upstreamTranslation
    assert(translation, `Missing translation: ${module}: ${call.english}`)
    const id = Number(call.key)
    assert.equal(messages[id], null, `Duplicate ID ${id}`)
    messages[id] = translation
    entries.push({
      id,
      module,
      keys: chosen.map((candidate) => candidate.key),
      english: call.english,
    })
  }
}
entries.sort((a, b) => a.id - b.id)
assert.deepEqual(
  entries,
  provenance.entries,
  'Exact source-key mapping changed; review the pinned source manifest',
)
writeFileSync(
  join(root, 'localization/pt-BR.json'),
  `${JSON.stringify(messages, null, 2)}\n`,
)
console.log(
  `Imported ${entries.length} Portuguese messages from the pinned catalog and reviewed supplement`,
)
