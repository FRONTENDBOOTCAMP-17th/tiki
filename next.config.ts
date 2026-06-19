import type { NextConfig } from "next";

// 예시 이미지 사이트 picsum,unsplash 허용
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mypage",
        destination: "/mypage/profile",
        permanent: false,
      },
    ];
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
