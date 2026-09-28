import type { Address, Contact, PaymentMethod, Profile } from "@/lib/types";

export const SEED_PROFILE: Profile = {
  firstName: "Abed",
  name: "Abed-Négo",
  phone: "+229 97 12 34 56",
  email: "abed.nego@gmail.com",
  tier: "Gold",
  avatar: "AN",
};

export const SEED_BALANCE = 125_500;
export const SEED_POINTS = 2_450;
export const SEED_PAYMENT_METHOD: PaymentMethod = "gozem_money";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: "gozem_money", label: "Gozem Money", description: "Solde disponible" },
  { id: "cash", label: "Espèces", description: "Payer le chauffeur directement" },
  { id: "mobile_money", label: "Mobile Money", description: "MTN MoMo · Moov Money" },
];

export const SEED_ADDRESSES: Address[] = [
  { id: "maison", label: "Maison", detail: "Abomey-Calavi, quartier Zoca", placeId: "maison", icon: "home" },
  { id: "travail", label: "Travail", detail: "Ganhi, Cotonou", placeId: "travail", icon: "work" },
  { id: "universite", label: "Université", detail: "UAC, Abomey-Calavi", placeId: "universite", icon: "school" },
];

// Wallet transfer contacts: a +229 number resolves to a name.
export const CONTACTS: Contact[] = [
  { id: "koffi", name: "Koffi A.", phone: "+229 96 11 22 33" },
  { id: "aicha", name: "Aïcha S.", phone: "+229 97 45 67 89" },
  { id: "rodrigue", name: "Rodrigue H.", phone: "+229 95 23 45 67" },
  { id: "mireille", name: "Mireille D.", phone: "+229 61 78 90 12" },
  { id: "serge", name: "Serge K.", phone: "+229 66 34 12 90" },
];

export const TRUSTED_CONTACTS: Contact[] = [
  { id: "maman", name: "Maman", phone: "+229 97 00 12 34" },
  { id: "aicha", name: "Aïcha S.", phone: "+229 97 45 67 89" },
];

export const normalizePhone = (s: string) => s.replace(/\D/g, "");
/** Resolve a typed number to a known contact; unknown valid numbers fall back to Koffi A. for the demo. */
export const findContact = (phone: string) =>
  CONTACTS.find((c) => normalizePhone(c.phone) === normalizePhone(phone)) ?? CONTACTS[0];
/** +229 followed by 8 digits (spaces allowed). */
export const isBeninPhone = (s: string) => /^\+229\d{8}$/.test(s.replace(/\s/g, ""));

// GoWin tiers
export const TIERS = [
  { name: "Silver", min: 0 },
  { name: "Gold", min: 2000 },
  { name: "Platinum", min: 5000 },
] as const;
export function tierFor(points: number) {
  const i = TIERS.findLastIndex((t) => points >= t.min);
  const next = TIERS[i + 1];
  const cur = TIERS[i];
  return {
    tier: cur.name,
    next: next?.name ?? null,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - cur.min) / (next.min - cur.min) : 1,
  };
}

export const GOWIN_REWARDS = [
  { id: "r500", points: 500, title: "500 FCFA de réduction", description: "Sur votre prochaine course ou commande" },
  { id: "r1000", points: 1000, title: "Livraison gratuite", description: "Sur votre prochaine commande Gozem Food" },
  { id: "r2500", points: 2500, title: "Course offerte", description: "Un trajet Zem jusqu'à 2 000 FCFA" },
];
export const POINTS_PER_RIDE = 50;
