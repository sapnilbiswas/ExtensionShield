# Console errors and health

This doc explains common browser-console messages on ExtensionShield and what to do about them.

## Summary: is the console "healthy"?

- **No.** Red errors in the console are real issues. They are **developer-facing** (only visible in DevTools), not shown to end-users. They should be fixed or understood so they don’t hide real bugs.

## What we fixed (401 Unauthorized)

- **Issue:** When you weren’t signed in, the app still called `GET /api/history?limit=20`. The server correctly returned **401 Unauthorized**, which showed up in the console.
- **Fix:** The app now calls the history API **only when the user is authenticated**. Unauthenticated users no longer trigger that request, so the 401 should no longer appear when you’re logged out.
- **Where:** `ScanContext`, `ReportsPage`, and `databaseService.getDashboardMetrics()` / `getRecentUrls()` only use the history endpoint when there is an access token.

## Other console messages (and what they mean)

### 1. Content Security Policy (CSP) – inline script blocked

- **Message:** Something like: *Executing inline script violates the following Content Security Policy directive 'script-src ...'.*
- **Cause:** Your CSP (in `_headers` or backend) allows `https://static.cloudflareinsights.com` for scripts, but **Cloudflare Web Analytics** (or similar) often injects **inline** scripts. CSP is blocking that inline execution.
- **Where it comes from:** Usually the script snippet added in the Cloudflare dashboard for your domain (e.g. `extensionshield.com`), not from the repo’s HTML.
- **Options:**
  - In **Cloudflare** → your site → Analytics / script: use their “CSP-friendly” or nonce-based setup if they offer it.
  - Or relax CSP by adding `'unsafe-inline'` to `script-src` (weaker security; only if you accept the risk).
  - See **[CSP_SECURITY_GUIDE.md](./CSP_SECURITY_GUIDE.md)** for more.

### 2. Failed to load resource: net::ERR_NAME_NOT_RESOLVED (Clearbit logos)

- **Message:** Failed to load resource for URLs like `https://logo.clearbit.com/sessionbuddy.com` or `https://logo.clearbit.com/github.com`.
- **Cause:** The browser couldn’t resolve or load the Clearbit logo URL (DNS failure, Clearbit down, or Clearbit blocking/restricting the request). The **homepage carousel** uses these URLs for extension logos.
- **User impact:** Low. The UI already has a fallback (SVG icon) when the image fails (`onError` hides the img and shows the icon). So the page still works; the console just reports the failed network request.
- **Options:**
  - Ignore if it’s rare (e.g. temporary DNS/network).
  - Or stop using Clearbit for those logos (e.g. set `logoUrl` to `null` for those cards in `HomePage.jsx`) so those requests are never made and the console stays clean.

## Should these be shown in the console?

- **Yes.** The browser will always show network failures and CSP violations in DevTools. You can’t “hide” them from the console from inside your app.
- **End-users** don’t see the console unless they open DevTools, so these messages are for developers and debugging.
- **Best practice:** Fix or mitigate the causes (like we did for the 401) so the console is as clean as possible and real issues are easier to spot.
