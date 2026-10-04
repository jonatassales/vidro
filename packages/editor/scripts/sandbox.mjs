import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { build, createServer, preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(import.meta.url)
const compiler = require.resolve('typescript/bin/tsc')
const { values } = parseArgs({
  args: process.argv.slice(2).filter((argument) => argument !== '--'),
  options: {
    preview: { type: 'boolean', default: false },
    host: { type: 'string', default: '127.0.0.1' },
    port: { type: 'string' },
  },
})
const port = values.port === undefined ? undefined : Number(values.port)
if (
  port !== undefined &&
  (!Number.isInteger(port) || port < 1 || port > 65535)
) {
  throw new RangeError('--port must be an integer from 1 to 65535')
}

const packageConfig = fileURLToPath(
  new URL('../vite.config.ts', import.meta.url),
)
const sandboxConfig = fileURLToPath(
  new URL('../sandbox/vite.config.ts', import.meta.url),
)
const cleanup = []
let stopping = false

async function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  await Promise.allSettled(cleanup.reverse().map(async (close) => close()))
  process.exit(exitCode)
}

process.once('SIGINT', () => void stop())
process.once('SIGTERM', () => void stop())

function declarations(watch = false) {
  const child = spawn(
    process.execPath,
    [
      compiler,
      '--project',
      'tsconfig.build.json',
      ...(watch ? ['--watch', '--preserveWatchOutput'] : []),
    ],
    { cwd: root, stdio: 'inherit' },
  )
  cleanup.push(() => {
    if (child.exitCode !== null || child.signalCode !== null) return
    return new Promise((resolve) => {
      child.once('exit', resolve)
      child.kill('SIGTERM')
    })
  })
  return new Promise((resolve, reject) => {
    child.once('error', (error) => {
      if (watch) {
        console.error(error)
        void stop(1)
      } else reject(error)
    })
    child.once('exit', (code, signal) => {
      if (stopping) return resolve()
      if (watch) {
        console.error(`Declaration watcher exited with ${signal ?? code}`)
        void stop(code || 1)
        return
      }
      if (code === 0) return resolve()
      reject(new Error(`Declaration compiler exited with ${signal ?? code}`))
    })
    if (watch) resolve()
  })
}

try {
  await build({ root, configFile: packageConfig })
  await declarations()

  if (values.preview) {
    await build({ configFile: sandboxConfig })
    const server = await preview({
      configFile: sandboxConfig,
      preview: { host: values.host, ...(port ? { port } : {}) },
    })
    cleanup.push(() => server.close())
    server.printUrls()
  } else {
    const watcher = await build({
      root,
      configFile: packageConfig,
      build: { watch: {}, emptyOutDir: false },
    })
    if (!Array.isArray(watcher) && 'close' in watcher) {
      cleanup.push(() => watcher.close())
    }
    await declarations(true)
    const server = await createServer({
      configFile: sandboxConfig,
      server: { host: values.host, ...(port ? { port } : {}) },
    })
    cleanup.push(() => server.close())
    await server.listen()
    server.printUrls()
  }
} catch (error) {
  console.error(error)
  await stop(1)
}
