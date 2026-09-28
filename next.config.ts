import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // the dev badge sits over bottom-left buttons and blocks Playwright clicks
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
};

export default nextConfig;
