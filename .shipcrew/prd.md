# Gozem Next — PRD (locked)

## Goal
Interactive, realistic-mock prototype of a modernised Gozem super-app (Bénin: Cotonou, Abomey-Calavi, Porto-Novo) combining Gozem's services with Uber-grade UX. UI entirely in **French**, prices in **FCFA** (format `1 500 FCFA`, narrow no-break space thousands). Core promise: "Je veux aller quelque part → je vois immédiatement comment y aller, combien cela coûte et quand j'arriverai." A first-time user must spontaneously complete the Demo script below. The ride tracking screen is the visual "wow" priority.

## Users
- Demo audience (investors / product team) watching a 5–10 min walkthrough.
- Seeded persona: **Abed-Négo** ("Abed"), +229 97 12 34 56, Gold GoWin (2 450 pts), Gozem Money balance 125 500 FCFA, addresses Maison (Abomey-Calavi), Travail (Ganhi, Cotonou), Université (UAC, Abomey-Calavi). No auth: `/login` is a single splash "Continuer" screen.

## Principles for every mock
Everything is simulated but must *feel real*: realistic delays (mock service functions are async with 300–1500 ms latency), skeleton loading, toasts (sonner) on every important action ("Trajet confirmé ✓", "Paiement réussi ✓", "Ajouté au panier ✓", "Trajet partagé ✓", "Adresse enregistrée ✓"), animated success checkmarks, realistic Beninese names/places/plates. Nothing is a dead button: every visible control does something plausible (at minimum a toast or sheet). Mock services live in `lib/services/*` with API-shaped functions (`getRideOptions, requestRide, findDriver, getRideStatus, completeRide, getRestaurants, getRestaurant, createOrder, getWallet, transferMoney, createDelivery, ...`) so a real backend can replace them later.

## Features

Tiering: **P0 = polished + fully working**, **P1 = working, lighter polish**, **P2 = minimal but clickable and plausible**.

### P0
1. **App shell & navigation** — bottom nav on <1024px (Accueil, Explorer, Activité, Wallet, Compte); on ≥1024px left sidebar + top bar (logo, global search, bell, avatar), map-based flows render map large with floating side panel instead of bottom sheet. Framer Motion page transitions.
   - AC: all 5 tabs reachable in both layouts; active tab indicated by more than colour (icon fill + label weight); browser back works in every flow.
2. **Home** — header "Bonjour Abed 👋", "📍 Cotonou", bell (unread badge) + avatar; "Que voulez-vous faire ?"; big "Où allez-vous ?" card; services grid (Se déplacer, Manger, Courses, Envoyer, Gaz, Gozem Money, Billetterie, Crédit — each icon, name, short desc, optional promo badge; Billetterie/Crédit open a "Bientôt disponible" sheet); quick actions (Maison, Travail, Favoris, Réserver un trajet, Envoyer un colis) — Maison/Travail jump straight to ride options with that destination; horizontal promo carousel (4 promos).
   - AC: tapping "Où allez-vous ?" or "Se déplacer" opens ride search; tapping Maison lands on vehicle options with destination Maison.
3. **Ride search** — full-screen real map (MapLibre GL + free keyless OSM-based style, e.g. OpenFreeMap; fall back to a plain tinted background if tiles fail), sheet with Départ "📍 Ma position" / Destination input autofocused; chips Maison/Travail/Lieu récent; typing filters mocked places with accent-insensitive matching (Aéroport International de Cotonou – Cadjehoun; Erevan; Fidjrossè; Ganhi; Akpakpa; Calavi; Université d'Abomey-Calavi; Place de l'Étoile Rouge; Dantokpa; + ~6 more), each with a subtitle and category; empty-result state.
   - AC: typing "aeroport" (no accent) shows the airport first; selecting it goes to options.
