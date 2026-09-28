import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppState } from "./types";
import { createProfileSlice, initialProfile } from "./slices/profile";
import { createWalletSlice, initialWallet } from "./slices/wallet";
import { createPointsSlice, initialPoints } from "./slices/points";
import { createNotificationsSlice, initialNotifications } from "./slices/notifications";
import { createActivitySlice, initialActivity } from "./slices/activity";
import { createRideSlice, initialRide } from "./slices/ride";
import { createFoodSlice, initialFood } from "./slices/food";
import { createErrandsSlice, initialErrands } from "./slices/errands";
import { createDemoSlice, initialDemo } from "./slices/demo";

const noopStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const STORAGE_KEY = "gozem-demo";

// Data keys (one per slice). Persist merges each one level deep so fields added later get their seed defaults.
const initialData = () => ({
  profile: initialProfile(),
  wallet: initialWallet(),
  points: initialPoints(),
  notifications: initialNotifications(),
  activity: initialActivity(),
  ride: initialRide(),
  food: initialFood(),
  errands: initialErrands(),
  demo: initialDemo(),
});
type DataKey = keyof ReturnType<typeof initialData>;
const DATA_KEYS = Object.keys(initialData()) as DataKey[];

export const useApp = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set, get, api),
      ...createWalletSlice(set, get, api),
      ...createPointsSlice(set, get, api),
      ...createNotificationsSlice(set, get, api),
      ...createActivitySlice(set, get, api),
      ...createRideSlice(set, get, api),
      ...createFoodSlice(set, get, api),
      ...createErrandsSlice(set, get, api),
      ...createDemoSlice(set, get, api),
      resetDemo: () => {
        try {
          localStorage.clear();
        } catch {}
        set(initialData());
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : localStorage)),
      skipHydration: true, // <Providers> rehydrates on mount, then flips `hydrated`
      partialize: (s) => Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as Partial<AppState>,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const out = { ...current } as Record<string, unknown>;
        for (const k of DATA_KEYS) if (p[k]) out[k] = { ...current[k], ...p[k] };
        return out as unknown as AppState;
      },
      onRehydrateStorage: () => () => useApp.setState({ hydrated: true }),
    },
  ),
);

export type { AppState } from "./types";
export * from "./actions";
export { selectUnreadCount } from "./slices/notifications";
export { selectRideQuote, selectRidePayment, selectRideDriver } from "./slices/ride";
export type { RidePhase, RideState } from "./slices/ride";
export { selectCartSubtotal, selectCartCount, selectCartTotals, linesSubtotal } from "./slices/food";
export type { CartLine, FoodOrder, GroupOrder, GroupMember } from "./slices/food";
export { selectShoppingSubtotal } from "./slices/errands";
export type { Delivery, ErrandOrder } from "./slices/errands";
export { INSUFFICIENT_FUNDS } from "./slices/wallet";
export type { DebitResult } from "./slices/wallet";
