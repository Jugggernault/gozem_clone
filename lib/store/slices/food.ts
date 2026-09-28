import { FOOD_DELIVERY_FEE, findMenuItem } from "@/lib/mock/restaurants";
import { type AppState, type Slice, nowIso, uid } from "../types";

export type CartLine = { itemId: string; qty: number };
export type FoodCart = { restaurantSlug: string | null; items: CartLine[] };
export type GroupMember = { id: string; name: string; items: CartLine[] };
export type GroupOrder = { code: string; restaurantSlug: string; budget: number; deadline: string; payMode: "host" | "split"; members: GroupMember[]; createdAt: string };
export type FoodOrder = { id: string; restaurantSlug: string; items: CartLine[]; subtotal: number; deliveryFee: number; total: number; address: string; step: number; createdAt: string };
export type FoodState = { cart: FoodCart; group: GroupOrder | null; orders: FoodOrder[] };

export type FoodSlice = {
  food: FoodState;
  /** qty 0 removes the line. Adding from another restaurant starts a new cart. */
  setCartQty: (restaurantSlug: string, itemId: string, qty: number) => void;
  clearCart: () => void;
  setGroup: (g: GroupOrder | null) => void;
  updateGroup: (patch: Partial<GroupOrder>) => void;
  addOrder: (o: Omit<FoodOrder, "id" | "createdAt" | "step"> & { id?: string }) => FoodOrder;
  updateOrder: (id: string, patch: Partial<FoodOrder>) => void;
};

export const initialFood = (): FoodState => ({ cart: { restaurantSlug: null, items: [] }, group: null, orders: [] });

export const linesSubtotal = (slug: string | null, lines: CartLine[]) =>
  slug ? lines.reduce((sum, l) => sum + (findMenuItem(slug, l.itemId)?.price ?? 0) * l.qty, 0) : 0;
export const selectCartSubtotal = (s: AppState) => linesSubtotal(s.food.cart.restaurantSlug, s.food.cart.items);
export const selectCartCount = (s: AppState) => s.food.cart.items.reduce((n, l) => n + l.qty, 0);
export const selectCartTotals = (s: AppState) => {
  const subtotal = selectCartSubtotal(s);
  const deliveryFee = subtotal > 0 ? FOOD_DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
};

export const createFoodSlice: Slice<FoodSlice> = (set) => ({
  food: initialFood(),
  setCartQty: (restaurantSlug, itemId, qty) =>
    set((s) => {
      const base = s.food.cart.restaurantSlug === restaurantSlug ? s.food.cart.items : [];
      const exists = base.some((l) => l.itemId === itemId);
      const items =
        qty <= 0 ? base.filter((l) => l.itemId !== itemId)
        : exists ? base.map((l) => (l.itemId === itemId ? { ...l, qty } : l))
        : [...base, { itemId, qty }];
      return { food: { ...s.food, cart: { restaurantSlug: items.length ? restaurantSlug : null, items } } };
    }),
  clearCart: () => set((s) => ({ food: { ...s.food, cart: { restaurantSlug: null, items: [] } } })),
  setGroup: (group) => set((s) => ({ food: { ...s.food, group } })),
  updateGroup: (patch) => set((s) => ({ food: { ...s.food, group: s.food.group ? { ...s.food.group, ...patch } : null } })),
  addOrder: (o) => {
    const order: FoodOrder = { ...o, id: o.id ?? uid("cmd"), createdAt: nowIso(), step: 0 };
    set((s) => ({ food: { ...s.food, orders: [order, ...s.food.orders] } }));
    return order;
  },
  updateOrder: (id, patch) => set((s) => ({ food: { ...s.food, orders: s.food.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) } })),
});
