import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 보안으로 인해 막힌 외부 이미지를 허용
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
