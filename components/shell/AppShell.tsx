"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { showsBottomNav } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = showsBottomNav(pathname);
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className={cn("flex min-h-dvh flex-col lg:pl-60 lg:pt-16", nav && "pb-20 lg:pb-0")}>{children}</main>
      {nav && <BottomNav />}
    </>
  );
}
