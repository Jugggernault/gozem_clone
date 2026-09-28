"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Share2, Users } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { Button, buttonClass } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { GROUP_CODE } from "@/lib/mock/restaurants";
import { cn } from "@/lib/utils";

export const GROUP_LINK = `gozem.app/group/${GROUP_CODE}`;

const defaultDeadline = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

async function copyLink() {
  try {
    await navigator.clipboard?.writeText(`https://${GROUP_LINK}`);
  } catch {}
  toast.success("Lien copié ✓");
}

export function GroupOrderSheet({ open, onClose, restaurantSlug }: { open: boolean; onClose: () => void; restaurantSlug: string }) {
  const cart = useApp((s) => s.food.cart);
  const setGroup = useApp((s) => s.setGroup);
  const [budget, setBudget] = useState(25000);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [payMode, setPayMode] = useState<"host" | "split">("host");
  const [created, setCreated] = useState(false);

  const create = () => {
    setGroup({
      code: GROUP_CODE,
      restaurantSlug,
      budget: Math.max(1000, budget || 0),
      deadline,
      payMode,
      members: [{ id: "abed", name: "Abed (vous)", items: cart.restaurantSlug === restaurantSlug ? cart.items : [] }],
      createdAt: new Date().toISOString(),
    });
    setCreated(true);
  };

  const share = async () => {
    const text = `Commande groupée Gozem : ajoutez vos plats ici https://${GROUP_LINK}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Commander ensemble", text });
        return;
      } catch {}
    }
    await copyLink();
  };

  const field = "h-13 w-full rounded-md bg-surface-sunken px-md text-body-lg text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary-dark";

  return (
    <BottomSheet open={open} onClose={onClose} title="👥 Commander ensemble">
      {!created ? (
        <form
          className="flex flex-col gap-md"
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
        >
          <p className="text-body-md text-muted">Invitez vos amis ou collègues à ajouter leurs plats dans une seule commande.</p>
          <label className="flex flex-col gap-xs">
            <span className="text-label-md text-ink">Budget max</span>
            <input type="number" inputMode="numeric" min={1000} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className={cn(field, "num")} />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-md text-ink">Date limite</span>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={field} />
          </label>
          <fieldset className="flex flex-col gap-sm">
            <legend className="mb-xs text-label-md text-ink">Paiement</legend>
            {(
              [
                ["host", "Je paie pour tout le monde"],
                ["split", "Chacun paie sa part"],
              ] as const
            ).map(([id, label]) => (
              <label key={id} className={cn("flex min-h-touch-target cursor-pointer items-center gap-md rounded-lg border px-md", payMode === id ? "border-primary-dark bg-primary-soft" : "border-border bg-surface")}>
                <input type="radio" name="payMode" value={id} checked={payMode === id} onChange={() => setPayMode(id)} className="size-5 accent-primary-dark" />
                <span className="text-body-md text-on-surface">{label}</span>
              </label>
            ))}
          </fieldset>
          <Button type="submit" full>
            Créer le lien
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-md rounded-lg bg-primary-soft p-md">
            <Users className="size-6 shrink-0 text-primary-dark" aria-hidden />
            <div className="min-w-0">
              <p className="text-caption text-muted">Lien de la commande groupée</p>
              <p className="num truncate text-label-md text-ink">{GROUP_LINK}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-sm">
            <Button variant="secondary" onClick={copyLink}>
              <Copy className="size-4" aria-hidden /> Copier
            </Button>
            <Button variant="secondary" onClick={share}>
              <Share2 className="size-4" aria-hidden /> Partager
            </Button>
          </div>
          <Link href={`/food/group/${GROUP_CODE}`} className={buttonClass("primary", true)}>
            Voir la commande groupée
          </Link>
        </div>
      )}
    </BottomSheet>
  );
}
