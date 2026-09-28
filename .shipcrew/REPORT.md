# Gozem clone: demo report

## Run it locally
- `./init.sh` runs `npm install`, then `next dev -p 3000`. Open **http://localhost:3000**. Use `PORT=xxxx ./init.sh` to change the port.
- Production mode: `npm run build && npx next start -p 3000`.
- Tests: `PORT=3400 npx playwright test`. They use system Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` to use another. Never run `playwright install`.
- There is no database or env vars. All data is client-side mocks in `lib/mock/`, saved in localStorage (`gozem-demo`). **Compte → Réinitialiser la démo** resets it.

## Status
- 16 of 16 features pass. None are blocked.
- `npx tsc --noEmit` and eslint are clean, and `npm run build` passes.
- Playwright: **61/61** passed in parallel against `next start -p 3400`.

| ID | Feature | Status |
|---|---|---|
| F01 | App shell, design tokens, login splash, nav | Pass. The Vercel part of AC5 was skipped because the run is local only. |
| F02 | Home | Pass. The QA emoji fix is applied. |
| F03 | Ride search → vehicle options → confirm | Pass. The QA emoji fix is applied. |
| F04 | Matching + live tracking | Pass |
| F05 | Safety center + share trip | Pass |
| F06 | Completion, rating, tip, receipt | Pass. The QA emoji fix is applied. |
| F07 | Food: browse, restaurant, cart | Pass |
| F08 | Group order | Pass |
| F09 | Food checkout + tracking | Pass |
| F10 | Wallet, Activité, GoWin, Notifications | Pass |
| F11 | Scheduled ride + wallet transfer | Pass |
| F12 | Parcel delivery | Pass |
| F13 | Multi-stop, change destination, promos, Explorer search | Pass |
| F14 | Account subpages, help, loading/error/empty states | Pass |
| F15 | Gaz, Courses, QR pay | Pass |
| F16 | Gozem Assistant | Pass |

### QA fix in this pass
- **Problem:** emoji used as icons showed as tofu boxes on hosts without an emoji font. This hit the Home services grid, promos, "Bonjour Abed 👋", the vehicle icons, "Vous êtes arrivé 🎉" and the wallet and activity icons.
- **Fix:** a self-hosted **Noto Color Emoji** loaded through `next/font/google`, used as a fallback in `--font-sans` and `--font-mono`. It downloads only when the page contains emoji. No dependency was added and no copy changed.
- **Check:** confirmed on screenshots at 390px. A new smoke test checks that the font loads.

### Minor gaps (non-blocking, not in the ACs)
- The Home quick actions show "Aéroport" where the PRD says "Favoris".
- The rating tag reads "Conduite sûre" where the PRD says "Conduite agréable".
- The tip options have no "Autre" choice, and the receipt has no Partager or Signaler un problème buttons.
- The share sheet has no SMS option.
- Distances are written "4.8 km" on search and options but "4,8" elsewhere.
- The seeded Gold notification says 2 550 pts, but GoWin says 2 500.
- A native horizontal scrollbar shows under the Home chips at 1280px.
- On one cold first visit, the map on `/ride/search` stayed blank. It rendered after a reload.

## Security
The static review found no critical or high issues (see `.shipcrew/security.md`).
- There is no XSS or open redirect: query params are only shown as escaped React text or matched against mock places.
- There is no `dangerouslySetInnerHTML` or `eval`.
- No secrets or `process.env` are used in app code, and `.env*` files are gitignored.
- `npm audit --omit=dev` reports 0 vulnerabilities.

Accepted risks:
- The saved localStorage state is trusted when it is reloaded. Only a user editing their own storage can break it.
- Links in mock notifications and promos come from seed data.
- The PIN pad accepts any 4 digits, as the PRD intends.
- There are no CSP or security headers.

## Before a Vercel deploy
1. Create and link the Vercel project, then deploy. Complete the F01 AC5 URL check against the deployed URL.
2. Add security headers (CSP, `X-Frame-Options`, `Referrer-Policy`) in `next.config.ts`. The CSP must allow the OpenFreeMap tiles, `images.unsplash.com` and the `next/font` files.
3. The build fetches Google Fonts (Geist and Noto Color Emoji), so it needs network access. Vercel has it; an offline build machine would fail.
4. Optional: host the Unsplash restaurant images yourself and the map style or tiles too, so the demo doesn't depend on third-party DNS or rate limits.
5. Optional polish: the minor PRD gaps listed above.
6. Set up CI with `CI=1 npx playwright test`, which builds and then runs `next start`. The dev server is flaky under parallel compile load.
