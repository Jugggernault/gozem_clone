import { Compass, House, ReceiptText, UserRound, WalletMinimal } from "lucide-react";

export const TABS = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/explore", label: "Explorer", icon: Compass },
  { href: "/activity", label: "Activité", icon: ReceiptText },
  { href: "/wallet", label: "Wallet", icon: WalletMinimal },
  { href: "/account", label: "Compte", icon: UserRound },
] as const;

export const isTabActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
/** Mobile bottom nav shows only on the 5 tab roots; flows get full screen + a back button. */
export const showsBottomNav = (pathname: string) => TABS.some((t) => t.href === pathname);
