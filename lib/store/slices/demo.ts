import type { Slice } from "../types";

export type DemoState = { offline: boolean; simulateError: boolean };
export type DemoSlice = {
  demo: DemoState;
  setDemoFlag: (key: keyof DemoState, value: boolean) => void;
  /** Clears localStorage and restores every slice to its seed. */
  resetDemo: () => void;
  hydrated: boolean; // not persisted
};

export const initialDemo = (): DemoState => ({ offline: false, simulateError: false });

export const createDemoSlice: Slice<DemoSlice> = (set) => ({
  demo: initialDemo(),
  setDemoFlag: (key, value) => set((s) => ({ demo: { ...s.demo, [key]: value } })),
  resetDemo: () => {}, // implemented in lib/store/index.ts (needs every slice's initial state)
  hydrated: false,
});
