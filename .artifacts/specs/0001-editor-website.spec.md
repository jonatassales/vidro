# Vidro editor website and monorepo

- Status: owner-requested implementation; recorded retrospectively on 2026-10-04.
- Source: this task's product-pivot request and pricing replies.
- Baseline repository: `jonatassales/vidro`, `40c801ad0fa84dd679df14d71d050b59e1c8783b`.

## Requested result

1. Vidro becomes an embeddable editor, replacing the environment-management positioning. Preserve its name and the existing website branding.
2. Copy the editor project from `/Users/sky/code/vidro.pro` into `packages/editor` in the existing website monorepo. Preserve its public API, four presets, Stone events, glass backgrounds, and header gradient.
3. Keep `apps/website`; its page order is branded editor hero, full interactive sandbox section, pricing, footer.
4. Use SmoothUI for the pricing and footer, adapted to existing branding.
5. Display **R$ 3 as a one-time purchase**, per the owner's two explicit pricing replies.
6. Keep the single `pnpm sandbox` entry point, build/watch the editor, and support production verification with `--preview`. Retain build/lint/typecheck/browser-test commands.

7. Restore the website hero carousel with frontend framework and library marks, and visibly emphasize that Vidro is a Web Component. This owner request arrived before PR creation. The owner also removed the small “Editor preview” hero badge before PR creation.
8. Render a live editor directly below the hero slogan. The later owner correction removes its visible theme switch; the preview continues to follow the system's light and dark themes.

## Implementation decisions

These are implementation choices, not additional owner requirements:

- Preserve the existing pnpm/Turbo/Next.js monorepo, shared logo/fonts/tokens, and four marketing locales. Keep historical compiler packages and docs without advertising them on the editor website.
- Keep package identity `vidro`; rename only the private workspace root to avoid duplicate names.
- Embed the existing built public-package sandbox in an automatically sized same-origin frame. Its independent light/dark controls and English UI remain available. Validate resize messages by origin, source, type, and finite height.
- Build the playground into website public assets, including Monaco workers. Rebundle only after the editor watcher finishes, and reload the development frame on a new build revision.
- Build the compact hero editor from the public `vidro` package as a separate, content-sized same-origin preview. It calls the public `setTheme()` API inside the frame when the system theme changes, without a visible hero theme control.
- Keep SmoothUI MIT attribution. No placeholder forms or dead links. Provide a keyboard-operable pause/resume control for the moving hero carousel, with visible focus and reduced-motion fallback.
- An optional HTTPS `NEXT_PUBLIC_VIDRO_CHECKOUT_URL` enables the purchase link. Without a supplied checkout, the card opens the playground. Payment processing is outside this request.
- Preserve the current Vercel project/root through checked-in build configuration; do not alter remote project settings or deploy.

## Acceptance evidence

- Build, typecheck, lint and migrated public-browser suite succeed.
- Development and production website checks cover page order, the live hero editor with no visible theme control, system theme changes, one-time price, assets/workers, four ready presets, shared controls, editing events, clipboard, diff expansion/layout, automatic frame sizing, themes, forced colors, locale persistence, and mobile width. Check the carousel's keyboard pause/resume and reduced-motion behavior.
- Verify an actual package edit reaches the embedded preview via `pnpm sandbox`; restore the probe afterward.
- Inspect desktop/mobile captures and refresh independent Standards/Spec reviews against the delivered snapshot.
- Local Chromium evidence does not establish real Safari/Firefox/OS IME acceptance, package publication, checkout functionality, or a live deployment.
