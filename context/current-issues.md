# Current Issues

## Open Follow-Ups

- `app/layout.tsx` `icons.apple` still points at `/img/dlm-logo--hex.svg`. iOS Safari ignores SVG for `apple-touch-icon`, so home-screen installs fall back to a page screenshot instead of the logo. Fixing this needs a proper 180x180 (or larger square) PNG/ICO brand asset committed to `public/img/`. A candidate PNG (`DLM_Logo.png`) exists locally but is untracked and out of scope to commit as part of this fix, so this is deferred until a square PNG asset is deliberately added to the repo.
