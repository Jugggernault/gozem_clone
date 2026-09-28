"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { selectUnreadCount, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Bell with unread badge → /notifications. data-testid="bell-badge" holds the count. */
export function BellButton({ className }: { className?: string }) {
  const unread = useApp(selectUnreadCount);
  return (
    <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} non lues` : ""}`} className={cn("relative grid size-touch-target place-items-center rounded-full text-ink hover:bg-surface-sunken", className)}>
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span data-testid="bell-badge" className="num absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-error px-1 text-caption text-on-error">
          {unread}
        </span>
      )}
    </Link>
  );
}
