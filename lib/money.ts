// Date helpers for the wallet / activity / notifications screens (track "money").
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY = 86_400_000;

/** Whole days between today and `iso` (0 = today, 1 = yesterday, -1 = tomorrow). */
export const daysFromToday = (iso: string) => Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / DAY);

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** "Aujourd'hui", "Hier", "Demain" or "lun. 21 sept." */
export function dayLabel(iso: string) {
  const d = daysFromToday(iso);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  if (d === -1) return "Demain";
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

/** "Aujourd'hui à 14:05", "Demain à 07:00" … */
export const dateTimeLabel = (iso: string) => `${dayLabel(iso)} à ${formatTime(iso)}`;

export const ACTIVITY_EMOJI = { ride: "🏍️", order: "🍔", delivery: "📦", payment: "💳" } as const;
export const ACTIVITY_TYPE_LABEL = { ride: "Trajet", order: "Commande", delivery: "Livraison", payment: "Paiement" } as const;

export type DateGroup = "À venir" | "Aujourd'hui" | "Hier" | "Plus tôt";
export const DATE_GROUPS: DateGroup[] = ["À venir", "Aujourd'hui", "Hier", "Plus tôt"];
export function dateGroup(iso: string, scheduled = false): DateGroup {
  if (scheduled) return "À venir";
  const d = daysFromToday(iso);
  return d <= 0 ? "Aujourd'hui" : d === 1 ? "Hier" : "Plus tôt";
}
