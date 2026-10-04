> Historical compiler-era context. The editor and website pivot is governed by [09-editor-product.ctx.md](09-editor-product.ctx.md). Retain this record for legacy packages only.

# Product context

Vidro is a future public NPM package, but its first real integration target is LangDrift.

## Problem

Environment management in a real monorepo is spread across environment files, setup scripts, validation scripts, loader precedence, runtime validation code, gitignore rules, and documentation. Vidro centralizes the contract.

## Product definition

> One project configuration → many environment files.

Vidro is a declarative environment compiler. It is not just a dotenv loader and it is not a secret manager.

Targets and environment identifiers describe physical environment files. `default` maps to `.env`. Any other environment name maps to `.env.<environment>`. The scaffolded CLI does not generate these files yet.

The canonical source is:

```text
.vidro/<project>.vidro
```

Vidro owns:

- private `.env` handling for secrets/external values;
- setup/materialization of environment files;
- validation of required values and managed outputs;
- environment-file precedence/orchestration that previously needed custom loaders;
- enough fail-fast validation that application-level duplicates such as `src/env.ts` are unnecessary.

The application should consume already-valid process/environment configuration.

## Initial commands

```text
vidro init
vidro generate
vidro validate
vidro check
vidro show
```
