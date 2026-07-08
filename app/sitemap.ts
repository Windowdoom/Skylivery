import type { MetadataRoute } from "next";

const BASE = "https://www.skyliverynola.com";

const paths = [
  "",
  "/book",
  "/airport-transfer-msy",
  "/french-quarter-car-service",
  "/metairie-car-service",
  "/garden-district-car-service",
  "/wedding-limo-new-orleans",
  "/corporate-transportation-new-orleans",
  "/mardi-gras-transportation",
  "/jazz-fest-transportation",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/book" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/book" ? 0.9 : 0.8,
  }));
}
