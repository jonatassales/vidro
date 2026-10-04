import 'vidro'

document.body.dataset.registered = String(
  customElements.get('vidro-editor') !== undefined,
)
