const editor = document.createElement('vidro-editor')
editor.editable = true
editor.header = false
editor.id = 'invalid-editor'
editor.style.cssText = 'display:block;width:480px;height:240px'
editor.value = 'retained'
Reflect.set(editor, 'debounceMs', 'invalid')
document.body.append(editor)
const other = document.createElement('vidro-editor')
other.editable = true
other.header = false
other.id = 'healthy-editor'
other.style.cssText = 'display:block;width:480px;height:240px'
other.value = 'healthy'
document.body.append(other)
void import('vidro')
