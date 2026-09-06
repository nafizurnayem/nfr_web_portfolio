import Link from "next/link";
import { PortraitHero } from "@/components/portrait-hero";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { NeuralNetworkCanvas } from "@/components/neural-network-canvas";
import { Reveal, StaggeredWords } from "@/components/reveal";
import { RotatingHeadline } from "@/components/rotating-headline";
import { TiltCard } from "@/components/tilt-card";
import { SkillMatrix } from "@/components/skill-matrix";
import { CapabilityShowcase } from "@/components/capability-showcase";
import { fetchProjects, fetchSkills } from "@/lib/api";
import { identity } from "@/lib/identity";

// Order the skill panels so the primary specialism leads, rather than letting
// dictionary insertion order decide what a visitor reads first.
const CATEGORY_PRIORITY = [
  "Image Processing & CV",
  "AI/ML & Data Science",
  "NLP & LLM",
  "Backend & Data",
  "Frontend",
  "Languages",
  "Robotics & Hardware",
  "Development Tools",
];

export default async function HomePage() {
  const [featured, allProjects, skills] = await Promise.all([
    fetchProjects({ featured: true }),
    fetchProjects(),
    fetchSkills(),
  ]);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  const orderedCategories = Object.keys(skillsByCategory).sort((a, b) => {
    const ai = CATEGORY_PRIORITY.indexOf(a);
    const bi = CATEGORY_PRIORITY.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const liveCount = allProjects.filter((p) => p.live_url).length;
  const categoryCount = new Set(allProjects.map((p) => p.category)).size;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          `isolate` keeps the stacked backdrop layers in a local stacking
          context so they cannot collide with the body-level overlays set in
          app/layout.tsx. */}
      <section className="relative isolate -mx-5 overflow-hidden sm:-mx-6 lg:-mx-8">
        {/* Layer 0: the live neural network. Decorative, aria-hidden inside. */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <NeuralNetworkCanvas className="opacity-[0.85]" />
        </div>

        {/* Layer 1: readability mask over the left column where copy sits. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          // Ground-coloured, so it keeps the headline legible over the canvas
          // in both themes instead of smearing dark grey across a light page.
          style={{ background: "var(--hero-mask)" }}
        />

        <div className="relative z-10 grid gap-8 px-5 pb-4 pt-8 sm:gap-10 sm:px-6 sm:pt-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:gap-12 lg:px-8 xl:grid-cols-[1.25fr,0.75fr] 2xl:grid-cols-[1.35fr,0.65fr]">
          <div className="min-w-0">
            <Reveal>
              <p className="availability-banner max-w-full text-[11px] sm:text-xs">
                <span
                  className="status-dot bg-accent-green"
                  style={{ boxShadow: "0 0 8px rgba(74,222,128,0.9)" }}
                />
                Available for internships, research collaborations &amp; freelance
              </p>
            </Reveal>

            <h1 className="mt-5 break-words font-display text-[clamp(1.9rem,7.5vw,3.65rem)] font-bold leading-[1.06] tracking-tight">
              {/* The name lands first, briskly. */}
              <StaggeredWords
                text={identity.name}
                className="text-ink-50"
                stagger={0.13}
                duration={0.9}
              />
              {/* The value proposition cycles through one phrase per discipline
                  so a visitor from any of them sees themselves addressed. */}
              <RotatingHeadline className="mt-1" />
            </h1>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-200">
                {identity.tagline}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/projects" data-cursor="hover" className="btn-primary w-full cursor-pointer sm:w-auto">
                  View {allProjects.length} projects
                  <ArrowIcon />
                </Link>
                <Link href="/contact" data-cursor="hover" className="btn-ghost w-full cursor-pointer sm:w-auto">
                  Hire me
                </Link>
                <a
                  href={identity.resumeUrl}
                  download
                  data-cursor="hover"
                  className="btn-ghost w-full cursor-pointer sm:w-auto"
                >
                  <DownloadIcon />
                  Résumé
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <dl className="mt-8 grid max-w-lg grid-cols-2 gap-2.5 sm:mt-9 sm:grid-cols-4 sm:gap-3">
                <Metric label="projects" value={String(allProjects.length)} />
                <Metric label="live demos" value={String(liveCount)} />
                <Metric label="domains" value={String(categoryCount)} />
                <Metric label="skills" value={String(skills.length)} />
              </dl>
            </Reveal>
          </div>

          <div className="min-w-0">
            <PortraitHero />
          </div>
        </div>
      </section>

      {/* ── What I can build for you ───────────────────────────────────── */}
      <Section
        eyebrow="capabilities"
        title="What I can build for you"
        description="Three disciplines I take end to end. Pick one and the terminal runs that workflow — the same steps I would run on your project."
      >
        <CapabilityShowcase />
      </Section>

      {/* ── About ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow="about"
        title="Who, in plain text"
        description="No buzzwords — just what I work on and how I work."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <TiltCard intensity={4}>
              <div className="model-card h-full p-5">
                <p className="layer-label">
                  <span className="text-accent">::</span> background
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-100">
                  I&rsquo;m a Computer Science student at AIUB. My deepest body of
                  work is in{" "}
                  <span className="text-accent-soft">image processing and computer vision</span>{" "}
                  — training CNNs from scratch, building OpenCV pipelines, and
                  taking vision models all the way to a running service.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-200">
                  Around that I build NLP and LLM applications, robotics on
                  ESP32 and Raspberry Pi, and the FastAPI + Next.js glue that
                  turns a research notebook into something a person can use.
                </p>
                <p className="mt-4 flex flex-wrap gap-1.5">
                  <span className="tensor-chip">Dhaka, Bangladesh</span>
                  <span className="tensor-chip">AIUB · CSE</span>
                  <span className="tensor-chip">open to relocation</span>
                </p>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.08}>
            <TiltCard intensity={4}>
              <div className="model-card h-full p-5">
                <p className="layer-label">
                  <span className="text-accent">::</span> how I work
                </p>
                <ul className="mt-3 space-y-2.5 text-sm text-ink-100">
                  {[
                    "Ship small, ship often — a working slice beats a perfect plan",
                    "Measure before optimising; report the metric that can embarrass you",
                    "Security is a feature, not a final checklist item",
                    "Readable code outlives clever code",
                    "The interface is part of the contract",
                  ].map((principle) => (
                    <li key={principle} className="flex gap-2.5">
                      <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </Section>

      {/* ── Featured work ──────────────────────────────────────────────── */}
      <Section
        eyebrow="featured work"
        title="Things I have actually built"
        description="Every project links to real source on GitHub. Nothing here is a mockup."
      >
        {featured.length === 0 ? (
          <BackendOffline />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {featured.map((project, i) => (
              <ProjectCard project={project} key={project.id} index={i} />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link
            href="/projects"
            data-cursor="hover"
            className="tap-link link-underline cursor-pointer font-mono text-sm text-accent-soft transition-colors hover:text-accent"
          >
            See all {allProjects.length} projects →
          </Link>
        </div>
      </Section>

      {/* ── Stack ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow="stack"
        title="Tools I reach for"
        description="Grouped by where they sit in the pipeline, strongest first. Highlighted names are the ones I reach for daily."
      >
        {skills.length === 0 ? (
          <BackendOffline />
        ) : (
          <SkillMatrix
            skillsByCategory={skillsByCategory}
            orderedCategories={orderedCategories}
          />
        )}
      </Section>

      {/* ── Contact CTA ────────────────────────────────────────────────── */}
      <Section
        eyebrow="next step"
        title="Let's build something"
        description="Open to internships, research collaborations, and freelance work."
      >
        <Reveal>
          <div className="model-card dot-grid overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-xl text-ink-50">
                  Tell me what you&rsquo;re building.
                </p>
                <a
                  href={`mailto:${identity.email}`}
                  data-cursor="hover"
                  className="tap-link link-underline mt-2 cursor-pointer font-mono text-sm text-accent-soft transition-colors hover:text-accent"
                >
                  {identity.email}
                </a>
                <p className="mt-1.5 text-xs text-ink-300">
                  I usually reply within a day.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
                <Link href="/contact" data-cursor="hover" className="btn-primary w-full cursor-pointer sm:w-auto">
                  Start a conversation
                </Link>
                <Link href="/resume" data-cursor="hover" className="btn-ghost w-full cursor-pointer sm:w-auto">
                  Read résumé
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <dt className="metric-label">{label}</dt>
      <dd className="metric-value">{value}</dd>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function BackendOffline() {
  return (
    <div className="model-card p-5">
      <p className="layer-label text-accent-amber">
        <span aria-hidden>!</span> backend offline
      </p>
      <p className="mt-2 text-sm text-ink-200">
        The FastAPI backend is not reachable. Start it with{" "}
        <code className="rounded bg-surface/[0.10] px-1.5 py-0.5 font-mono text-xs text-accent-soft">
          uvicorn app.main:app
        </code>{" "}
        and reload this page.
      </p>
    </div>
  );
}