4. **Vehicle options + upfront price** — map shows user, destination, drawn route polyline, idle vehicles; sheet "Vers Aéroport de Cotonou · 12 min · 4.8 km"; options Zem 1 500/4 min, Tricycle 2 000/7 min, Taxi 3 000/9 min, Gozem Comfort 4 500/10 min (each icon, description, capacity, ETA, price, optional promo tag). Price deterministic from distance per vehicle (scenario values above for the airport). Selected option shows "Prix estimé … Inclut ✓ Prise en charge ✓ Trajet ✓ Frais de service — Prix garanti*". Payment method selector (Gozem Money default / Cash / Mobile Money). "⚙ Options" opens sheet: Réserver (Maintenant / Aujourd'hui / Demain / Choisir une date — native date+time inputs), Passager (Moi / Quelqu'un d'autre + name/phone), + Ajouter un arrêt (max 2), Préférences toggles (Climatisation, Pas d'appel, Bagages).
   - AC: price visible before confirm; changing vehicle updates price/ETA; adding a stop recalculates price & ETA.
5. **Confirm** — "Confirmer votre trajet", pickup → destination (with stops), vehicle, price, payment, CTA "Confirmer le trajet".
6. **Matching** — pulse/radar animation "Recherche d'un chauffeur..." (0 s), "Recherche de chauffeurs à proximité" (1.5 s), "Chauffeur trouvé ✓" (3 s) with driver card: Koffi A., ⭐ 4.9, 1 284 trajets, Zem Honda Wave, AB 1234 RB (vehicle/driver matches chosen type — each type has its own driver). Cancel possible during search.
7. **Ride tracking (hero screen)** — full map with user, animated driver marker (smooth interpolated motion + heading rotation along a hardcoded Cotonou path, step every 1.5 s), destination, route, live ETA & distance countdown; floating back and "🛡 Sécurité" buttons; sheet "Koffi arrive dans 3 min" → phases driver_arriving → arrived ("Votre chauffeur est arrivé") → in_progress ("En route vers … · arrivée 16:42") → completed. Buttons Message (mock chat sheet with canned driver replies), Appeler (mock call sheet with timer), Partager mon trajet. "Simuler l'arrivée" discreet demo control to fast-forward.
   - AC: driver visibly moves without page interaction; ETA decreases; states progress automatically to completion.
8. **Ride completion, rating, tip, receipt** — "Vous êtes arrivé 🎉", price, "Payé avec Gozem Money"; 5-star rating + tags (Ponctuel, Sympathique, Conduite agréable, Véhicule propre); optional tip (200/500/1 000/Autre); receipt (Course 1 300 + Frais 200 = 1 500 FCFA, date/time), actions Télécharger (toast) / Partager / Signaler un problème; "Terminer" returns home. Wallet debited, transaction + activity entry + GoWin points (+50) + notification added.
9. **Food** — "Que voulez-vous manger ?", search, categories (Burgers, Pizza, Poulet, Asiatique, Healthy, Desserts) filtering, restaurant cards (image via Unsplash-style remote or local assets, rating, time, fee, promo, distance; ≥8 restaurants incl. Burger House and local cuisine e.g. "Chez Maman Bénin"); restaurant detail with sticky section tabs (Populaire, Burgers, Menus, Boissons, Desserts), items with qty stepper; cart sheet with subtotal/delivery/total; checkout with address, payment (Gozem Money), Processing 1.2 s → Success; order tracking timeline (Restaurant confirme → Préparation → Coursier assigné → En livraison → Livré, auto-advancing).
   - AC: add Classic Burger ×2 + Coca ×2 → subtotal 8 000, delivery 1 000, total 9 000 FCFA; checkout debits wallet and creates activity + transaction.
10. **Gozem Money wallet** — balance 125 500 FCFA (hide/show toggle), actions Envoyer / Recevoir (QR + number display) / Payer (QR pay, P2) / Recharger (Mobile Money mock) / Retirer; transaction list. Transfer flow: phone (+229 validation) → amount → message → confirmation "Envoyer 10 000 FCFA à Koffi A." (contact name resolved from mock contacts) → 4-digit PIN pad (any PIN works except show error on insufficient balance) → success.
   - AC: balance decreases by transferred amount; insufficient-funds error shown.
