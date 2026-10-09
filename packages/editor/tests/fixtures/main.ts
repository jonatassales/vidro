import 'vidropro'
import { atom, createStore } from 'jotai/vanilla'

const editor = document.createElement('vidro-editor')
editor.editable = true
editor.header = false
editor.id = 'editor'
editor.dataset.editEvents = '0'
for (const name of ['vidro-change', 'vidro-type-start', 'vidro-type-leave']) {
  editor.addEventListener(name, () => {
    editor.dataset.editEvents = String(Number(editor.dataset.editEvents) + 1)
  })
}
editor.style.display = 'block'
editor.style.width = '720px'
editor.style.height = '360px'
editor.value = '\uFEFFalpha\r\nbeta\r\n'
document.querySelector('#editor-slot')?.append(editor)

const sourceAtom = atom(editor.value)
const store = createStore()
const draftOutput = document.querySelector('#draft')
if (!draftOutput) throw new Error('Draft output is missing')
const renderDraft = () => {
  draftOutput.textContent = store.get(sourceAtom)
}
store.sub(sourceAtom, () => {
  editor.value = store.get(sourceAtom)
  renderDraft()
})
editor.addEventListener('vidro-change', ({ detail }) => {
  store.set(sourceAtom, detail.value)
})
renderDraft()
