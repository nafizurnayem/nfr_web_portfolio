import Link from "next/link";
import { identity, socialLinks } from "@/lib/identity";

/**
 * Footer. Every visitor who scrolls this far is a warm lead, so the first
 * column is a direct call to action rather than a repeat of the site title.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-16 border-t border-line/10 bg-ink-950/70 backdrop-blur">
      <div className="mx-auto grid w-full max-w-shell gap-8 px-5 py-12 sm:px-6 md:grid-cols-3 lg:px-8 2xl:px-12">
        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> get in touch
          </p>
          <p className="mt-3 font-display text-lg text-ink-50">{identity.name}</p>
          <p className="mt-1 text-sm text-ink-200">{identity.title}</p>
          <p className="mt-1 text-xs text-ink-300">{identity.location}</p>
          <a
            href={`mailto:${identity.email}`}
            className="tap-link link-underline mt-3 cursor-pointer font-mono text-sm text-accent-soft transition-colors hover:text-accent"
          >
            {identity.email}
          </a>
          <p className="mt-4">
            <span className="availability-banner">
              <span
                className="status-dot bg-accent-green"
                style={{ boxShadow: "0 0 8px rgba(74,222,128,0.9)" }}
              />
              Open to work
            </span>
          </p>
        </div>

        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> elsewhere
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-sm">
            {socialLinks.map((social) => (
              <li key={social.key}>
                <a
                  className="cursor-pointer text-ink-100 transition-colors hover:text-accent-soft"
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> pages
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-y-1.5 font-mono text-sm">
            {[
              ["/projects", "projects"],
              ["/demos", "demos"],
              ["/resume", "resume"],
              ["/contact", "contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  className="cursor-pointer text-ink-100 transition-colors hover:text-accent-soft"
                  href={href}
                >
                  /{label}
                </Link>
              </li>
            ))}
            <li>
              <a
                className="cursor-pointer text-ink-100 transition-colors hover:text-accent-soft"
                href={identity.resumeUrl}
                download
              >
                /resume.pdf
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/10">
        <div className="mx-auto flex max-w-shell flex-col gap-2 px-5 py-4 font-mono text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 2xl:px-12">
          <span>Built with Next.js, FastAPI and PyTorch.</span>
          <span>© {new Date().getFullYear()} {identity.name}</span>
        </div>
      </div>
    </footer>
  );
}
