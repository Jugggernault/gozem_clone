# Security review — gozem_clone (client-only demo, mock data)

Scope: static review of app/, components/, lib/, next.config.ts, build output (.next/static), deps.
Result: **no critical/high issues; no code changes required.**

## Fixed
- None needed.

## Accepted (with reason)
- **localStorage state (`gozem-demo`) trusted on rehydrate** (lib/store/index.ts). zustand v5 `persist` catches JSON.parse errors and still fires `onRehydrateStorage`, so corrupt JSON does not crash hydration. A hand-edited, well-formed but wrong-shaped payload could break rendering — self-inflicted only (same-origin, no other writers), and "Réinitialiser la démo" clears it.
- **Notification / promo `href` pushed via router** (notifications, promotions, home). Values come only from seeded mock data or internal code paths (`/activity`, ...); no user input reaches them. Tampering requires editing one's own localStorage (self-XSS, out of scope for a demo).
- **PinPad accepts any 4 digits** — by design (mock wallet, PRD), no real funds or auth.
- **No security headers / CSP** — local demo only, no deploy.

## False positives
- `/delivery?to=`, `/explore?q=`, `/ride/schedule?from&to&when&time`, `/ride/options?to=`: query params are rendered as React text nodes (auto-escaped) or looked up against the mock place table (`getPlace`); never used as href, HTML or redirect target. No XSS / open redirect.
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` anywhere.
- External link `https://wa.me/?text=...` uses `encodeURIComponent` and `rel="noreferrer"`; `tel:` link built from mock constant.
- Secrets: no `process.env` / `NEXT_PUBLIC_*` in app code; no `.env*` tracked (gitignored); grep of `.next/static` after `npm run build` for keys/URIs/private keys: none.
- `npm audit --omit=dev`: 0 vulnerabilities (next 16.3.6).

## Verification
- `npm run build`: OK.
- Playwright (PORT=3200, reusing the running dev server since another `next dev` held the project lock): 57/60 passed in parallel; the 3 failures (ride-booking F03 AC3-5, ride-trip F04 AC2+AC3, smoke F03) pass 3/3 when rerun serially — timing flakes under shared-server load, not regressions (no code changed).
