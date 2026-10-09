import 'vidropro'

document.body.dataset.registered = String(
  customElements.get('vidro-editor') !== undefined,
)
