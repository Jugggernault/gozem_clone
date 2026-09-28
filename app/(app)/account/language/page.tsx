import { Check } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";

const LANGS = [
  { id: "fr", label: "Français", available: true },
  { id: "en", label: "English", available: false },
  { id: "fon", label: "Fɔngbè", available: false },
  { id: "yo", label: "Yorùbá", available: false },
];

export default function LanguagePage() {
  return (
    <Page>
      <PageHeader title="Langue" back="/account" />
      <ul role="radiogroup" aria-label="Langue" className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
        {LANGS.map((l) => (
          <li key={l.id} role="radio" aria-checked={l.id === "fr"} aria-disabled={!l.available} className="flex min-h-14 items-center gap-md px-md">
            <span className={l.available ? "flex-1 text-label-md text-ink" : "flex-1 text-body-md text-muted"}>{l.label}</span>
            {l.available ? (
              <Check className="size-5 text-primary-dark" aria-label="Sélectionné" />
            ) : (
              <span className="rounded-full bg-accent-soft px-sm py-xs text-caption text-on-accent">Bientôt</span>
            )}
          </li>
        ))}
      </ul>
    </Page>
  );
}
