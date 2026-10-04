> Historical compiler-era context. The editor and website pivot is governed by [09-editor-product.ctx.md](09-editor-product.ctx.md). Retain this record for legacy packages only.

# Repository topology

Vidro is a pnpm/Turborepo monorepo because the compiler, CLI, website, and docs have independent build/runtime concerns but share one repository.

```text
apps/
  website/
  docs/

packages/
  language/
  core/
  cli/
  design-system/
  react/

.agents/
  context/
  rules/
  skills/
```

## Boundaries

`packages/language` owns syntax and parser-generated structures.

`packages/core` owns semantics after parsing: IR, validation, repository detection, external resolution policy, and emitters.

`packages/cli` owns command UX and filesystem orchestration. It should call core behavior rather than reimplement compiler logic.

`packages/design-system` (`@vidro/design-system`) owns framework-agnostic visual tokens and the Tailwind theme.

`packages/react` (`@vidro/react`) owns shared React UI, interactions, and visual effects.

`apps/website` is the public single-page product site.

`apps/docs` is the public Nextra documentation.

Dependency direction:

```text
design-system
     ↓
   react
  ↙     ↘
website   docs
```

The website and docs must not become dependencies of compiler packages.

## Verification

GitHub Actions runs on pull requests and on pushes to `main`. It uses the repository-pinned Node 24 runtime and the repository pnpm version, installs with a frozen lockfile, then runs lint, typecheck, tests, and a production build.
