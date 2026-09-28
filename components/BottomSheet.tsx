"use client";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";

const noop = () => () => {};
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 400, damping: 36 } as const;

type Props = {
  children: ReactNode;
  title?: ReactNode;
  footer?: ReactNode; // sticky CTA zone at the bottom of the sheet
  className?: string;
  /** Modal mode (overlay, Esc / backdrop / drag-down to dismiss) when onClose is given. */
  open?: boolean;
  onClose?: () => void;
};

/**
 * Two modes:
 * - Persistent (no onClose): the sheet over a map. Must live inside <MapScreen> (a positioned parent).
 *   Mobile: bottom sheet, xl top radius. ≥1024px: floating 420px panel docked left over the map.
 * - Modal (onClose): portal overlay. Mobile: bottom sheet. ≥1024px: centred 480px dialog.
 */
export function BottomSheet({ children, title, footer, className, open = true, onClose }: Props) {
  if (!onClose) {
    return (
      <motion.section
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex max-h-[78dvh] flex-col rounded-t-xl bg-surface shadow-sheet sm:mx-auto sm:max-w-120",
          "lg:inset-x-auto lg:bottom-auto lg:left-md lg:top-md lg:mx-0 lg:max-h-[calc(100%-2rem)] lg:w-105 lg:rounded-lg",
          className,
        )}
      >
        <div className="mx-auto mt-sm h-1 w-9 shrink-0 rounded-full bg-border lg:hidden" aria-hidden />
        <div className="overflow-y-auto p-sheet-padding pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {title && <h2 className="mb-md text-h2 text-ink">{title}</h2>}
          {children}
        </div>
        {footer && <div className="border-t border-border p-sheet-padding pt-md">{footer}</div>}
      </motion.section>
    );
  }
  return <ModalSheet {...{ children, title, footer, className, open, onClose }} />;
}

function ModalSheet({ children, title, footer, className, open, onClose }: Props & { onClose: () => void }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const drag = useDragControls();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true">
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 100 || info.velocity.y > 600) && onClose()}
            className={cn(
              "relative flex max-h-[90dvh] w-full flex-col rounded-t-xl bg-surface shadow-sheet sm:max-w-120 lg:rounded-xl",
              className,
            )}
          >
            <div className="flex shrink-0 cursor-grab touch-none justify-center pt-sm pb-xs" onPointerDown={(e) => drag.start(e)}>
              <div className="h-1 w-9 rounded-full bg-border" aria-hidden />
            </div>
            <div className="flex items-start justify-between gap-md px-sheet-padding">
              {title ? <h2 className="text-h2 text-ink">{title}</h2> : <span />}
              <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-sm grid size-touch-target shrink-0 place-items-center rounded-full text-muted hover:bg-surface-sunken">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-sheet-padding pb-sheet-padding pt-sm">{children}</div>
            {footer && <div className="border-t border-border p-sheet-padding pt-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
