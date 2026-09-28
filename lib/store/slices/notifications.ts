import type { AppNotification } from "@/lib/types";
import { seedNotifications } from "@/lib/mock/notifications";
import { type AppState, type Slice, nowIso, uid } from "../types";

export type NotificationsState = { items: AppNotification[] };
export type NotificationsSlice = {
  notifications: NotificationsState;
  addNotification: (n: Pick<AppNotification, "kind" | "title" | "body"> & { href?: string }) => AppNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const initialNotifications = (): NotificationsState => ({ items: seedNotifications() });
export const selectUnreadCount = (s: AppState) => s.notifications.items.filter((n) => !n.read).length;

export const createNotificationsSlice: Slice<NotificationsSlice> = (set) => ({
  notifications: initialNotifications(),
  addNotification: (n) => {
    const item: AppNotification = { ...n, id: uid("notif"), date: nowIso(), read: false };
    set((s) => ({ notifications: { items: [item, ...s.notifications.items] } }));
    return item;
  },
  markRead: (id) => set((s) => ({ notifications: { items: s.notifications.items.map((n) => (n.id === id ? { ...n, read: true } : n)) } })),
  markAllRead: () => set((s) => ({ notifications: { items: s.notifications.items.map((n) => ({ ...n, read: true })) } })),
});