11. **Activity** — unified timeline, tabs Tout / Trajets / Commandes / Livraisons / Paiements, grouped Aujourd'hui / Hier / earlier, seeded + live entries; tapping opens detail (receipt-like). Empty state per tab.
12. **GoWin** — "⭐ 2 450 points", level Gold with progress to next tier, rewards (500 pts → 500 FCFA de réduction; 1 000 → Livraison gratuite; 2 500 → Course offerte) redeemable (deduct points, toast), points history.

### P1
13. **Scheduled ride** — from Options or home quick action "Réserver un trajet": Demain 07:00, Maison → Aéroport → "Trajet programmé ✓ Demain à 07:00 … ✓ Chauffeur assigné avant votre départ"; listed in Activité as "À venir", cancellable.
14. **Multi-stop & change destination during trip** — in tracking: "+ Ajouter un arrêt" (up to 2) and "Modifier destination" (e.g. Akpakpa → "Nouveau prix +500 FCFA", confirm) recompute price/ETA and redraw route.
15. **Share trip** — sheet WhatsApp (opens `wa.me` with prefilled text) / SMS (`sms:` link) / Copier le lien (clipboard) with message "Abed est actuellement en trajet avec Gozem. Destination : … Arrivée prévue : 16:42 Suivre le trajet : gozem.app/t/8K92X". Public-looking `/t/[code]` read-only trip view.
16. **Safety center** — panel "Votre sécurité" ✓ GPS / ✓ Chauffeur identifié / ✓ Véhicule identifié; Partager mon trajet, Contacter un proche, Assistance, Urgence (confirmation dialog, then "Alerte envoyée" state with countdown/cancel). RideCheck-style mock prompt if the driver "stops" ("Tout va bien ?").
17. **Group order** — "👥 Commander ensemble" in restaurant: budget max, date limite, paiement (Je paie pour tout le monde / Chacun paie sa part) → link gozem.app/group/X92K (copy/share) → group cart view where simulated guests (Aïcha, Rodrigue) join and add items over a few seconds, per-person subtotals, budget bar.
18. **Parcel delivery** — form (retrait, destinataire nom/téléphone, adresse, Moto/Voiture, description taille) → price 1 500 FCFA → "Commander un coursier" → courier Jean assigned → tracking map (reuse ride tracking) with timeline ✓ Commande créée ✓ Coursier assigné ✓ Colis récupéré ● En livraison ○ Livré, Colis #GZ-2841 → Livré.
19. **Notifications** — center with unread state, mark all read, items generated by real events (ride, order, GoWin, promo); toast + bell badge on new ones.
20. **Promotions** — "Offres pour vous" page; applying a promo code/promo actually discounts the next ride price (−20%).
21. **Explore + global search** — persistent search (top bar desktop, Explorer tab mobile) across places, restaurants, products, services, history with categorised results.
22. **Account** — profile (Abed-Négo, ⭐ Utilisateur Gold, phone), Informations personnelles (editable), Adresses (list + "+ Nouvelle adresse" form), Moyens de paiement (radio Gozem Money / Cash / Mobile Money, default persisted), Sécurité (contacts de confiance), Notifications prefs, Langue (Français only, others "Bientôt"), Aide link, "Réinitialiser la démo".

