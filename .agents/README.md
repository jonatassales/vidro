# Vidro agent harness

`.agents/` contains focused repository context and implementation rules, following the same fragmented-context shape used by LangDrift.

## Directory map

- `context/` — current editor product and retained historical compiler decisions.
- `rules/` — implementation invariants that apply when their scope matches the task.
- `skills/` — reserved for repeatable implementation procedures.

## Loading order

1. Explicit owner decisions.
2. Current code, config, and tests.
3. [AGENTS.md](../AGENTS.md).
4. Relevant `.agents/context/*.ctx.md`.
5. Applicable `.agents/rules/*.rule.md`.

Start with `context/09-editor-product.ctx.md` for editor and website work. Compiler rules apply only to legacy packages; do not apply them to the new editor product.
