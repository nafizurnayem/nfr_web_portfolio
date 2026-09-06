import type { MetadataRoute } from "next";
import { fetchProjects } from "@/lib/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

/**
 * Sitemap built from live API data, so a new project appears the moment it is
 * seeded. If the backend is unreachable `fetchProjects` returns an empty array
 * and the static routes are still emitted — a partial sitemap beats a build
 * failure.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await fetchProjects();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/demos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : now,
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
