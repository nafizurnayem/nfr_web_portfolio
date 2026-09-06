import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { identity, socialLinks } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Contact",
  description: `Hire or collaborate with ${identity.name} — computer vision and machine learning engineer.`,
};

export default function ContactPage() {
  return (
    <div className="pt-6">
      <header className="mb-8">
        <p className="layer-label">
          <span className="text-accent">::</span> contact
        </p>
        <h1 className="mt-2 break-words font-display text-[clamp(1.6rem,6vw,2.25rem)] text-ink-50">
          Let&rsquo;s talk about your <span className="text-neural">project</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">
          Whether it&rsquo;s a vision model you need trained, an LLM feature you
          want built properly, or a full product to ship — tell me what
          you&rsquo;re working on and I&rsquo;ll tell you honestly whether I can
          help. I usually reply within a day.
        </p>
        <p className="mt-4">
          <span className="availability-banner max-w-full text-[11px] sm:text-xs">
            <span
              className="status-dot bg-accent-green"
              style={{ boxShadow: "0 0 8px rgba(74,222,128,0.9)" }}
            />
            {identity.availability}
          </span>
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="model-card p-5">
            <p className="layer-label">
              <span className="text-accent">::</span> direct
            </p>
            <p className="mt-3">
              <a
                href={`mailto:${identity.email}`}
                className="tap-link link-underline cursor-pointer font-mono text-sm text-accent-soft transition-colors hover:text-accent"
              >
                {identity.email}
              </a>
            </p>
            <p className="mt-1.5 text-xs text-ink-300">{identity.location}</p>
            <p className="mt-3 text-xs text-ink-200">
              Comfortable working remote across time zones.
            </p>
          </div>

          <div className="model-card p-5">
            <p className="layer-label">
              <span className="text-accent">::</span> elsewhere
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-y-2 font-mono text-sm sm:grid-cols-2">
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
            </ul>
          </div>

          <div className="model-card p-5">
            <p className="layer-label">
              <span className="text-accent">::</span> what happens to your message
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-200">
              <li className="flex gap-2">
                <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>
                  Validated and sanitised server-side, then stored in this
                  site&rsquo;s own database.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>Used only to reply to you. Never shared or sold.</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>
                  Protected by a honeypot field and IP-based rate limiting
                  (5/minute, 30/hour).
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
