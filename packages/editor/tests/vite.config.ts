import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const fixtureNames = [
  'index',
  'import-only',
  'upgrade',
  'invalid-upgrade',
  'theme',
]
const fixturePaths = new Set(
  fixtureNames.flatMap((name) => [`/${name}.html`, `/${name}.ts`]),
)
fixturePaths.add('/main.ts')

// Legacy tests keep their fixture URLs; /sandbox/ exercises the public page.
const fixtureRoutes: Plugin = {
  name: 'vidro-test-fixture-routes',
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      routeFixture(request)
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      routeFixture(request)
      next()
    })
  },
}

function routeFixture(request: { url?: string }) {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const path = url.pathname === '/' ? '/index.html' : url.pathname
  if (fixturePaths.has(path)) {
    request.url = `/tests/fixtures${path}${url.search}`
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  plugins: [fixtureRoutes],
  optimizeDeps: { exclude: ['vidro'] },
  server: { port: 4183, strictPort: true },
  preview: { port: 4184, strictPort: true },
  build: {
    outDir: 'tests/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries([
        ...fixtureNames.map((name) => [
          name,
          fileURLToPath(new URL(`./fixtures/${name}.html`, import.meta.url)),
        ]),
        [
          'sandbox',
          fileURLToPath(new URL('../sandbox/index.html', import.meta.url)),
        ],
      ]),
    },
  },
})
