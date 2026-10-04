export {}

const editor = document.createElement('vidro-editor')
editor.editable = true
editor.header = false
editor.id = 'editor'
editor.style.cssText = 'display:block;width:720px;height:360px'
editor.setAttribute('value', 'ignored-attribute')
editor.value = '\uFEFFbefore\r\nregistration'
editor.language = 'plaintext'

await import('vidro')
customElements.upgrade(editor)
document.body.dataset.detachedUpgradeValue = editor.value
document.body.dataset.detachedUpgradeOwnValue = String(
  Object.hasOwn(editor, 'value'),
)
document.querySelector('#editor-slot')?.append(editor)
await editor.whenReady()
document.body.dataset.upgraded = 'true'
