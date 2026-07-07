import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://tiki-final.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mypage", "/seller", "/api", "/payment", "/example"],
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
