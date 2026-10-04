# Historical compiler instructions

These rules apply only to the retained compiler packages and legacy docs, not the editor product or website. See [current product](09-editor-product.ctx.md).

# Vidro repository instructions

This repository is the canonical implementation space for Vidro.

## Loading order

1. Current code, configuration, grammar, and tests.
2. Explicit owner decisions.
3. This file.
4. Relevant `.agents/context/*.ctx.md` fragments.
5. Applicable `.agents/rules/*.rule.md`.

## Invariants

- Vidro is a declarative environment compiler, not a secret manager and not merely a dotenv loader.
- One `.vidro/<project>.vidro` source controls many environment files.
- The DSL is parsed with Langium.
- The compiler must lower the AST into an output-independent IR before any emitter runs.
- Generated IR belongs under `.vidro/.generated/`.
- Environment names are identifiers, not a closed keyword list.
- `PATH` belongs to a target, not to an environment.
- `default` represents the plain `.env` output.
- `KEY;`, `KEY: "";`, and `KEY: $KEY;` have different semantics.
- Secrets are represented in Vidro source as external references such as `RESEND_API_KEY: $RESEND_API_KEY;`; secret values must not be copied into tracked Vidro source.
- Scaffolding follows detect > infer > ask. Do not add questions for information that can be derived from repository files.
- Applications should not need duplicated runtime environment validators when Vidro is the environment gate.
- Do not silently normalize ecosystem-specific corner cases into generic dotenv behavior. Keep them explicit in compiler/detection policy.
- Root `DESIGN.md` is generated from the Airtable getdesign reference. It is a structural and rhythm reference only. Airtable branding, colors, illustrations, and identity are not Vidro product decisions.
- `@vidro/design-system` owns shared visual tokens. `@vidro/react` owns shared React UI and effects used by the website and docs.
- The website and docs consume those packages rather than duplicating a design system.
- Vidro is light-theme-only unless the owner explicitly changes that decision.
- Website examples and product copy must not claim compiler functionality that is not implemented.
- Documentation must distinguish canonical or designed semantics from currently implemented behavior.
