# Changelog

## 0.1.0-preview.1 (unreleased)

- Added `uiLocale` for localized editor controls and `localizationStatus` for honest Monaco catalog coverage. English remains the default; syntax selection remains `language`.
- Load official Simplified Chinese and Japanese Monaco catalogs before runtime initialization. Brazilian Portuguese and Vietnamese controls are localized, while their unavailable Monaco catalogs are reported as English fallbacks.
- Localized clipboard feedback, comparisons, accessible names, and complete plural-aware count messages across five locales.

## Earlier preview work

- Began the Vidro preview package with a built `<vidro-editor>` browser import, package-owned Monaco assets, and a public browser smoke test.
- Added canonical `vidro-change` notifications for user edits and external replacements, with a Jotai-owned sandbox draft.
