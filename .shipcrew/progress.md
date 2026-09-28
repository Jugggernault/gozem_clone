
## [shipcrew] stage `plan` done

## [shipcrew] stage `design` done
- DESIGN.md lint now 0 errors / 0 warnings: added page, meta-text, divider, status-success, status-warning, map-route-line components so no tokens are orphaned; style unchanged.
- Decision: success darkened #16A34A → #147A3A so status text passes AA on mint (4.5:1); prose updated.
- Brand board skipped: OpenPencil desktop app not connected (design/brand.fig + brand.png not produced). Decision: repo had no git, ran `git init` with .env* gitignored.

## [shipcrew] stage `design` done
- 16:50 [orchestrator] Planner dropped agreed P1/P2 scope; appended F13–F16 (multi-stop/change dest/promos/search, account+help+states+PWA, gas/shopping/QR, assistant). Build them after F12.

## [shipcrew] stage `scaffold` + F01 done
- Foundation committed: lib/mock/* (all feature data), one Zustand persist store in lib/store/slices/* (+ resetDemo, purchase()), lib/pricing.ts, shared components (BottomSheet, MapView, PinPad, ComingSoon, PageHeader, Price, SuccessCheck, MapScreen), stub page for every route.
- F01 passes locally (build, lint, 6/6 smoke at PORT=3100); Vercel part of AC5 skipped (local only). Decision: maplibre worker served from public/maplibre (postinstall copy), Next dev indicator disabled for e2e.
- Parallel tracks replace their route's page.tsx and extend only their own slice file; home (F02) is a minimal placeholder.

## [shipcrew] stage `build` tracks merged

### track errands
errands: F12 done: /delivery form with ?to= prefill, 1 500 FCFA quote, "Coursier Jean assigné", /delivery/tracking with the MapView moving marker and a timeline that advances to Livré on its own, wallet -1500, activity "Colis #GZ-2841" (type delivery).
F15 AC1-AC2 done: /gas (sizes, Recharge vs Bouteille neuve, livraison 500, 30-45 min) and /shopping (category chips, cart, checkout) both debit through purchase() and show the ErrandTracking timeline up to Livré. Shared UI is in components/errands/{Timeline,ErrandTracking}.tsx.
Tests: e2e/errands.spec.ts passes 3/3, plus a smoke step. No store or mock changes. F15 AC3 (QR pay) was out of scope.

### track food
F07 done: /food (search, category chips, 9 cards), /food/[slug] (sticky section tabs, steppers, toast "Ajouté au panier ✓", cart sheet 8 000 / 1 000 / 9 000 FCFA, persisted; "?panier=1" opens the cart).
F08 done: "👥 Commander ensemble" sheet (budget, date limite, pay mode) → gozem.app/group/X92K with Copier/Partager; /food/group/X92K where Aïcha and Rodrigue join by ~5 s, with per-person subtotals, budget bar and "Retour au panier".
F09 done: /food/checkout (Maison (Abomey-Calavi), Gozem Money, 1.2 s processing, SuccessCheck, "Paiement réussi ✓", insufficient-funds alert, no debit) → /food/order/[id] timeline that advances every 3 s; activity, transaction and notifications are added. e2e/food.spec.ts 6/6 and smoke 7/7 pass at PORT=3103, and the build passes. Shared edits: e2e/smoke.spec.ts only (+1 test).

### track home-account
home-account: F02 home, F13 AC4 Explorer search, F14 account subpages/help + mock support chat/manifest "Gozem Next", F16 /assistant scripted intents. e2e/home-account.spec.ts 19/19 + smoke 7/7 green at PORT=3105; build, tsc, eslint clean.
Integration: /ride/options is reached with store destinationId set (+ ?to=<placeId>); assistant booking -> /ride/schedule?from=maison&to=aeroport&when=tomorrow&time=07:00&vehicle=zem and sets s.ride.schedule {mode:"tomorrow",time:"07:00"}; parcel -> /delivery?to=Calavi.
TODO for food/activity owners (F14 AC3/AC4): use `useMockService` (lib/hooks/useMockService.ts) + `<Skeleton>` while loading, `<ErrorState onRetry>` ("Une erreur est survenue." / "Réessayer") and `<EmptyState>` (components/States.tsx) on /food and /activity; those pages were left untouched here to avoid merge conflicts.

### track money
Track money: F10 (/wallet balance + eye + Recevoir/Recharger/Retirer sheets, /activity tabs + À venir/Aujourd'hui/Hier/Plus tôt + empty state, /activity/[id] receipt, /gowin redeem, /notifications mark-all-read), F11 (/ride/schedule, /wallet/send +229 → amount → PIN), F15 AC3 (/wallet/pay QR → Burger House 8 500 FCFA → PIN).
No store or shared-component changes; new helper lib/money.ts. e2e/money.spec.ts 7/7 green, plus one smoke step.
Integration: F02 home quick action "Réserver un trajet" must link to /ride/schedule (prefill supported: ?to=aeroport&from=maison&when=tomorrow&time=07:00).

### track ride-booking
ride-booking: F03 done: /ride/search (map, autofocused Destination, Maison/Travail/Lieu récent chips, accent-insensitive search, empty state), /ride/options (route + idle vehicles, 4 vehicle quotes, ⚙ Options schedule sheet, max 2 stops raising price/ETA, `?to=<placeId>` deep link), /ride/confirm (itinerary, vehicle, price, payment → setPhase("searching") → /ride/matching).
F13 AC3 done: /promotions "Offres pour vous" lists PROMOS; Activer on RIDE20 sets ride.activePromoId → /ride/options shows Zem 1 200 FCFA with "Promo -20%" tag + struck original price.
Tests: e2e/ride-booking.spec.ts (3/3) + smoke step. Gotcha: selectRideQuote returns a fresh object, so use useShallow(selectRideQuote) or you get a render loop.

### track ride-trip
ride-trip: F04 (matching radar → /ride/tracking hero with persisted 1 s timeline, gliding/rotating driver, chat/call sheets, "Simuler l'arrivée"), F05 (safety panel, share gozem.app/t/8K92X copy + WhatsApp, SOS countdown), F06 (/ride/complete rating/tags/tip/receipt; Terminer → debit ride + tip, +50 pts, activity, notification, resetRide), F13 AC1–AC2 (in-trip stops max 2, change destination with price diff).
Code: app/(app)/ride/{matching,tracking,complete}/page.tsx + app/(app)/ride/_trip/{trip.ts,DriverCard.tsx,sheets.tsx}; only shared edit is one added smoke step. Tracking/complete seed the default airport ride when the store has none; the timeline pauses while a sheet is open.
Tests: e2e/ride-trip.spec.ts 9/9 green at PORT=3102. /wallet, /gowin, /activity are other tracks' stubs here, so F06 AC4 is asserted on the persisted store (123 500 FCFA, 2 500 pts, ride activity entry first).

## [shipcrew] integration
- Merged 6 track branches (ride-booking, ride-trip, food, money, home-account, errands) into main; the only conflict was e2e/smoke.spec.ts, and both sides' steps were kept.
- Integration fixes: the home quick actions now include "Réserver un trajet" (/ride/schedule) and "Envoyer un colis" (/delivery). /food uses useMockService, with skeletons, ErrorState and Réessayer (F14 AC3). /activity shows skeletons (F14 AC4). A smoke step was added for these. food.spec now waits past the skeleton and the hover-paused toasts.
- tsc and eslint (app/components/lib/e2e) are clean and npm run build passes. The full Playwright suite passes 60/60 at PORT=3100 against next start. All 16 features are marked passing; the Vercel part of F01 AC5 was skipped (local only).
