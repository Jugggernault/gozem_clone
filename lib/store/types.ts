import type { StateCreator } from "zustand";
import type { ProfileSlice } from "./slices/profile";
import type { WalletSlice } from "./slices/wallet";
import type { PointsSlice } from "./slices/points";
import type { NotificationsSlice } from "./slices/notifications";
import type { ActivitySlice } from "./slices/activity";
import type { RideSlice } from "./slices/ride";
import type { FoodSlice } from "./slices/food";
import type { ErrandsSlice } from "./slices/errands";
import type { DemoSlice } from "./slices/demo";

export type AppState = ProfileSlice & WalletSlice & PointsSlice & NotificationsSlice & ActivitySlice & RideSlice & FoodSlice & ErrandsSlice & DemoSlice;
export type Slice<T> = StateCreator<AppState, [], [], T>;

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const nowIso = () => new Date().toISOString();
