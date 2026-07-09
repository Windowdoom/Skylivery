import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/", "/book/paid", "/corporate/book", "/claim/", "/complete/"],
      },
    ],
    sitemap: "https://www.skyliverynola.com/sitemap.xml",
    host: "https://www.skyliverynola.com",
  };
}
