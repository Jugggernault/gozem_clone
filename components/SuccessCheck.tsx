"use client";
import { motion } from "motion/react";

/** Animated check that draws its stroke inside a primary circle (~450 ms). */
export function SuccessCheck({ size = 88, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-md">
      <motion.svg width={size} height={size} viewBox="0 0 88 88" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} aria-hidden>
        <circle cx="44" cy="44" r="44" className="fill-primary" />
        <motion.path d="M26 45 L39 58 L63 32" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="stroke-on-primary" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }} />
      </motion.svg>
      {label && <p className="text-h2 text-ink text-center">{label}</p>}
    </div>
  );
}
