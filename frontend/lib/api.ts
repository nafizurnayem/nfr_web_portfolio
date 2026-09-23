// Thin API client used by both server and client components.
//
// Portfolio data (projects, skills) is served from static TypeScript files so
// the site works without the FastAPI backend.  The backend is still used for
// the contact form and demo endpoints when it is reachable.

import { STATIC_PROJECTS } from "./data/projects";
import { STATIC_SKILLS } from "./data/skills";

/**
 * Base URL for the FastAPI backend.
 *
 * `NEXT_PUBLIC_API_BASE_URL` always wins when set. Without it:
 * - dev keeps talking to the local uvicorn server on :8000;
 * - a Vercel deployment falls back to its own origin — `/api/*` is routed to
 *   the backend service by `vercel.json`, so the site keeps working instead of
 *   silently pointing at a localhost that does not exist on the server.
 *
 * The value must stay absolute (`new URL()` below and server-side `fetch`
 * both reject relative URLs), hence the explicit origin reconstruction.
 */
function fallbackBase(): string {
  if (process.env.NODE_ENV !== "production") return "http://localhost:8000/api";
  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${vercelHost}/api`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) return `${siteUrl.replace(/\/+$/, "")}/api`;
  // Truly unknown origin: a same-origin path. Server-side fetch will not
  // resolve it, but client-side calls still hit the right place.
  return "/api";
}

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || fallbackBase();

export type Project = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  tech_stack: string;
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  image_credit: string | null;
  status: string;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  sort_order: number;
};

// ---------------------------------------------------------------------------
// Read-only data — served from static files, no backend needed
// ---------------------------------------------------------------------------

export async function fetchProjects(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Project[]> {
  let result = STATIC_PROJECTS.filter((p) => p.status === "published");
  if (params?.category) {
    result = result.filter((p) => p.category === params.category);
  }
  if (typeof params?.featured === "boolean") {
    result = result.filter((p) => p.featured === params.featured);
  }
  // Match backend ordering: featured first, then newest first
  result.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return result;
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return (
    STATIC_PROJECTS.find(
      (p) => p.slug === slug && p.status === "published"
    ) ?? null
  );
}

export async function fetchSkills(): Promise<Skill[]> {
  return [...STATIC_SKILLS].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name);
  });
}

// ---------------------------------------------------------------------------
// Write endpoints — still hit the backend (graceful fallback if unreachable)
// ---------------------------------------------------------------------------

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

export async function submitContact(
  payload: ContactPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        ok: false,
        error: data?.error?.message || `Request failed (${res.status}).`,
      };
    }
    return { ok: true };
  } catch {
    // Backend unreachable — fall back to mailto
    const subject = encodeURIComponent(payload.subject);
    const body = encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`
    );
    if (typeof window !== "undefined") {
      window.open(
        `mailto:nfrnayem123@gmail.com?subject=${subject}&body=${body}`,
        "_blank"
      );
    }
    return {
      ok: false,
      error:
        "The contact server is offline. Your email client has been opened as a fallback.",
    };
  }
}

export type DemoPrediction = {
  label: string;
  confidence: number;
  top_k: { label: string; confidence: number }[];
  model: string;
  notes?: string;
};

export async function submitPlantDiseaseDemo(
  file: File
): Promise<{ ok: boolean; data?: DemoPrediction; error?: string }> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE_URL}/demos/plant-disease`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        ok: false,
        error: data?.error?.message || `Request failed (${res.status}).`,
      };
    }
    const data = (await res.json()) as DemoPrediction;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error while contacting the demo API." };
  }
}
