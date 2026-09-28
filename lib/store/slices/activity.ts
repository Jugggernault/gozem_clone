import type { ActivityEntry } from "@/lib/types";
import { seedActivity } from "@/lib/mock/activity";
import { type Slice, nowIso, uid } from "../types";

export type ActivityState = { entries: ActivityEntry[] };
export type ActivityInput = Omit<ActivityEntry, "id" | "date" | "status"> & Partial<Pick<ActivityEntry, "id" | "date" | "status">>;
export type ActivitySlice = {
  activity: ActivityState;
  /** status defaults to "completed", date to now. Scheduled rides use status "scheduled" + planned date ("À venir"). */
  addActivity: (e: ActivityInput) => ActivityEntry;
  updateActivity: (id: string, patch: Partial<ActivityEntry>) => void;
  removeActivity: (id: string) => void;
};

export const initialActivity = (): ActivityState => ({ entries: seedActivity() });

export const createActivitySlice: Slice<ActivitySlice> = (set) => ({
  activity: initialActivity(),
  addActivity: (e) => {
    const entry: ActivityEntry = { status: "completed", date: nowIso(), ...e, id: e.id ?? uid("act") };
    set((s) => ({ activity: { entries: [entry, ...s.activity.entries] } }));
    return entry;
  },
  updateActivity: (id, patch) => set((s) => ({ activity: { entries: s.activity.entries.map((a) => (a.id === id ? { ...a, ...patch } : a)) } })),
  removeActivity: (id) => set((s) => ({ activity: { entries: s.activity.entries.filter((a) => a.id !== id) } })),
});
