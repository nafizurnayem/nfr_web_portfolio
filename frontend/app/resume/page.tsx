import type { Metadata } from "next";
import Link from "next/link";
import { identity, socialLinks } from "@/lib/identity";
import { fetchProjects, fetchSkills } from "@/lib/api";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume and CV for ${identity.name} — ${identity.title}.`,
};

/**
 * Every bullet below is backed by a project that exists in the portfolio and
 * links to real source. `evidence` names the project slugs that demonstrate the
 * claim, which the page renders as links — so a reviewer can verify anything
 * here in one click instead of taking it on trust.
 */
const experience = [
  {
    role: "Computer Vision & Image Processing",
    org: "Independent · Academic research",
    period: "2023 — present",
    bullets: [
      "Designed and trained a custom CNN from scratch for potato-leaf disease classification, including the augmentation pipeline and per-class error analysis.",
      "Built OpenCV preprocessing pipelines — page detection, perspective correction, shadow removal, adaptive thresholding — that materially improved downstream recognition accuracy.",
      "Combined classical image processing with an LLM reading step so context repairs what raw character recognition gets wrong.",
      "Shipped vision models behind FastAPI inference endpoints with validated uploads and magic-byte file verification.",
    ],
    evidence: ["potato-disease-classification-cnn", "smart-lamp-document-scanner"],
  },
  {
    role: "Machine Learning & Data Engineering",
    org: "Independent · Hackathon teams",
    period: "2024 — present",
    bullets: [
      "Built an explainable rules engine that produces a per-record decision trace, covered by 17 tests written directly from the specification's edge cases.",
      "Benchmarked model and rule behaviour against official test datasets rather than relying on spot checks.",
      "Delivered analytics dashboards in Streamlit alongside production APIs, so stakeholders and engineers read the same numbers.",
    ],
    evidence: ["school-result-gpa-engine", "model-testing-lab"],
  },
  {
    role: "Full-Stack Engineering",
    org: "Independent · Team projects",
    period: "2023 — present",
    bullets: [
      "Built end-to-end products with typed contracts shared between a Node/Express or FastAPI backend and a React or Next.js frontend.",
      "Implemented schema validation, rate limiting, security headers, and sanitisation as part of the initial build rather than a later hardening pass.",
      "Designed relational schemas and role-based access control where permissions are enforced at the data layer, not just hidden in the UI.",
    ],
    evidence: ["pharmashelf-expiry-audit", "evershop-ecommerce", "restaurant-management-system"],
  },
  {
    role: "Embedded Systems & Robotics",
    org: "Independent projects",
    period: "2023 — present",
    bullets: [
      "Built an ESP32 farm robot with live ESP32-CAM streaming, dual network modes, and a connection watchdog that stops the motors on link loss.",
      "Designed a five-component IoT system — ESP32-S3 firmware, a Windows telemetry service, a Flutter app, Home Assistant integration, and a versioned MQTT contract — communicating over TLS.",
      "Built a low-cost solar energy-sharing system with live metering, enforcing usage limits in firmware rather than in the web app.",
    ],
    evidence: [
      "agrobot-autonomous-farming",
      "pico-assistant-pc-control",
      "smart-solar-power-management",
      "esp32-smart-home-automation",
    ],
  },
];

const education = [
  {
    role: "B.Sc. in Computer Science & Engineering",
    org: "American International University-Bangladesh (AIUB)",
    period: "In progress",
    bullets: [
      "Coursework: Algorithms, Operating Systems, Databases, Computer Networks, Machine Learning, Computer Vision & Pattern Recognition.",
      "Coursework projects delivered in C#, PHP, and Python, spanning desktop, web, and embedded targets.",
    ],
  },
];

export default async function ResumePage() {
  const [skills, projects] = await Promise.all([fetchSkills(), fetchProjects()]);

  const grouped = skills.reduce<Record<string, string[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill.name);
    return acc;
  }, {});

  // Map slug -> title so evidence links can show a readable label.
  const projectTitles = new Map(projects.map((p) => [p.slug, p.title]));

  return (
    <div className="pt-6">
      <header className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> resume
          </p>
          <h1 className="mt-2 break-words font-display text-[clamp(1.6rem,6vw,2.25rem)] text-ink-50">
            {identity.name}
          </h1>
          <p className="mt-1.5 text-sm text-ink-100">{identity.title}</p>
          <p className="mt-1 font-mono text-xs text-ink-300">
            {identity.location} ·{" "}
            <a
              href={`mailto:${identity.email}`}
              className="link-underline cursor-pointer text-accent-soft transition-colors hover:text-accent"
            >
              {identity.email}
            </a>
          </p>
          <p className="mt-3">
            <span className="availability-banner max-w-full text-[11px] sm:text-xs">
              <span
                className="status-dot bg-accent-green"
                style={{ boxShadow: "0 0 8px rgba(74,222,128,0.9)" }}
              />
              {identity.availability}
            </span>
          </p>
        </div>
        <a
          href={identity.resumeUrl}
          download
          className="btn-primary w-full shrink-0 cursor-pointer sm:w-auto"
        >
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
          Download PDF
        </a>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.45fr,1fr]">
        <div className="space-y-5">
          <section className="model-card p-6">
            <p className="layer-label">
              <span className="text-accent">::</span> experience
            </p>
            <ul className="mt-5 space-y-7">
              {experience.map((entry) => (
                <li key={entry.role}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-base text-ink-50">{entry.role}</h2>
                    <span className="font-mono text-xs text-ink-300">{entry.period}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-200">{entry.org}</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-100">
                        <span
                          aria-hidden
                          className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {entry.evidence.length > 0 && (
                    <p className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-300">
                        evidence
                      </span>
                      {entry.evidence
                        .filter((slug) => projectTitles.has(slug))
                        .map((slug) => (
                          <Link
                            key={slug}
                            href={`/projects/${slug}`}
                            data-cursor="hover"
                            className="cursor-pointer rounded-md border border-accent/25 bg-accent/[0.06] px-2 py-0.5 font-mono text-[11px] text-accent-soft transition-colors duration-200 hover:border-accent/50 hover:bg-accent/[0.12] hover:text-accent"
                          >
                            {projectTitles.get(slug)}
                          </Link>
                        ))}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="model-card p-6">
            <p className="layer-label">
              <span className="text-accent">::</span> education
            </p>
            <ul className="mt-5 space-y-5">
              {education.map((entry) => (
                <li key={entry.role}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-base text-ink-50">{entry.role}</h2>
                    <span className="font-mono text-xs text-ink-300">{entry.period}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-200">{entry.org}</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-100">
                        <span
                          aria-hidden
                          className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section className="model-card p-6">
            <p className="layer-label">
              <span className="text-accent">::</span> skills
            </p>
            {Object.keys(grouped).length === 0 ? (
              <p className="mt-3 text-sm text-ink-300">Backend offline.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {Object.entries(grouped).map(([category, names]) => (
                  <li key={category}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                      {category}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-100">
                      {names.join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="model-card p-6">
            <p className="layer-label">
              <span className="text-accent">::</span> links
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm">
              {socialLinks.map((social) => (
                <li key={social.key}>
                  <a
                    className="cursor-pointer text-ink-100 transition-colors hover:text-accent-soft"
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    → {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="cursor-pointer text-ink-100 transition-colors hover:text-accent-soft"
                  href={`mailto:${identity.email}`}
                >
                  → Email
                </a>
              </li>
            </ul>
          </section>

          <section className="model-card dot-grid p-6">
            <p className="font-display text-base text-ink-50">Looking for someone?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              I&rsquo;m open to internships, research collaborations, and
              freelance work in computer vision and ML engineering.
            </p>
            <Link href="/contact" className="btn-primary mt-4 w-full cursor-pointer">
              Get in touch
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
