import type { Metadata } from "next";
import { fetchProjects } from "@/lib/api";
import { ProjectsGrid } from "@/components/projects-grid";
import { identity } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Computer vision, NLP, robotics and full-stack projects — every one linked to real source on GitHub.",
};

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const liveCount = projects.filter((p) => p.live_url).length;
  const categoryCount = new Set(projects.map((p) => p.category)).size;

  return (
    <div className="pt-6">
      <header className="mb-8 flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> project index
          </p>
          <h1 className="mt-2 break-words font-display text-[clamp(1.6rem,6vw,2.25rem)] text-ink-50">
            <span className="text-neural">{projects.length} projects</span>, all
            with real source
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">
            Grouped into {categoryCount} domains, from custom CNNs to embedded
            firmware. Every card links straight to its{" "}
            <span className="font-mono text-accent-soft">code</span> on GitHub,
            and {liveCount} have a{" "}
            <span className="font-mono text-accent-green">live</span> deployment
            you can open right now. Press{" "}
            <kbd className="rounded border border-line/10 bg-surface/[0.07] px-1.5 font-mono text-[11px]">
              /
            </kbd>{" "}
            to jump to search.
          </p>
        </div>
        <a
          href={identity.github}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-ghost w-full shrink-0 cursor-pointer sm:w-auto"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.96 10.96 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.66 18.34.5 12 .5Z" />
          </svg>
          <span>nafizurnayem on GitHub</span>
        </a>
      </header>
      <ProjectsGrid projects={projects} />
    </div>
  );
}
