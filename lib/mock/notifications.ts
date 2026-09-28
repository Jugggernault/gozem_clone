import type { AppNotification } from "@/lib/types";
import { daysAgo, hoursAgo } from "./seed-dates";

export function seedNotifications(): AppNotification[] {
  return [
    { id: "notif-seed-1", kind: "promo", title: "-20% sur votre prochaine course 🎉", body: "Activez l'offre RIDE20 dans Offres pour vous.", date: hoursAgo(2), read: false, href: "/promotions" },
    { id: "notif-seed-2", kind: "gowin", title: "Vous êtes Gold ⭐", body: "Plus que 2 550 points pour passer Platinum.", date: daysAgo(1, 9), read: true, href: "/gowin" },
    { id: "notif-seed-3", kind: "ride", title: "Trajet terminé", body: "Merci d'avoir voyagé avec Koffi A. · 1 200 FCFA", date: daysAgo(1, 8), read: true, href: "/activity" },
  ];
}
