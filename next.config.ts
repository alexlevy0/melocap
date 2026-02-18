import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify album art CDN
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co", // Spotify mosaic images
      },
    ],
  },
};

export default withNextIntl(nextConfig);
