"use client";
import { motion } from "motion/react";

/** Quick fade between pages (DESIGN.md: 150–300 ms UI motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="flex flex-1 flex-col" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
