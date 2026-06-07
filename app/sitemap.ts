import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date("2026-06-07"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
