import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6e9k2jjrse.ufs.sh",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
