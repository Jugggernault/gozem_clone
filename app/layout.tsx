import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";
import { Providers } from "@/components/Providers";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gozem — Se déplacer, manger, payer",
  description: "Prototype Gozem Next : trajets, livraison de repas et Gozem Money au Bénin.",
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-center"
          mobileOffset={{ bottom: 88 }}
          icons={{ success: <CircleCheck className="size-5 text-primary" aria-hidden /> }}
          toastOptions={{ classNames: { toast: "!bg-ink !text-on-ink !border-ink !rounded-lg !font-sans", description: "!text-on-ink/80" } }}
        />
      </body>
    </html>
  );
}
