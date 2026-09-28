import type { Promo } from "@/lib/types";

// First 4 = home carousel. RIDE20 is applied through the ride slice (activePromoId) → Zem 1 500 → 1 200 FCFA.
export const PROMOS: Promo[] = [
  { id: "ride20", title: "-20% sur votre prochaine course", description: "Valable sur Zem, Tricycle, Taxi et Comfort", code: "RIDE20", badge: "-20%", appliesTo: "ride", discountPct: 20, href: "/promotions", emoji: "🏍️" },
  { id: "food-free", title: "Livraison offerte chez Chez Maman Bénin", description: "Tous les midis jusqu'à dimanche", code: "MIDI", badge: "Offert", appliesTo: "food", href: "/food/chez-maman-benin", emoji: "🍲" },
  { id: "burger", title: "Burger House : -10% dès 10 000 FCFA", description: "Parfait pour les commandes de groupe", code: "BURGER10", badge: "-10%", appliesTo: "food", discountPct: 10, href: "/food/burger-house", emoji: "🍔" },
  { id: "gowin", title: "Points GoWin doublés ce week-end", description: "×2 points sur tous vos trajets", code: "GOWINX2", badge: "×2", appliesTo: "any", href: "/gowin", emoji: "⭐" },
  { id: "colis", title: "Premier colis à 1 000 FCFA", description: "Envoyez un colis partout à Cotonou", code: "COLIS1000", badge: "Nouveau", appliesTo: "delivery", href: "/delivery", emoji: "📦" },
];
export const getPromo = (id?: string | null) => PROMOS.find((p) => p.id === id);
export const HOME_PROMOS = PROMOS.slice(0, 4);
