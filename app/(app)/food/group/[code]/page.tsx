"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Copy, UserRound } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Skeleton } from "@/components/Skeleton";
import { Button, ButtonLink } from "@/components/ui/button";
import { GROUP_LINK } from "@/components/food/GroupOrderSheet";
import { GROUP_CODE, GROUP_GUESTS, findMenuItem, getRestaurant } from "@/lib/mock/restaurants";
import { linesSubtotal, useApp, type GroupMember } from "@/lib/store";

// Simulated guests: join, then add their items, one after the other (all done by ~5 s).
const SCRIPT = GROUP_GUESTS.flatMap((g, i) => [
  { at: 1200 + i * 2200, id: g.id, name: g.name, items: [] as GroupMember["items"] },
  { at: 2200 + i * 2200, id: g.id, name: g.name, items: g.items },
]);

function upsertMember(m: GroupMember) {
  const { food, updateGroup } = useApp.getState();
  if (!food.group) return;
  const members = food.group.members.some((x) => x.id === m.id) ? food.group.members.map((x) => (x.id === m.id ? m : x)) : [...food.group.members, m];
  updateGroup({ members });
}

export default function GroupOrderPage() {
  const { code } = useParams<{ code: string }>();
  const group = useApp((s) => s.food.group);
  const cart = useApp((s) => s.food.cart);
  const setGroup = useApp((s) => s.setGroup);

  // Opened from a shared link without a group yet: start one on Burger House with the current cart.
  useEffect(() => {
    if (group) return;
    const slug = cart.restaurantSlug ?? "burger-house";
    setGroup({ code: GROUP_CODE, restaurantSlug: slug, budget: 25000, deadline: "", payMode: "host", members: [{ id: "abed", name: "Abed (vous)", items: cart.items }], createdAt: new Date().toISOString() });
  }, [group, cart, setGroup]);

  const hasGroup = !!group;
  useEffect(() => {
    if (!hasGroup) return;
    const timers = SCRIPT.map((e) =>
      setTimeout(() => {
        const m = useApp.getState().food.group?.members.find((x) => x.id === e.id);
        if (m && (m.items.length > 0 || e.items.length === 0)) return; // already joined / already ordered
        upsertMember({ id: e.id, name: e.name, items: e.items });
        toast(e.items.length ? `${e.name} a ajouté ${e.items.length} articles` : `${e.name} a rejoint la commande`);
      }, e.at),
    );
    return () => timers.forEach(clearTimeout);
  }, [hasGroup]);

  if (!group) return null;
  const restaurant = getRestaurant(group.restaurantSlug);
  const subtotalOf = (m: GroupMember) => linesSubtotal(group.restaurantSlug, m.items);
  const total = group.members.reduce((n, m) => n + subtotalOf(m), 0);
  const pct = Math.min(100, Math.round((total / group.budget) * 100));
  const waiting = GROUP_GUESTS.filter((g) => !group.members.some((m) => m.id === g.id));

  return (
    <Page>
      <PageHeader title="Commande groupée" subtitle={`${restaurant?.name ?? ""} · Code ${code}`} back={`/food/${group.restaurantSlug}`} />

      <section className="rounded-lg bg-surface p-md shadow-card">
        <div className="flex items-baseline justify-between gap-sm">
          <p className="text-label-md text-ink">Budget</p>
          <p className="text-caption text-muted">
            <Price amount={total} className="text-label-md text-ink" /> / <Price amount={group.budget} className="text-caption" />
          </p>
        </div>
        <div className="mt-sm h-2 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-label="Budget utilisé" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div data-testid="budget-bar" className={pct >= 100 ? "h-full rounded-full bg-warning transition-all duration-300" : "h-full rounded-full bg-primary transition-all duration-300"} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-sm text-caption text-muted">{group.payMode === "host" ? "Vous payez pour tout le monde" : "Chacun paie sa part"}</p>
        <Button
          variant="ghost"
          className="-ml-md mt-xs"
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(`https://${GROUP_LINK}`);
            } catch {}
            toast.success("Lien copié ✓");
          }}
        >
          <Copy className="size-4" aria-hidden /> <span className="num">{GROUP_LINK}</span>
        </Button>
      </section>

      <h2 className="mb-sm mt-lg text-h3 text-ink">Participants · <span className="num">{group.members.length}</span></h2>
      <ul className="flex flex-col gap-sm">
        {group.members.map((m) => (
          <li key={m.id} data-testid={`member-${m.id}`} className="rounded-lg bg-surface p-md shadow-card">
            <div className="flex items-center gap-md">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-dark"><UserRound className="size-5" aria-hidden /></span>
              <p className="flex-1 text-label-md text-ink">{m.name}</p>
              <Price amount={subtotalOf(m)} className="text-ink" />
            </div>
            {m.items.length === 0 ? (
              <p className="mt-sm text-caption text-muted">Choisit ses plats…</p>
            ) : (
              <ul className="mt-sm flex flex-col gap-xs">
                {m.items.map((l) => {
                  const item = findMenuItem(group.restaurantSlug, l.itemId);
                  return item ? (
                    <li key={l.itemId} className="flex justify-between text-caption text-on-surface">
                      <span>{item.emoji} {item.name} <span className="num text-muted">× {l.qty}</span></span>
                      <Price amount={item.price * l.qty} className="text-caption text-muted" />
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </li>
        ))}
        {waiting.length > 0 && (
          <li className="rounded-lg border border-dashed border-border p-md">
            <p className="text-caption text-muted">En attente des autres participants…</p>
            <Skeleton className="mt-sm h-4 w-2/3 rounded-sm" />
          </li>
        )}
      </ul>

      <ButtonLink href={`/food/${group.restaurantSlug}?panier=1`} full className="mt-lg">
        Retour au panier
      </ButtonLink>
    </Page>
  );
}
