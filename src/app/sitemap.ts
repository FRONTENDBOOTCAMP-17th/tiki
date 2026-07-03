import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tiki-final.vercel.app";

  const routes = [
    "/",
    "/info/about",
    "/info/faq",
    "/info/contact",
    "/info/seller-guide",
    "/info/seller-registration",
    "/info/settlement",
    "/info/terms",
    "/info/privacy",
    "/category",
    "/ranking",
    "/search",
  ];

  return routes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "/" ? 1 : 0.7,
  }));
}
