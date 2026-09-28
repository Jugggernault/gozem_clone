"use client";
import { useState } from "react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const PREFS = [
  { id: "trips", label: "Trajets et livraisons", on: true },
  { id: "promos", label: "Offres et promotions", on: true },
  { id: "gowin", label: "Points GoWin", on: true },
  { id: "sms", label: "SMS", on: false },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState(() => Object.fromEntries(PREFS.map((p) => [p.id, p.on])));
  return (
    <Page>
      <PageHeader title="Notifications" back="/account" />
      <div className="divide-y divide-border rounded-lg bg-surface py-xs shadow-card">
        {PREFS.map((p) => (
          <div key={p.id} className="flex min-h-touch-target items-center justify-between gap-md px-md py-xs">
            <span className="text-body-md">{p.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[p.id]}
              aria-label={p.label}
              onClick={() => setPrefs((s) => ({ ...s, [p.id]: !s[p.id] }))}
              className={cn("relative h-7 w-12 rounded-full transition-colors", prefs[p.id] ? "bg-primary-dark" : "bg-border")}
            >
              <span className={cn("absolute top-1 size-5 rounded-full bg-surface shadow-card transition-transform", prefs[p.id] ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>
        ))}
      </div>
    </Page>
  );
}
