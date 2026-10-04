import { randomUUID } from 'node:crypto'
import { watch as watchFiles } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const require = createRequire(import.meta.url)
const website = fileURLToPath(new URL('..', import.meta.url))
const editor = dirname(require.resolve('vidro/package.json'))
const watching = process.argv.includes('--watch')

async function prepare() {
  await mkdir(join(website, 'public'), { recursive: true })
  await copyFile(
    join(editor, 'README.md'),
    join(website, 'public/editor-api.md'),
  )
  await build({
    configFile: join(editor, 'sandbox/vite.config.ts'),
    root: join(editor, 'sandbox'),
    base: '/playground/',
    build: {
      outDir: join(website, 'public/playground'),
      // Keep assets used by an open frame until it reloads after this build.
      emptyOutDir: !watching,
    },
  })
  await build({
    configFile: join(editor, 'sandbox/vite.config.ts'),
    root: join(website, 'hero-editor'),
    base: '/hero-editor/',
    build: {
      outDir: join(website, 'public/hero-editor'),
      emptyOutDir: !watching,
    },
  })
  if (watching)
    for (const directory of ['playground', 'hero-editor'])
      await writeFile(
        join(website, 'public', directory, 'revision.json'),
        JSON.stringify({ revision: randomUUID() }),
      )
}

if (!watching) {
  await prepare()
} else {
  let compiling = true
  let preparing = false
  let pending = false
  let timer
  let stopping = false

  async function refresh() {
    pending = true
    if (compiling || preparing || stopping) return
    preparing = true
    try {
      while (pending && !compiling && !stopping) {
        pending = false
        await prepare()
      }
    } catch (error) {
      console.error(error)
    } finally {
      preparing = false
    }
  }

  // Rebundle the consumer only once all built package chunks are written.
  const watcher = await build({
    root: editor,
    configFile: join(editor, 'vite.config.ts'),
    build: { watch: {}, emptyOutDir: false },
  })
  watcher.on('event', (event) => {
    if (event.code === 'START') compiling = true
    if (event.code === 'ERROR') console.error(event.error)
    if (event.code === 'END') {
      compiling = false
      void refresh()
    }
  })
  const inputs = watchFiles(
    join(editor, 'sandbox'),
    { recursive: true },
    (_, file) => {
      if (file?.startsWith('dist/')) return
      clearTimeout(timer)
      timer = setTimeout(() => void refresh(), 150)
    },
  )
  const heroInputs = watchFiles(join(website, 'hero-editor'), (_, file) => {
    if (file?.startsWith('dist/')) return
    clearTimeout(timer)
    timer = setTimeout(() => void refresh(), 150)
  })
  const readme = watchFiles(join(editor, 'README.md'), () => void refresh())
  async function stop() {
    stopping = true
    clearTimeout(timer)
    inputs.close()
    heroInputs.close()
    readme.close()
    await watcher.close()
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}
