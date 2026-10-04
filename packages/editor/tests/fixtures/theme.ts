import type { VidroTheme } from 'vidro'
import { setTheme } from 'vidro'

const params = new URLSearchParams(location.search)
if (params.get('initial') === 'dark') setTheme('dark')

for (const id of ['first', 'second']) {
  const editor = document.createElement('vidro-editor')
  editor.editable = true
  editor.header = false
  editor.id = id
  if (id === 'second') editor.className = 'frame-override'
  editor.language = 'json'
  editor.value = '{"name":"Vidro","count":2}'
  document.querySelector(`#${id}-slot`)?.append(editor)
}

document
  .querySelector('#light')
  ?.addEventListener('click', () => setTheme('light'))
document
  .querySelector('#dark')
  ?.addEventListener('click', () => setTheme('dark'))
document.querySelector('#reconnect')?.addEventListener('click', async () => {
  const second = document.querySelector<HTMLElementTagNameMap['vidro-editor']>(
    'vidro-editor#second',
  )
  if (!second) return
  second.remove()
  document.querySelector('#second-slot')?.append(second)
  await second.whenReady()
})

for (const [id, value] of [
  ['unsupported', 'sepia'],
  ['wrong-type', 3],
] as const) {
  document.querySelector(`#${id}`)?.addEventListener('click', () => {
    const result = document.querySelector('#theme-result')
    if (!result) return
    try {
      setTheme(value as VidroTheme)
      result.textContent = 'accepted'
    } catch (error) {
      result.textContent = error instanceof Error ? error.name : 'Unknown error'
    }
  })
}