### P2
23. **Gas** — sizes 6 kg / 12,5 kg / Petite bouteille, Bouteille neuve vs Recharge, livraison fee, ETA 30–45 min, order → tracking timeline.
24. **Shopping** — categories, product cards (Riz 5kg 4 500, Huile 1L 1 800, Lait 1 200, …), shared cart pattern, checkout.
25. **QR pay** — mock scanner (camera-style viewfinder animation, no real camera) → "Burger House · 8 500 FCFA · Payer" → PIN → success.
26. **Gozem Assistant** — discreet "✨ Gozem Assistant" button → chat UI with streaming-looking scripted responses from keyword/intent matching: "aéroport demain 7h" → booking proposal card that launches prefilled scheduled ride; "colis Calavi" → delivery flow prefilled; "restaurant près de moi" → restaurant cards; "combien dépensé cette semaine" → computed from real store activity. Fallback reply with suggestion chips.
27. **Help center** — search, categories, quick actions (Problème avec un trajet, Problème de paiement, Objet perdu, Signaler un problème, Contacter le support → mock support chat).
28. **UX states** — skeletons on list/detail screens, empty states, error state with "Réessayer" (demo toggle in account to inject errors), offline banner ("Vous êtes hors connexion…") driven by `navigator.onLine` + demo toggle.
29. **PWA** — web manifest (name, icons, theme #00A86B, standalone). No service worker.

## Data model
All client-side, Zustand stores persisted to `localStorage` (persist middleware), seeded from fixtures in `lib/mock/` (users, drivers, rides, restaurants, orders, products, transactions, notifications, promotions, addresses, places, contacts). Stores: useUserStore, useRideStore (status: idle | searching | matched | driver_arriving | arrived | in_progress | completed | cancelled), useOrderStore, useWalletStore, useNotificationStore, useActivity (derived or own store). Entities per PRD §72 (User, Ride, Driver, Order, Transaction) + Place {id,name,subtitle,category,lat,lng}, Delivery, GroupOrder, Promotion, Notification. Geo: real Cotonou coordinates; routes are hardcoded polylines per popular destination with a generic interpolated fallback. Money as integer FCFA.

## Non-goals
Real dispatch, real GPS, driver backend, real auth, real payments or Gozem Money integration, real restaurant ordering, push notifications, microservices, real geospatial routing, dynamic pricing, database (no Neon/Drizzle), real LLM calls (assistant is scripted but realistic), real camera, PDF generation (toast instead), i18n beyond French, dark mode, service worker/offline caching. Tests: one Playwright-style e2e smoke of the demo script only.

## Stack
Next.js (latest, App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion (`motion`) + Zustand (persist) + sonner + lucide-react + maplibre-gl (react-map-gl/maplibre) with a keyless OSM style. Font: Geist. Deploy: Vercel. Repo: local git `gozem-next` (private; no GitHub unless gh available).

Routes: `/login`, `(app)/` home, `/explore`, `/activity`, `/activity/[id]`, `/wallet`, `/wallet/send`, `/wallet/pay`, `/account` (+ subpages), `/notifications`, `/promotions`, `/ride/search`, `/ride/options`, `/ride/confirm`, `/ride/matching`, `/ride/tracking`, `/ride/complete`, `/ride/scheduled`, `/t/[code]`, `/food`, `/food/[restaurant]`, `/food/cart`, `/food/checkout`, `/food/order/[id]`, `/food/group/[code]`, `/delivery`, `/delivery/tracking`, `/shopping`, `/gas`, `/gowin`, `/assistant`, `/help`.

## Demo script (acceptance test)
1. Open `/` → "Bonjour Abed 👋 / Que voulez-vous faire ?".
2. Tap "Se déplacer".
3. Type "Aéroport" → pick "Aéroport International de Cotonou".
4. See Zem 1 500 FCFA 4 min, Tricycle 2 000 7 min, Taxi 3 000 9 min, Comfort 4 500 10 min.
5. Select Zem; open Options showing Maintenant / Réserver; keep Maintenant.
6. Confirmer le trajet.
7. Matching animation → "Chauffeur trouvé ✓" Koffi A. ⭐ 4.9 Honda Wave AB 1234 RB, arrive dans 3 min.
8. Tracking: driver moves on map.
9. Open Sécurité → Partager mon trajet → Copier le lien (toast).
10. Simuler l'arrivée → trip completes → rate 5★ + tags → tip 500 → Terminer → home.
11. Manger → Burger House → add Classic Burger ×2 + Coca ×2 → cart total 9 000 FCFA.
12. Commander ensemble → create group link (guests join) ; then normal checkout paid with Gozem Money → success → order tracking.
13. Wallet shows reduced balance and new transactions; GoWin shows increased points; Activité lists the ride and order; bell shows new notifications.
Secondary: scheduled ride (Demain 07:00 Maison → Aéroport → "Trajet réservé ✓"); parcel (Envoyer → … → Livré); wallet transfer (Envoyer → numéro → montant → confirmation → PIN → succès).
