import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Standard page section: a "layer label" eyebrow, a display heading, an
 * optional lead paragraph, then content. Keeping this in one place is what
 * stops section spacing and heading sizes drifting between pages.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("mt-16 sm:mt-20", className)}>
      {(eyebrow || title || description) && (
        <header className="mb-6">
          {eyebrow && (
            <p className="layer-label">
              <span className="text-accent">::</span> {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-2 font-display text-2xl text-ink-50 sm:text-3xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-200">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
