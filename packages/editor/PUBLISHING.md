# Publish vidropro

This release prepares `vidropro@0.1.0-preview.3` under MIT. Existing `0.1.0-preview.2` archives retain their original notice. Never republish an already used version or rename an old tarball to change its package identity.

## 1. Use the reviewed source

Merge the approved PR, then use a clean checkout of `main`. Keep local edits and old tarballs out of the release checkout. Use Node.js 24 or newer and the repository's pinned pnpm version.

```sh
git clone git@github.com:jonatassales/vidro.git vidropro-release
cd vidropro-release
pnpm install --frozen-lockfile
```

## 2. Verify the account and release

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
node -p "JSON.stringify(require('./packages/editor/package.json'), null, 2)"
```

The npm account must be `jonatassales`, the package name `vidropro`, the version `0.1.0-preview.3`, and the license `MIT`. Complete the requested two-factor authentication. If this version already exists, choose a new version and review that change before publishing.

## 3. Build and validate

```sh
pnpm lint
pnpm build
pnpm typecheck
VIDRO_PREVIEW=1 pnpm --filter vidropro test --workers=2
```

If Chromium is not installed for Playwright, install it with `pnpm --filter vidropro exec playwright install chromium` and rerun the browser check.

## 4. Pack the editor

```sh
cd packages/editor
npm pack --dry-run
npm pack
tar -xOf vidropro-0.1.0-preview.3.tgz package/package.json
tar -xOf vidropro-0.1.0-preview.3.tgz package/LICENCE.md
tar -tzf vidropro-0.1.0-preview.3.tgz
```

Check the name, version, MIT text, JavaScript, types, assets/workers, README, original sources/build inputs, and third-party notices. Install this exact tarball in a separate browser application and verify initialization and its production build. Do not install the tarball inside `packages/editor`: that would create a dependency on itself.

## 5. Publish the checked tarball

This command writes to the public registry:

```sh
npm publish ./vidropro-0.1.0-preview.3.tgz \
  --access public \
  --tag preview \
  --registry=https://registry.npmjs.org/
```

The package explicitly configures public access and the Preview channel. npm may accept the upload before its publish-time scan finishes. Wait for the exact version to become available; do not republish merely because it is still processing.

```sh
npm view vidropro@0.1.0-preview.3 version license dist.integrity \
  --registry=https://registry.npmjs.org/
npm view vidropro dist-tags --registry=https://registry.npmjs.org/
```

## 6. Choose the default installation channel

Preview users install with `npm install vidropro@preview`.

If this MIT Preview should also be the version installed by `npm install vidropro`, explicitly move `latest` after the version is available:

```sh
npm dist-tag add vidropro@0.1.0-preview.3 latest \
  --registry=https://registry.npmjs.org/
npm view vidropro@latest version license --registry=https://registry.npmjs.org/
```

This changes the default channel; it does not make the Preview a stable 1.x release or rewrite old archives. Confirm `0.1.0-preview.3` and `MIT`, then install `vidropro` in a fresh consumer. Keep release announcements clear that the API remains Preview.

## References

- [npm publish](https://docs.npmjs.com/cli/v12/commands/npm-publish/)
- [Distribution tags](https://docs.npmjs.com/cli/v12/commands/npm-dist-tag/)
- [Publish-time scanning](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/)
