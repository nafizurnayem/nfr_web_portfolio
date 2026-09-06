"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { identity } from "@/lib/identity";

/**
 * The hero portrait: a framed photograph on a glass panel.
 *
 * Deliberately simple. An earlier version transformed on scroll into a cowled
 * silhouette; it was removed at the owner's request in favour of a calmer hero.
 * The only motion here is a single fade-and-rise on mount, skipped entirely
 * under `prefers-reduced-motion`.
 */
export function PortraitHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[420px] 2xl:max-w-[460px]"
    >
      {/* Soft light behind the subject, tinted to the accent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{ background: "var(--portrait-glow)" }}
      />

      <div className="glass-panel relative overflow-hidden rounded-[28px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        {/* Caption strip */}
        <div className="glass-divider relative z-20 flex h-10 items-center justify-between border-b px-4 font-mono text-[11px]">
          <span className="flex items-center gap-2 text-ink-200">
            <span
              className="status-dot bg-accent-green"
              style={{ boxShadow: "0 0 8px var(--glow-green)" }}
            />
            available for work
          </span>
          <span className="text-ink-300">{identity.initials}</span>
        </div>

        <div className="relative aspect-[1286/2200] w-full overflow-hidden">
          <Image
            // 960x2051 WebP (128 KB) derived from the 1286x2747 original. The
            // frame never renders wider than ~460 CSS px, so this covers a 2x
            // display exactly.
            src="/nafiz.webp"
            alt={`${identity.name}, ${identity.title}`}
            fill
            priority
            sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 460px"
            className="object-cover object-top"
          />

          {/* Fade into the panel rather than ending on a hard crop line. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28"
            style={{ background: "var(--portrait-fade)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
