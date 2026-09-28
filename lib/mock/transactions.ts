import type { Transaction } from "@/lib/types";
import { SEED_BALANCE } from "./user";
import { daysAgo } from "./seed-dates";

// Newest first. balanceAfter of the first one equals SEED_BALANCE.
export function seedTransactions(): Transaction[] {
  const rows: Omit<Transaction, "balanceAfter">[] = [
    { id: "tx-seed-1", label: "Trajet Zem · Travail", category: "ride", amount: -1200, date: daysAgo(1, 8) },
    { id: "tx-seed-2", label: "Recharge MTN MoMo", category: "topup", amount: 50000, date: daysAgo(1, 7) },
    { id: "tx-seed-3", label: "Commande Chez Maman Bénin", category: "food", amount: -4500, date: daysAgo(3, 13) },
    { id: "tx-seed-4", label: "Transfert reçu de Aïcha S.", category: "transfer", amount: 15000, date: daysAgo(5, 18) },
    { id: "tx-seed-5", label: "Paiement Erevan", category: "payment", amount: -12300, date: daysAgo(6, 17) },
  ];
  let bal = SEED_BALANCE;
  return rows.map((r) => {
    const t = { ...r, balanceAfter: bal };
    bal -= r.amount;
    return t;
  });
}
