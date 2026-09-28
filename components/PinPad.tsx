"use client";
import { useState } from "react";
import { Delete, Loader2 } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { cn } from "@/lib/utils";

/**
 * 4-digit PIN sheet. Any 4 digits are accepted: onComplete runs, and if it returns (or resolves to)
 * a string, that string is shown as the error (e.g. "Solde insuffisant") and the PIN is cleared.
 */
export function PinPad({ open, onClose, onComplete, title = "Code secret Gozem Money", subtitle }: {
  open: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void | string | Promise<void | string>;
  title?: string;
  subtitle?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset on each opening (derived-state pattern, no effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setPin(""); setError(null); setBusy(false); }
  }

  const press = async (d: string) => {
    if (busy) return;
    setError(null);
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setBusy(true);
      const err = await onComplete(next);
      setBusy(false);
      if (typeof err === "string") { setError(err); setPin(""); }
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {subtitle && <p className="-mt-xs mb-md text-body-md text-muted">{subtitle}</p>}
      <div className="flex justify-center gap-md py-md" aria-label={`${pin.length} chiffres saisis sur 4`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("size-4 rounded-full border-2 border-ink transition-colors", i < pin.length && "bg-ink")} />
        ))}
      </div>
      <p role="alert" className="min-h-6 text-center text-caption text-error">{error}</p>
      {busy && <div className="flex justify-center text-muted"><Loader2 className="size-5 animate-spin" aria-label="Vérification" /></div>}
      <div className="mx-auto mt-sm grid max-w-72 grid-cols-3 gap-sm">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"].map((d, i) =>
          d ? (
            <button key={i} type="button" onClick={() => press(d)} className="num h-14 rounded-full bg-surface-sunken text-h2 text-ink hover:bg-border" aria-label={d}>
              {d}
            </button>
          ) : <span key={i} />,
        )}
        <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} className="grid h-14 place-items-center rounded-full text-ink hover:bg-surface-sunken" aria-label="Effacer">
          <Delete className="size-6" />
        </button>
      </div>
    </BottomSheet>
  );
}
