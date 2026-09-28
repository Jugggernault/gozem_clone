import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gozem Next",
    short_name: "Gozem",
    description: "Trajets, repas, colis et Gozem Money au Bénin.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8F6",
    theme_color: "#00A86B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
