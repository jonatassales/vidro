# SmoothUI sources

Pricing and footer are adapted from the official MIT-licensed SmoothUI registry, retrieved on 2026-10-04. Motion structure, single-plan card composition, feature list, responsive footer groups, and reduced-motion handling are retained; copy, colors, links, and one-time pricing use Vidro decisions. Unused billing toggles, newsletter, and placeholder links were removed.

- https://smoothui.dev/r/pricing-1.json — SHA-256 `ee9797b032f67e97e0551ae421565d892072cf79f13f2f39a4ed267655a9cbd1`
- https://smoothui.dev/r/footer-2.json — SHA-256 `1565cf09940954504a9f26b4525f48ef87fe8f641ad922ea512af62c576e4392`

Upstream: https://github.com/educlopez/smoothui. The copyright and permission notice are retained in [LICENSE](LICENSE).

The hero also adapts `https://smoothui.dev/r/blur-out-up.json`, `https://smoothui.dev/r/shader-reveal-wipe-transition.json`, and its dependency `https://smoothui.dev/r/shader-reveal-transition.json` (retrieved 2026-10-04). The wipe is the displacement shader used by the Morning/Night example. Its controller is scoped to the wipe variant and adapted for one persistent Web Component in the hero frame, with rendering only during transitions, transparent idle output, context-loss cleanup, and a no-WebGL fallback. Blur Out Up retains the 6px blur, 10px upward entrance, 560ms duration, 28ms word stagger, and reduced-motion handling; the requested start delay is 500ms.
