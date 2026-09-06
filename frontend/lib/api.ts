// Thin API client used by both server and client components.

const FALLBACK_BASE = "http://localhost:8000/api";
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || FALLBACK_BASE;

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
  const url = new URL(`${API_BASE_URL}/projects`);
  if (params?.category) url.searchParams.set("category", params.category);
  if (typeof params?.featured === "boolean")
    url.searchParams.set("featured", String(params.featured));
  return (await safeJson<Project[]>(url.toString())) ?? [];
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
