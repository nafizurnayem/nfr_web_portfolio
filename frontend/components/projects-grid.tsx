"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/api";
import { cn } from "@/lib/cn";
import { identity } from "@/lib/identity";

// Categories we know about, in the order we want them rendered. Anything not
// in this list is appended afterwards in alphabetical order.
const CATEGORY_ORDER = [
  "Image Processing & Computer Vision",
  "AI/ML Research",
  "NLP & LLM",
  "IoT & Robotics",
  "Full-Stack Web",
  "Tools & Utilities",
  "Academic / Coursework",
];

function compareCategories(a: string, b: string) {
  const ai = CATEGORY_ORDER.indexOf(a);
  const bi = CATEGORY_ORDER.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

function slugifyCategory(c: string) {
  return c
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.96 10.96 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.66 18.34.5 12 .5Z" />
    </svg>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      const haystack = `${p.title} ${p.summary} ${p.tech_stack} ${p.tags.join(
        " ",
      )}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesTag && matchesQuery;
    });

    const map = new Map<string, Project[]>();
    filtered.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    map.forEach((arr) => {
      arr.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
    });

    return Array.from(map.entries()).sort((a, b) =>
      compareCategories(a[0], b[0]),
    );
  }, [projects, activeTag, query]);

  // Keyboard shortcut: "/" focuses the search box (unless already in an input).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Track which section is currently in view so the quick-nav highlights it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function scrollToSection(slug: string) {
    const el = sectionRefs.current.get(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (projects.length === 0) {
    return (
      <div className="model-card p-5">
        <p className="layer-label">no projects loaded</p>
        <p className="mt-2 text-sm text-ink-200">
          The backend is unreachable or returned an empty list.
        </p>
      </div>
    );
  }

  const totalShown = sections.reduce((n, [, arr]) => n + arr.length, 0);

  return (
    <div>
      {/* Toolbar: counts + GitHub profile + search with "/" shortcut hint. */}
      <div className="model-card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-300">
            {sections.length}{" "}
            {sections.length === 1 ? "section" : "sections"} · {totalShown}{" "}
            {totalShown === 1 ? "project" : "projects"}
          </p>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="hover"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-line/10 bg-surface/[0.06] px-3 py-2 font-mono text-xs text-ink-100 transition-colors duration-200 hover:border-accent/40 hover:text-accent-soft"
          >
            <GithubIcon />
            <span>browse all on GitHub</span>
          </a>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            ref={searchRef}
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep projects/"
            className="input w-full pr-12 font-mono sm:max-w-xs"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line/10 bg-surface/[0.07] px-1.5 py-0.5 font-mono text-[11px] text-ink-300">
            /
          </kbd>
        </div>
      </div>

      {/* Quick-nav: clickable pills that smooth-scroll to each section. */}
      {sections.length > 1 && (
        <div className="model-card sticky z-20 mb-6 flex snap-x gap-1.5 overflow-x-auto p-2.5 backdrop-blur scrollbar-thin sm:flex-wrap sm:overflow-visible"
          style={{ top: "var(--header-height)" }}>
          {sections.map(([cat, arr]) => {
            const slug = slugifyCategory(cat);
            const active = activeSection === slug;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => scrollToSection(slug)}
                className={cn(
                  "shrink-0 snap-start whitespace-nowrap rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors duration-200",
                  active
                    ? "border-accent/50 bg-accent/[0.12] text-accent-soft shadow-glow-cyan"
                    : "border-line/10 bg-surface/[0.04] text-ink-200 hover:border-accent/30 hover:text-ink-50",
                )}
              >
                <span className="text-ink-300"># </span>
                {cat}
                <span className="ml-1.5 rounded bg-surface/[0.07] px-1.5 py-0.5 text-[11px] text-ink-300">
                  {arr.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-300">
            tags:
          </span>
          {tags.slice(0, 28).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-200",
                activeTag === t
                  ? "border-accent/50 bg-accent/[0.1] text-accent-soft"
                  : "border-line/10 text-ink-200 hover:border-accent/30 hover:text-ink-50",
              )}
            >
              #{t}
            </button>
          ))}
          {activeTag && (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="ml-1 rounded-full border border-line/10 px-3 py-1 font-mono text-xs text-ink-300 transition-colors hover:text-ink-50"
            >
              clear
            </button>
          )}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="model-card p-5">
          <p className="layer-label">no matches</p>
          <p className="mt-2 text-sm text-ink-200">
            Try clearing filters or searching for something else. Press{" "}
            <kbd className="rounded border border-line/10 bg-surface/[0.07] px-1.5 font-mono text-[11px]">
              /
            </kbd>{" "}
            to jump to search.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map(([cat, arr]) => {
            const slug = slugifyCategory(cat);
            return (
              <section
                key={cat}
                id={slug}
                ref={(el) => {
                  if (el) sectionRefs.current.set(slug, el);
                  else sectionRefs.current.delete(slug);
                }}
                aria-label={cat}
                className="scroll-mt-32"
              >
                <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-line/[0.07] pb-2">
                  <h2 className="font-mono text-sm sm:text-base">
                    <span className="text-ink-300">$ ls </span>
                    <span className="text-accent-soft">{slug}/</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-300">
                      {arr.length} {arr.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                </header>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {arr.map((p, i) => (
                    <ProjectCard project={p} key={p.id} index={i} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
