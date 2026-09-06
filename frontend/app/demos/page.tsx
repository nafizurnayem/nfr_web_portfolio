import type { Metadata } from "next";
import Link from "next/link";
import { PlantDiseaseDemo } from "@/components/plant-disease-demo";
import { fetchProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Interactive demos running against the live FastAPI backend, plus deployed projects you can open right now.",
};

export default async function DemosPage() {
  const projects = await fetchProjects();
  // Anything with a live_url is a real, deployed thing a visitor can open --
  // far more convincing than a "coming soon" placeholder.
  const liveProjects = projects.filter((project) => project.live_url);

  return (
    <div className="pt-6">
      <header className="mb-8">
        <p className="layer-label">
          <span className="text-accent">::</span> demos
        </p>
        <h1 className="mt-2 break-words font-display text-[clamp(1.6rem,6vw,2.25rem)] text-ink-50">
          Try it <span className="text-neural">yourself</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">
          The classifier below runs against the live FastAPI backend — upload an
          image and watch the request go through validation, magic-byte
          verification, and inference. Below it are projects already deployed
          and open to the public.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <PlantDiseaseDemo />

        <div className="space-y-4">
          <div className="model-card p-5">
            <p className="layer-label">
              <span className="text-accent">::</span> how this demo works
            </p>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-200">
              {[
                "The browser posts the image as multipart form data to /api/demos/plant-disease.",
                "The backend checks the MIME type, streams the body with a 4 MB ceiling, and verifies the magic bytes — the file extension is never trusted.",
                "A deterministic placeholder scorer stands in for the trained checkpoint, so the same image always returns the same answer.",
                "The response carries the top prediction plus runner-up classes with confidence scores.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 whitespace-nowrap font-mono text-xs text-accent">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-md border border-accent-amber/25 bg-accent-amber/[0.06] px-3 py-2 text-xs leading-relaxed text-accent-amber">
              The scoring step is a labelled placeholder, not the trained model.
              The full pipeline around it — upload, validation, transport,
              response shape — is real, so swapping in the PyTorch checkpoint is
              a one-function change.
            </p>
          </div>
        </div>
      </section>

      {liveProjects.length > 0 && (
        <section className="mt-14">
          <p className="layer-label">
            <span className="text-accent">::</span> deployed &amp; public
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink-50">
            Projects you can open right now
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {liveProjects.map((project) => (
              <div key={project.id} className="model-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="layer-label break-words">{project.category}</p>
                    <h3 className="mt-1.5 font-display text-lg text-ink-50">
                      {project.title}
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/[0.08] px-2.5 py-0.5 font-mono text-[11px] text-accent-green">
                    <span
                      className="status-dot bg-accent-green"
                      style={{ boxShadow: "0 0 6px rgba(74,222,128,0.9)" }}
                    />
                    live
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-200">
                  {project.summary}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <a
                    href={project.live_url ?? "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary w-full cursor-pointer sm:w-auto"
                    aria-label={`Open the live ${project.title} deployment (opens in a new tab)`}
                  >
                    Open live site
                  </a>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="btn-ghost w-full cursor-pointer sm:w-auto"
                  >
                    Read the case study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
