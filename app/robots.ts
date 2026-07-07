import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/admin/"] }],
    sitemap: "https://skylivery.llc/sitemap.xml",
    host: "https://skylivery.llc",
  };
}
