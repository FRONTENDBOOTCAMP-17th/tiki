import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mypage",
        destination: "/mypage/profile",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
