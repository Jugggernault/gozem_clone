// Gozem Assistant: scripted, accent/case-insensitive intent matching over the live store.
import type { Restaurant, Transaction, TxCategory } from "@/lib/types";
import { getPlace, normalize, PLACES } from "@/lib/mock/places";
import { RESTAURANTS } from "@/lib/mock/restaurants";
import { quoteRide } from "@/lib/pricing";
import { formatFCFA } from "@/lib/format";

export const ASSISTANT_CHIPS = [
  "Je veux aller à l'aéroport demain à 7h",
  "Je veux envoyer un colis à Calavi",
  "Quel restaurant livre près de moi ?",
  "Combien ai-je dépensé cette semaine ?",
];

export type RideCard = { kind: "ride"; fromLabel: string; toId: string; toLabel: string; whenLabel: string; mode: "today" | "tomorrow"; time: string; vehicle: string; price: number; href: string };
export type ParcelCard = { kind: "parcel"; toLabel: string; href: string };
export type RestaurantsCard = { kind: "restaurants"; items: Restaurant[] };
export type SpendingCard = { kind: "spending"; total: number; lines: { label: string; amount: number }[] };
export type AssistantCard = RideCard | ParcelCard | RestaurantsCard | SpendingCard;
export type AssistantReply = { text: string; card?: AssistantCard; chips?: string[] };

const CATEGORY_LABELS: Record<TxCategory, string> = {
  ride: "Trajets", food: "Repas", delivery: "Livraisons", transfer: "Transferts", payment: "Paiements", topup: "Recharges",
  withdraw: "Retraits", gas: "Gaz", shopping: "Courses", tip: "Pourboires", refund: "Remboursements",
};

/** Debits of the last 7 days, total + per category (largest first). */
export function weeklySpending(transactions: Transaction[], now = Date.now()) {
  const since = now - 7 * 24 * 3600 * 1000;
  const by = new Map<string, number>();
  let total = 0;
  for (const t of transactions) {
    if (t.amount >= 0 || new Date(t.date).getTime() < since) continue;
    const label = CATEGORY_LABELS[t.category] ?? "Autres";
    by.set(label, (by.get(label) ?? 0) - t.amount);
    total -= t.amount;
  }
  return { total, lines: [...by].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount) };
}

/** Longest place name mentioned in the text (normalized), e.g. "aeroport" → aeroport. */
function findPlace(n: string) {
  const hits = PLACES.flatMap((p) => [p.id, normalize(p.shortName), normalize(p.name)].map((k) => ({ p, k: k.replace(/-/g, " ") }))).filter(({ k }) => k.length > 3 && n.includes(k));
  hits.sort((a, b) => b.k.length - a.k.length);
  return hits[0]?.p;
}

function parseTime(n: string) {
  const m = n.match(/(\d{1,2})\s*(?:h|:)\s*(\d{2})?/);
  if (!m) return null;
  return `${m[1]!.padStart(2, "0")}:${m[2] ?? "00"}`;
}

export function reply(input: string, ctx: { transactions: Transaction[] }): AssistantReply {
  const n = normalize(input).replace(/['’]/g, " ");

  if (/depens|budget|combien.*(paye|coute)/.test(n)) {
    const { total, lines } = weeklySpending(ctx.transactions);
    return {
      text: total ? "Voici vos dépenses Gozem Money des 7 derniers jours :" : "Vous n'avez rien dépensé ces 7 derniers jours. Bravo !",
      card: { kind: "spending", total, lines },
    };
  }

  if (/colis|envoyer|expedier|paquet|livrer un/.test(n)) {
    const place = findPlace(n) ?? getPlace("calavi")!;
    return {
      text: `Je prépare l'envoi de votre colis vers ${place.shortName}. Vérifiez les détails et choisissez le véhicule :`,
      card: { kind: "parcel", toLabel: place.shortName, href: `/delivery?to=${encodeURIComponent(place.shortName)}` },
    };
  }

  if (/restaurant|manger|faim|livre pres|repas|dejeuner|diner/.test(n)) {
    const items = [...RESTAURANTS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
    return { text: "Voici les restaurants qui livrent le plus vite près de vous :", card: { kind: "restaurants", items } };
  }

  const place = findPlace(n);
  if (place && /aller|trajet|course|emmene|conduis|vers|reserv|demain|aujourd/.test(n)) {
    const tomorrow = /demain/.test(n);
    const time = parseTime(n) ?? (tomorrow ? "07:00" : null);
    const q = quoteRide({ destinationId: place.id, vehicleId: "zem", stops: [] });
    if (time) {
      const mode = tomorrow ? "tomorrow" : "today";
      return {
        text: `C'est noté ! Je vous propose un Zem ${tomorrow ? "demain" : "aujourd'hui"} à ${time.replace(":", "h")} vers ${place.shortName}.`,
        card: {
          kind: "ride", fromLabel: "Maison", toId: place.id, toLabel: place.shortName, whenLabel: `${tomorrow ? "Demain" : "Aujourd'hui"} ${time}`, mode, time, vehicle: "Zem", price: q.price,
          href: `/ride/schedule?from=maison&to=${place.id}&when=${mode}&time=${encodeURIComponent(time)}&vehicle=zem`,
        },
      };
    }
    return {
      text: `Un Zem vers ${place.shortName} coûte environ ${formatFCFA(q.price)} (${q.durationMin} min). Voulez-vous le programmer ?`,
      chips: [`Je veux aller à ${place.shortName} demain à 7h`],
    };
  }

  return {
    text: "Je n'ai pas bien compris 🤔 Je peux réserver un trajet, envoyer un colis, trouver un restaurant ou analyser vos dépenses. Essayez par exemple :",
    chips: ASSISTANT_CHIPS,
  };
}
