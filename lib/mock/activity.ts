import type { ActivityEntry, PointsEntry } from "@/lib/types";
import { daysAgo } from "./seed-dates";

export function seedActivity(): ActivityEntry[] {
  return [
    { id: "act-seed-1", type: "ride", title: "Trajet vers Travail", subtitle: "Zem · Koffi A.", amount: 1200, date: daysAgo(1, 8), status: "completed", meta: { from: "Maison", to: "Ganhi, Cotonou", vehicle: "Zem", payment: "Gozem Money" } },
    { id: "act-seed-2", type: "order", title: "Chez Maman Bénin", subtitle: "Amiwo au poulet ×1 · Jus de bissap ×1", amount: 4500, date: daysAgo(3, 13), status: "completed", meta: { restaurant: "chez-maman-benin" } },
    { id: "act-seed-3", type: "payment", title: "Paiement Erevan", subtitle: "Paiement QR", amount: 12300, date: daysAgo(6, 17), status: "completed" },
  ];
}

export function seedPointsHistory(): PointsEntry[] {
  return [
    { id: "pts-seed-1", label: "Trajet vers Travail", points: 50, date: daysAgo(1, 8) },
    { id: "pts-seed-2", label: "Commande Chez Maman Bénin", points: 45, date: daysAgo(3, 13) },
    { id: "pts-seed-3", label: "Bonus niveau Gold", points: 500, date: daysAgo(12, 10) },
  ];
}
