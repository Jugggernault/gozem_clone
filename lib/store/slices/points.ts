import type { PointsEntry } from "@/lib/types";
import { SEED_POINTS } from "@/lib/mock/user";
import { seedPointsHistory } from "@/lib/mock/activity";
import { type Slice, nowIso, uid } from "../types";

export type PointsState = { total: number; history: PointsEntry[] };
export type PointsSlice = {
  points: PointsState;
  addPoints: (n: number, label: string) => void;
  /** Returns { ok:false, error } when not enough points. Records a negative history entry. */
  redeemPoints: (n: number, label: string) => { ok: true } | { ok: false; error: string };
};

export const initialPoints = (): PointsState => ({ total: SEED_POINTS, history: seedPointsHistory() });

export const createPointsSlice: Slice<PointsSlice> = (set, get) => {
  const add = (n: number, label: string) =>
    set((s) => ({ points: { total: s.points.total + n, history: [{ id: uid("pts"), label, points: n, date: nowIso() }, ...s.points.history] } }));
  return {
    points: initialPoints(),
    addPoints: add,
    redeemPoints: (n, label) => {
      if (get().points.total < n) return { ok: false, error: "Points insuffisants" };
      add(-n, label);
      return { ok: true };
    },
  };
};
