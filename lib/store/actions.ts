import type { ActivityInput } from "./slices/activity";
import type { NotificationKind, TxCategory } from "@/lib/types";
import type { AppState } from "./types";
import type { DebitResult } from "./slices/wallet";

type Store = { getState: () => AppState };

/**
 * One-call purchase side effects: debit wallet (fails cleanly on insufficient funds),
 * then add activity entry, GoWin points and a notification. Nothing happens if the debit fails.
 * Usage: const r = purchase(useApp, {...}); if (!r.ok) toast.error(r.error)
 */
export function purchase(
  store: Store,
  p: {
    amount: number;
    label: string;
    category: TxCategory;
    activity?: ActivityInput;
    points?: { n: number; label: string };
    notification?: { kind: NotificationKind; title: string; body: string; href?: string };
    skipDebit?: boolean; // e.g. cash payment: still records activity/points/notification
  },
): DebitResult | { ok: true; tx: null } {
  const s = store.getState();
  const res = p.skipDebit ? ({ ok: true, tx: null } as const) : s.debit(p.amount, { label: p.label, category: p.category });
  if (!res.ok) return res;
  if (p.activity) s.addActivity(p.activity);
  if (p.points) s.addPoints(p.points.n, p.points.label);
  if (p.notification) s.addNotification(p.notification);
  return res;
}
