import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const root = fileURLToPath(new URL('..', import.meta.url))
const { values } = parseArgs({
  options: {
    preview: { type: 'boolean', default: false },
    port: { type: 'string', default: '3000' },
    host: { type: 'string', default: '127.0.0.1' },
  },
})
const port = Number(values.port)
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new RangeError('--port must be an integer from 1 to 65535')

const children = new Set()
let stopping = false

function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.pid) continue
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(error)
    }
  }
  process.exitCode = code
}

function run(args, persistent = false) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd: root,
      stdio: 'inherit',
      detached: true,
    })
    children.add(child)
    child.on('error', (error) => {
      children.delete(child)
      reject(error)
    })
    child.on('exit', (code, signal) => {
      children.delete(child)
      if (stopping) return resolve()
      if (persistent) stop(code ?? 1)
      if (code === 0) resolve()
      else reject(new Error(`pnpm ${args.join(' ')} exited ${code ?? signal}`))
    })
  })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

try {
  await run(['exec', 'turbo', 'run', 'build', '--filter=@vidro/website^...'])
  if (values.preview) {
    await run(['--filter', '@vidro/website', 'build'])
    await run(
      [
        '--filter',
        '@vidro/website',
        'exec',
        'next',
        'start',
        '--hostname',
        values.host,
        '--port',
        values.port,
      ],
      true,
    )
  } else {
    await run([
      '--filter',
      '@vidro/website',
      'exec',
      'node',
      'scripts/prepare-playground.mjs',
    ])
    await Promise.all([
      run(
        [
          '--filter',
          'vidro',
          'exec',
          'tsc',
          '--project',
          'tsconfig.build.json',
          '--watch',
          '--preserveWatchOutput',
        ],
        true,
      ),
      run(
        [
          '--filter',
          '@vidro/website',
          'exec',
          'node',
          'scripts/prepare-playground.mjs',
          '--watch',
        ],
        true,
      ),
      run(
        [
          '--filter',
          '@vidro/website',
          'exec',
          'next',
          'dev',
          '--hostname',
          values.host,
          '--port',
          values.port,
        ],
        true,
      ),
    ])
  }
} catch (error) {
  console.error(error)
  stop(1)
}
