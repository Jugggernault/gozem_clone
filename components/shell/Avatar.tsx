"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Avatar({ className, link = true }: { className?: string; link?: boolean }) {
  const initials = useApp((s) => s.profile.user.avatar);
  const el = <span className={cn("grid size-10 place-items-center rounded-full bg-primary-dark text-label-md text-on-primary", className)}>{initials}</span>;
  return link ? <Link href="/account" aria-label="Mon compte">{el}</Link> : el;
}
