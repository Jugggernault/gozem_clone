import { getProduct } from "@/lib/mock/products";
import { type AppState, type Slice, nowIso, uid } from "../types";

export type Delivery = {
  id: string; // "GZ-2841"
  pickup: string; recipientName: string; recipientPhone: string; address: string;
  vehicle: "moto" | "voiture"; description: string; price: number;
  step: number; // index in PARCEL_STEPS
  createdAt: string;
};
export type ErrandOrder = { id: string; kind: "gas" | "shopping"; title: string; lines: { label: string; qty: number; price: number }[]; total: number; step: number; createdAt: string };
export type ErrandsState = { deliveries: Delivery[]; shoppingCart: { productId: string; qty: number }[]; orders: ErrandOrder[] };

export type ErrandsSlice = {
  errands: ErrandsState;
  addDelivery: (d: Omit<Delivery, "createdAt" | "step">) => Delivery;
  updateDelivery: (id: string, patch: Partial<Delivery>) => void;
  setShoppingQty: (productId: string, qty: number) => void;
  clearShoppingCart: () => void;
  addErrandOrder: (o: Omit<ErrandOrder, "id" | "createdAt" | "step">) => ErrandOrder;
  updateErrandOrder: (id: string, patch: Partial<ErrandOrder>) => void;
};

export const initialErrands = (): ErrandsState => ({ deliveries: [], shoppingCart: [], orders: [] });
export const selectShoppingSubtotal = (s: AppState) => s.errands.shoppingCart.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);

export const createErrandsSlice: Slice<ErrandsSlice> = (set) => ({
  errands: initialErrands(),
  addDelivery: (d) => {
    const delivery = { ...d, createdAt: nowIso(), step: 0 };
    set((s) => ({ errands: { ...s.errands, deliveries: [delivery, ...s.errands.deliveries] } }));
    return delivery;
  },
  updateDelivery: (id, patch) => set((s) => ({ errands: { ...s.errands, deliveries: s.errands.deliveries.map((d) => (d.id === id ? { ...d, ...patch } : d)) } })),
  setShoppingQty: (productId, qty) =>
    set((s) => {
      const rest = s.errands.shoppingCart.filter((l) => l.productId !== productId);
      return { errands: { ...s.errands, shoppingCart: qty > 0 ? [...rest, { productId, qty }] : rest } };
    }),
  clearShoppingCart: () => set((s) => ({ errands: { ...s.errands, shoppingCart: [] } })),
  addErrandOrder: (o) => {
    const order = { ...o, id: uid(o.kind), createdAt: nowIso(), step: 0 };
    set((s) => ({ errands: { ...s.errands, orders: [order, ...s.errands.orders] } }));
    return order;
  },
  updateErrandOrder: (id, patch) => set((s) => ({ errands: { ...s.errands, orders: s.errands.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) } })),
});
