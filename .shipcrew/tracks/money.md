Track money: F10 (/wallet balance + eye + Recevoir/Recharger/Retirer sheets, /activity tabs + À venir/Aujourd'hui/Hier/Plus tôt + empty state, /activity/[id] receipt, /gowin redeem, /notifications mark-all-read), F11 (/ride/schedule, /wallet/send +229 → amount → PIN), F15 AC3 (/wallet/pay QR → Burger House 8 500 FCFA → PIN).
No store or shared-component changes; new helper lib/money.ts. e2e/money.spec.ts 7/7 green, plus one smoke step.
Integration: F02 home quick action "Réserver un trajet" must link to /ride/schedule (prefill supported: ?to=aeroport&from=maison&when=tomorrow&time=07:00).
