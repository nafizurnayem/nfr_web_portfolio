"use client";

import Link from "next/link";
import type { Project } from "@/lib/api";
import { TiltCard } from "@/components/tilt-card";
import { Reveal } from "@/components/reveal";
import { ProjectPoster } from "@/components/project-poster";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.96 10.96 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.66 18.34.5 12 .5Z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M14 4h6v6" />
      <path d="M20 4l-8 8" />
      <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4l1.11-6.47L2.6 9.35l6.5-.95L12 2.5Z" />
    </svg>
  );
}

/**
 * A project rendered as a model card: poster, identity strip, summary, tags,
 * then an action row. Hover changes colour and border only — never scale or
 * position — so nothing in the grid shifts under the pointer.
 */
export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  const primaryTech = project.tech_stack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Reveal delay={index * 0.04}>
      <TiltCard className="h-full">
        <article className="model-card h-full p-4">
          <div
            className="relative z-10 flex h-full min-w-0 flex-col"
            style={{ transform: "translateZ(28px)" }}
          >
            <ProjectPoster
              slug={project.slug}
              category={project.category}
              title={project.title}
              imageUrl={project.image_url}
            />

            <div className="mt-4 flex min-w-0 items-start justify-between gap-3 px-1">
              <div className="min-w-0 flex-1">
                <p className="layer-label break-words">{project.category}</p>
                <h3
                  className="mt-1.5 line-clamp-2 break-words font-display text-lg text-ink-50"
                  title={project.title}
                >
                  {project.title}
                </h3>
              </div>
              {project.featured && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-amber/30 bg-accent-amber/[0.08] px-2 py-0.5 font-mono text-[11px] text-accent-amber">
                  <StarIcon />
                  featured
                </span>
              )}
            </div>

            <p className="mt-2.5 line-clamp-3 px-1 text-sm leading-relaxed text-ink-200">
              {project.summary}
            </p>

            {primaryTech.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5 px-1">
                {primaryTech.map((tech) => (
                  <span key={tech} className="tensor-chip">
                    {tech}
                  </span>
                ))}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap gap-1.5 px-1">
              {project.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="pill">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions: case-study CTA plus direct source / live links. */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-1 pt-4">
              <Link
                href={`/projects/${project.slug}`}
                data-cursor="hover"
                aria-label={`Open case study for ${project.title}`}
                className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-md border border-accent/40 bg-accent/[0.08] px-3.5 py-2 font-mono text-xs text-accent-soft transition-colors duration-200 hover:border-accent/60 hover:bg-accent/[0.16] hover:text-accent"
              >
                <span>details</span>
                <ArrowRightIcon className="opacity-80" />
              </Link>

              <div className="flex items-center gap-1.5">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="hover"
                    aria-label={`View ${project.title} source on GitHub (opens in a new tab)`}
                    title="View source on GitHub"
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-md border border-line/10 bg-surface/[0.06] px-3 py-2 font-mono text-xs text-ink-100 transition-colors duration-200 hover:border-accent/40 hover:bg-accent/[0.08] hover:text-accent-soft"
                  >
                    <GithubIcon />
                    <span>code</span>
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="hover"
                    aria-label={`Open the live demo of ${project.title} (opens in a new tab)`}
                    title="Open live demo"
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-md border border-accent-green/40 bg-accent-green/[0.10] px-3 py-2 font-mono text-xs text-accent-green transition-colors duration-200 hover:bg-accent-green/[0.20]"
                  >
                    <ExternalIcon />
                    <span>live</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
      </TiltCard>
    </Reveal>
  );
}
