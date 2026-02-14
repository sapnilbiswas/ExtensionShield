# Pre-push / CI checks

Run these before pushing to avoid failing **SEO Smoke Test** and **Security Audit** on `main`/`master`.

## One command (recommended)

From the **frontend** directory:

```bash
cd frontend && npm run ci:check
```

This runs, in order:

1. **Build** – `npm run build` (sitemap + Vite build)
2. **Security audit** – `npm audit --audit-level=high` (fails only on high/critical)
3. **SEO smoke test (CI config)** – same pages and options as GitHub Actions

## What CI runs

| Check | Workflow | Command (in `frontend`) |
|-------|----------|--------------------------|
| **Security Audit** | `security-audit.yml` | `npm audit --audit-level=high` |
| **SEO Smoke Test** | `seo-test.yml` | `npm run seo:test` with `SEO_SKIP_ROBOTS_TXT=1`, `TEST_PAGES` without `/glossary` |

## Individual commands

- **Build:** `npm run build`
- **Audit (high/critical only):** `npm run audit:ci` or `npm audit --audit-level=high`
- **SEO test (full, includes glossary):** `npm run seo:test`
- **SEO test (CI parity):** `npm run seo:test:ci`

## Notes

- **robots.txt:** CI skips the canonical-domain robots check (`SEO_SKIP_ROBOTS_TXT=1`) until production serves a robots.txt that allows crawling. See `frontend/public/robots.txt` and [seo-verification-production.md](./seo-verification-production.md).
- **Glossary:** `/glossary` is excluded from CI SEO test because the live page can exceed the wait timeout; re-enable in `.github/workflows/seo-test.yml` when the page is fixed.
