"use client";
import { Sparkles } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./ui/button";

/** "Bientôt disponible" sheet for services that aren't in the demo yet. */
export function ComingSoon({ open, onClose, service }: { open: boolean; onClose: () => void; service?: string }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Bientôt disponible" footer={<Button full onClick={onClose}>Compris</Button>}>
      <div className="flex items-start gap-md">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-on-accent">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <p className="text-body-lg text-muted">
          {service ? <><strong className="text-on-surface">{service}</strong> arrive </> : "Ce service arrive "}
          très bientôt sur Gozem. Nous vous préviendrons dès son lancement.
        </p>
      </div>
    </BottomSheet>
  );
}
