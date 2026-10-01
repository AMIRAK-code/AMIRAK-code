# Setup

This folder is the profile repository: **`AMIRAK-code/AMIRAK-code`**.
GitHub shows its `README.md` on <https://github.com/AMIRAK-code>.

## Publish

1. Create a **public** repository named exactly `AMIRAK-code` (no README).
2. From this folder:

   ```bash
   git init -b main
   git add .
   git commit -m "Profile README"
   git remote add origin https://github.com/AMIRAK-code/AMIRAK-code.git
   git push -u origin main
   ```

3. **Actions → Refresh activity artwork → Run workflow** once to confirm the
   refresh works. After that it runs daily at 04:17 UTC.

The workflow uses the built-in `GITHUB_TOKEN` with `contents: write` only;
no personal access token or secret is needed. The job requests write access
itself; only if a policy caps tokens at read-only will `git push` fail with a
403 — then choose **Settings → Actions → General → Workflow permissions →
Read and write permissions**.

GitHub pauses scheduled workflows in repositories with no activity for 60
days. If that happens, re-enable it from the Actions tab.

## Edit

| To change | Edit | Then run |
| --- | --- | --- |
| Name, roles, links, project copy, stack | `scripts/content.mjs` | `npm run build` |
| Card artwork, layout, colours | `scripts/build-assets.mjs`, `scripts/lib/*.mjs` | `npm run build` |
| README text and order | `README.md` | — |
| Typing line | the two `readme-typing-svg` URLs in `README.md` (dark and light) and `TYPING_LINES` in `build-assets.mjs` for the static fallback | `npm run build` |

`npm run activity` refreshes the activity image locally; `npm run check`
verifies every README path and that each SVG is self-contained. Node 20+;
no npm dependencies.

## Keep current

- **Employment timeline** (`work/employer.svg`) is drawn on a 2026 axis with
  open-ended bars. Update `EMPLOYER` in `content.mjs` when a role changes or
  in January 2027.
- **Project status chips** ("LIVE", "PROTOTYPE · MOCK DATA"…) are as of
  2026-10-01. Update them when a project ships or is retired.
