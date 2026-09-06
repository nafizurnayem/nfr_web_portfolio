"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { identity, navLinks } from "@/lib/identity";
import { cn } from "@/lib/cn";
import { SystemStatus } from "@/components/system-status";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/[0.07] bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between px-5 py-3 sm:px-6 lg:px-8 2xl:px-12">
        <Link
          href="/"
          data-cursor="hover"
          className="group -ml-1 flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-1 tracking-tight"
          aria-label={`${identity.name} — home`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent/40 bg-accent/10 font-mono text-[11px] font-bold text-accent-soft shadow-glow-cyan transition-colors duration-200 group-hover:border-accent/70">
            {identity.initials}
          </span>
          <span className="hidden shrink-0 leading-tight sm:block">
            <span className="block font-display text-sm text-ink-50">
              {identity.name}
            </span>
            <span className="block whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-ink-300">
              computer vision · ml
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 lg:gap-4">
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-cursor="hover"
                  className={cn(
                    "relative inline-flex min-h-[38px] cursor-pointer items-center rounded-md px-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200 lg:px-3",
                    active
                      ? "text-accent-soft"
                      : "text-ink-200 hover:text-ink-50"
                  )}
                >
                  <span className="text-ink-300">/</span>
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-md border border-accent/30 bg-accent/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <span className="hidden h-4 w-px bg-surface/[0.14] xl:inline-block" />
          <SystemStatus />

          {/* Always-visible conversion path. A visitor should never have to
              hunt for how to contact the person whose site they are on. */}
          <ThemeToggle />

          <Link
            href="/contact"
            data-cursor="hover"
            className="hidden min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-accent/[0.10] px-3 font-mono text-xs text-accent-soft transition-colors duration-200 hover:border-accent/70 hover:bg-accent/[0.18] hover:text-accent md:inline-flex lg:px-4"
          >
            hire me
          </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className="-mr-1 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-line/10 text-ink-100 transition-colors hover:border-accent/40 hover:text-accent-soft md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h18" strokeLinecap="round" />
                <path d="M3 12h18" strokeLinecap="round" />
                <path d="M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        </div>

      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line/[0.07] bg-ink-950/95 md:hidden"
          >
            <ul className="mx-auto flex max-w-shell flex-col gap-0.5 px-5 py-3">
              {navLinks.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-[44px] items-center rounded-md px-3 font-mono text-sm uppercase tracking-wider transition-colors",
                        active
                          ? "bg-accent/[0.08] text-accent-soft"
                          : "text-ink-200 hover:bg-surface/[0.06] hover:text-ink-50"
                      )}
                    >
                      /{l.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2 border-t border-line/10 pt-3">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full cursor-pointer"
                >
                  Hire me
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
