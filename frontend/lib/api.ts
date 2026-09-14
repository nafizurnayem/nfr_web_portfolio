// Thin API client used by both server and client components.

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

async function safeJson<T>(input: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProjects(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Project[]> {
  // String building, not `new URL()`: API_BASE_URL may be a same-origin path
  // (see fallbackBase), which the URL constructor rejects.
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (typeof params?.featured === "boolean")
    search.set("featured", String(params.featured));
  const qs = search.toString();
  return (await safeJson<Project[]>(`${API_BASE_URL}/projects${qs ? `?${qs}` : ""}`)) ?? [];
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return safeJson<Project>(`${API_BASE_URL}/projects/${encodeURIComponent(slug)}`);
}

export async function fetchSkills(): Promise<Skill[]> {
  return (await safeJson<Skill[]>(`${API_BASE_URL}/skills`)) ?? [];
}

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
  } catch (e) {
    return { ok: false, error: "Network error. Please try again." };
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
  } catch (e) {
    return { ok: false, error: "Network error while contacting the demo API." };
  }
}
