# Editor website delivery — 2026-10-04

The editor product pivot is prepared on `codex/vidro-editor-website` in `/Users/sky/code/vidro`, the existing website repository. The original `/Users/sky/code/vidro.pro` remains the preserved source checkout. The website keeps Vidro's branding, shows a live theme-switchable editor directly below the hero slogan, identifies the native Web Component alongside a framework/library carousel, embeds the four-preset playground, and uses adapted MIT-licensed SmoothUI pricing and footer. Price: **R$ 3 once**. Without `NEXT_PUBLIC_VIDRO_CHECKOUT_URL`, the purchase card opens the playground.

Scope: [.artifacts/specs/0001-editor-website.spec.md](../.artifacts/specs/0001-editor-website.spec.md). The small “Editor preview” badge requested for removal is absent from the hero. The marquee has a keyboard-operable pause/resume button and a reduced-motion fallback.

## Snapshot

- Approved fixed review base: Git empty tree `4b825dc642cb6eb9a060e54bf8d69288fbee4904`.
- Existing website HEAD and migration comparison: `40c801ad0fa84dd679df14d71d050b59e1c8783b`.
- Relevant tracked/untracked source: **254 files**, manifest SHA256 `34234a06d691e9d1d4702dfcb5f6aef232007931bec22f9c4287a691b07d388f`.
- [Manifest](runs/editor-website/snapshot.json) excludes generated/ignored output and `.audits/` review artifacts.
- Imported `packages/editor/src` matches the original editor source byte-for-byte. Its sandbox additionally implements website embedding and automatic height reporting.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Root `pnpm build` | Passed, four tasks | [Log](runs/editor-website/build.log) |
| Root `pnpm typecheck` | Passed, seven dependency/task executions | [Log](runs/editor-website/typecheck.log) |
| Clean-output typecheck graph | Passed with `packages/editor/dist` removed and Turbo cache bypassed; editor build finished before its sandbox/test typecheck | [Log](runs/editor-website/ci-clean-typecheck.log) |
| Root `pnpm lint` | Passed, website/shared workspace and editor | [Log](runs/editor-website/lint.log) |
| Development editor browser suite | 53 passed | [Log](runs/editor-website/test-development.log) |
| Production editor browser suite | 53 passed | [Log](runs/editor-website/test-production.log) |
| Development website | **13 passed**, no page errors or failed resources | [Results](runs/editor-website/development/results.json), [log](runs/editor-website/website-development.log) |
| Production website | **13 passed**, no page errors or failed resources | [Results](runs/editor-website/production/results.json), [log](runs/editor-website/website-production.log) |
| `pnpm sandbox` and `--preview` | Both served the website successfully | [Dev](runs/editor-website/sandbox-development.log), [production](runs/editor-website/sandbox-production.log) |
| Package watch/reload | Temporary public-entry probe appeared in the open playground frame, then disappeared after restoration | Witnessed Chromium check; build cycles recorded in development launcher log |
| Shared frame watch/reload | Temporary hero-entry probe appeared in the open hero frame; the playground frame also reloaded, and both recovered after restoration | Witnessed Chromium check against `pnpm sandbox --port 3004`; source restored byte-for-byte |
| Carousel | Seven marks loaded; keyboard pause/resume, animation, reduced motion, locale, mobile fit passed | [Focused log](runs/editor-website/frameworks/final-hero-check.log) |

The website checks cover hero placement, content-sized frame, public editor readiness, the hero's light/dark switch, page order, R$ 3 one-time price and fallback link, generated API documentation, four ready/read-only presets, playground resize, header/language controls, editing and Stone events, clipboard, file layouts, theme switching, forced colors, locale persistence, and mobile width. The saved [browser harness](runs/editor-website/website-checks.cjs) documents those interactions. It uses this machine's Playwright installation.

[Production desktop](runs/editor-website/production/desktop.png), [mobile](runs/editor-website/production/mobile.png), and [dark hero](runs/editor-website/frameworks/hero-dark.png) captures reflect the final layout. Earlier [dark playground](runs/editor-website/production/playground-dark.png), [forced colors](runs/editor-website/production/playground-forced-colors.png), and [mobile pricing](runs/editor-website/production/pricing-mobile.png) captures remain valid for those unchanged surfaces. Screenshots are local evidence, not owner acceptance.

A development build race was corrected by bundling website consumers after editor compilation completes. Both frames share one revision-polling hook and refresh together after a watched build. A pre-existing GitHub counter hydration mismatch under reduced motion was corrected by making its initial server/client value identical. CI installs version-matched Chromium before the migrated browser suite. The first PR `verify` job exposed an editor typecheck race on clean checkout: the sandbox resolved package declarations before `vidro:build` finished. A package-scoped Turbo dependency now runs that build first. The forced clean-output reproduction and full local CI sequence pass; the updated GitHub job must still be assessed on the PR.

Vite reports large Monaco chunks and its existing static/dynamic JSON import warning; builds succeed. The full playground remains lazy-loaded. Full Safari/Firefox/OS IME acceptance, a real checkout, package publication, owner visual acceptance, and a live Vercel deployment are not established by these local checks. The preview remains unfrozen.

## Standards and Spec

Final independent Standards review found **0 hard violations and 0 actionable Fowler-smell findings**. The earlier P3 duplicated frame-polling observation was resolved with the shared hook; the earlier keyboard-pause issue was fixed with a focusable, translated control. Final Spec review found **0 findings**. Both reviewers verified the 254-file snapshot against the working tree and staged index with no drift. Reviews were read-only and did not independently rerun tests.
