import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProject } from "@/lib/api";
import { ProjectPoster } from "@/components/project-poster";
import { Description } from "@/components/description";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await fetchProject(slug);
  if (!project) notFound();

  const techList = project.tech_stack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <article className="pt-6">
      <Link href="/projects" className="tap-link font-mono text-xs text-ink-300 transition-colors hover:text-accent-soft">
        ← cd ../projects
      </Link>
      <header className="mt-3 flex flex-col gap-3">
        <p className="layer-label">{project.category}</p>
        <h1 className="font-display text-3xl text-ink-50 sm:text-4xl">{project.title}</h1>
        <p className="max-w-3xl text-base text-ink-200">{project.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="pill">#{t}</span>
          ))}
          {project.featured && <span className="pill-accent">★ featured</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-primary"
              aria-label={`View ${project.title} source on GitHub`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.96 10.96 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.66 18.34.5 12 .5Z" />
              </svg>
              <span>view source</span>
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14 4h6v6" /><path d="M20 4l-8 8" /><path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              </svg>
              <span>open live demo</span>
            </a>
          )}
        </div>
      </header>

      {/* A real figure is capped: at full shell width the 1400x764 chart is
          ~800px tall and swallows the whole viewport before any prose. */}
      <div className={project.image_url ? "mt-6 max-w-4xl" : "mt-6"}>
        <ProjectPoster
          slug={project.slug}
          category={project.category}
          title={project.title}
          imageUrl={project.image_url}
          priority
          className={
            project.image_url
              ? "!aspect-[1400/764]"
              : "aspect-[300/100] sm:aspect-[300/110]"
          }
        />
        {project.image_credit && (
          <p className="mt-2 text-right font-mono text-[11px] text-ink-300">
            {project.image_credit}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,320px] lg:items-start">
        <div className="model-card p-6">
          <p className="layer-label">$ cat README.md</p>
          <div className="mt-4">
            <Description source={project.description} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="model-card p-5">
            <p className="layer-label">stack</p>
            <ul className="mt-3 space-y-1.5">
              {techList.map((t) => (
                <li key={t} className="flex items-center gap-2 font-mono text-sm text-ink-100">
                  <span className="text-accent">›</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="model-card p-5">
            <p className="layer-label">links</p>
            <ul className="mt-3 space-y-2 font-mono text-sm">
              {project.github_url && (
                <li>
                  <a className="text-ink-100 hover:text-accent-soft" href={project.github_url} target="_blank" rel="noreferrer noopener">
                    → github
                  </a>
                </li>
              )}
              {project.live_url && (
                <li>
                  <a className="text-ink-100 hover:text-accent-soft" href={project.live_url} target="_blank" rel="noreferrer noopener">
                    → live demo
                  </a>
                </li>
              )}
              {!project.github_url && !project.live_url && (
                <li className="text-ink-300">No external links yet.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
