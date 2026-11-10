# Changelog

## 0.1.0-preview.3 (unreleased)

- Added the `es` UI locale (neutral Latin American Spanish) for Vidro controls, clipboard feedback, plural-aware counts with `es-419` number grouping, and Monaco messages from the official Monaco 0.57.0 Spanish catalog with a reviewed supplement and literal-code corrections. All six locales report complete catalog coverage.

## 0.1.0-preview.2 (unreleased)

- Added complete Vietnamese Monaco source messages and restored Brazilian Portuguese using the pinned Microsoft catalog with reviewed supplements.
- Filled missing and untranslated Chinese/Japanese messages before Monaco initialization; corrected literal code identifiers in upstream translations.
- Build checks validate every shipped NLS ID against exact Monaco 0.57.0 English source, placeholders, code tokens, URLs, and reviewed unchanged-text exceptions. All five locales now report complete catalog coverage.

## 0.1.0-preview.1 (unreleased)

- Added `uiLocale` for localized editor controls and `localizationStatus` for honest Monaco catalog coverage. English remains the default; syntax selection remains `language`.
- Load official Simplified Chinese and Japanese Monaco catalogs before runtime initialization. Brazilian Portuguese and Vietnamese controls are localized, while their unavailable Monaco catalogs are reported as English fallbacks.
- Localized clipboard feedback, comparisons, accessible names, and complete plural-aware count messages across five locales.

## Earlier preview work

- Began the Vidro preview package with a built `<vidro-editor>` browser import, package-owned Monaco assets, and a public browser smoke test.
- Added canonical `vidro-change` notifications for user edits and external replacements, with a Jotai-owned sandbox draft.
