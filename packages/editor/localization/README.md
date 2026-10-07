# Monaco 0.57.0 message catalogs

Monaco consumes `_VSCODE_NLS_MESSAGES` and `_VSCODE_NLS_LANGUAGE` before its
runtime modules are evaluated. Vidro uses that mechanism; it does not alter
Monaco source or rewrite rendered DOM labels. A document uses one Monaco locale.

`monaco-source.json` records every numeric NLS call site in the installed ESM
package, its exact English text, source module and original localization key.
The editor core is pinned to VS Code revision
[`6a598d4a13031703d483d103c1d934a36ad27971`](https://github.com/microsoft/vscode/tree/6a598d4a13031703d483d103c1d934a36ad27971),
as specified by [Monaco's release source](https://github.com/microsoft/monaco-editor/blob/v0.57.0/package.json).
There are 2,146 referenced IDs in a 2,153-slot table. IDs 20, 21 and 59–63 have
no call sites in the shipped ESM and retain null slots. Catalog completeness
means every referenced ID has a translation, not that unused slots are invented.

## Portuguese

`pt-BR.json` imports 2,111 unchanged messages from Microsoft's MIT-licensed
[vscode-loc catalog](https://github.com/microsoft/vscode-loc/blob/0f157dee0cdcbf58cdf51a221ee94751c7f35e75/i18n/vscode-language-pack-pt-BR/translations/main.i18n.json),
pinned at `0f157dee0cdcbf58cdf51a221ee94751c7f35e75`. Its SHA-256 is recorded
in the source manifest. The 26 reviewed messages in `pt-BR-supplement.json`
cover the remaining 30 IDs (missing upstream entries and English fallbacks). Five targeted corrections preserve literal code identifiers and executable sample fences in upstream translations. The license is packaged under `third-party/vscode-loc`.

To reproduce, check out the exact VS Code revision and download the pinned
`main.i18n.json` above, then run from `packages/editor`:

```sh
node scripts/import-monaco-pt-br.mjs /path/to/vscode /path/to/main.i18n.json
node scripts/check-monaco-catalogs.mjs pt-BR
```

The importer verifies the catalog hash, package version, original source keys,
and exact English messages. Repeated English strings are matched by occurrence
only when the source and emitted occurrence counts agree; ambiguous mappings
fail instead of guessing. It reproduces the checked-in catalog byte for byte.

## Vietnamese

`vi.json` is a Vidro-authored translation of the same pinned English messages.
Microsoft supplies no Vietnamese Monaco catalog. Translations are maintained as
source data, separately from generated distribution code. Product names, key
names, filenames, URLs, enum values, code settings and placeholder-only formatting
messages intentionally retain their technical spelling.

## Upgrade gate

`pnpm check:localization` verifies the installed Monaco version, every NLS ID and
English message against the source manifest, all catalog entries, and exact
placeholder multiplicity. The production build runs this gate automatically.
Updating Monaco requires rebuilding and reviewing the source mapping and all
catalogs together. Browser tests exercise Find, commands and context menus in
addition to Vidro controls; dictionary parity alone is not acceptance.

## Chinese and Japanese

Monaco's bundled catalogs contain null entries for newer messages. Reviewed
`zh-supplement.json` and `ja-supplement.json` provide those messages and replace
untranslated English fallbacks. `cjk-message-ids.json` maps their exact English
source to numeric IDs. These supplements are applied to a copy of the official
message array before editor initialization. The guard checks their English
source and requires supplement slots to be absent or equal to English. Separate numeric-ID corrections preserve code identifiers in existing translations; their original upstream text is checked before each replacement.

`unchanged-exceptions.json` records exact IDs and reasons for legitimate English-equivalent translations (key names, formatting-only messages, code terms, and words also valid in Portuguese). Any other unchanged English message fails the gate.
