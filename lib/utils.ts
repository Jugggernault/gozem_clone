import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// DESIGN.md type scale: without this, twMerge treats `text-h1` and `text-muted` as conflicting.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["hero", "h1", "h2", "h3", "body-lg", "body-md", "label-md", "caption", "price", "price-hero"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
