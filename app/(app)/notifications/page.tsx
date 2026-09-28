"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellOff } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { selectUnreadCount, useApp } from "@/lib/store";
import { dateTimeLabel } from "@/lib/money";
import type { NotificationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_EMOJI: Record<NotificationKind, string> = { ride: "🏍️", order: "🍔", gowin: "⭐", promo: "🎉", wallet: "💸", delivery: "📦", system: "🔔" };

export default function NotificationsPage() {
  const items = useApp((s) => s.notifications.items);
  const unread = useApp(selectUnreadCount);
  const markRead = useApp((s) => s.markRead);
  const markAllRead = useApp((s) => s.markAllRead);
  const router = useRouter();

  return (
    <Page>
      <PageHeader title="Notifications" subtitle={unread ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est lu"} back={true}
        right={<Button variant="ghost" disabled={!unread} onClick={() => { markAllRead(); toast.success("Notifications lues ✓"); }}>Tout marquer comme lu</Button>} />
      {items.length === 0 ? (
        <div className="mt-lg flex flex-col items-center gap-sm rounded-lg bg-surface p-xl text-center shadow-card">
          <BellOff className="size-8 text-muted" aria-hidden />
          <p className="text-body-md text-muted">Aucune notification</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
          {items.map((n) => (
            <li key={n.id}>
              <button type="button" data-testid="notification" data-unread={!n.read}
                onClick={() => { markRead(n.id); if (n.href) router.push(n.href); }}
                className={cn("flex w-full items-start gap-md p-md text-left hover:bg-surface-sunken", !n.read && "bg-primary-soft")}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-body-lg shadow-card" aria-hidden>{KIND_EMOJI[n.kind]}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-body-md text-ink", !n.read && "text-label-md")}>{n.title}</p>
                  <p className="text-caption text-muted">{n.body}</p>
                  <p className="mt-xs text-caption text-muted">{dateTimeLabel(n.date)}</p>
                </div>
                {!n.read && <span className="mt-sm size-2.5 shrink-0 rounded-full bg-primary-dark" aria-label="Non lue" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
