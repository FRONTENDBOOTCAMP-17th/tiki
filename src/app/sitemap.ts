import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tiki-final.vercel.app/";

  const routes = [
    "",
    "/support",
    "/terms",
    "/privacy",
    "/category",
    "/ranking",
    "/search",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}