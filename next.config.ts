import type { NextConfig } from "next";

// 예시 이미지 사이트 picsum,unsplash 허용
const nextConfig: NextConfig = {
  // sharp는 네이티브 모듈이라 서버 번들에서 제외하고 Node require로 로드
  serverExternalPackages: ["sharp"],
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
