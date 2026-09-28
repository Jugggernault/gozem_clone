import type { ReactNode } from "react";
import { CircleAlert, Inbox } from "lucide-react";
import { Button } from "./ui/button";

/** Error state for mock services ("Simuler une erreur"). */
export function ErrorState({ onRetry, message = "Une erreur est survenue." }: { onRetry: () => void; message?: string }) {
  return (
    <div role="alert" className="mt-lg flex flex-col items-center gap-md rounded-lg bg-surface p-xl text-center shadow-card">
      <span className="grid size-12 place-items-center rounded-full bg-surface-sunken text-error">
        <CircleAlert className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-h3 text-ink">{message}</p>
        <p className="mt-xs text-body-md text-muted">Vérifiez votre connexion puis réessayez.</p>
      </div>
      <Button variant="secondary" onClick={onRetry}>Réessayer</Button>
    </div>
  );
}

/** Friendly empty state (icon + title + body + optional action). */
export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="mt-lg flex flex-col items-center gap-md rounded-lg bg-surface p-xl text-center shadow-card">
      <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-dark">{icon ?? <Inbox className="size-6" aria-hidden />}</span>
      <div>
        <p className="text-h3 text-ink">{title}</p>
        {body && <p className="mt-xs text-body-md text-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}
