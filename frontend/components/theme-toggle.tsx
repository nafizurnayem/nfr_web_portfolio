"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Light / dark switch.
 *
 * The chosen theme lives in `localStorage` under `THEME_KEY` and is applied to
 * `<html data-theme>`. The *initial* application happens in a blocking inline
 * script in `app/layout.tsx`, before first paint — if it were done here, in an
 * effect, every visitor with the non-default theme would see a flash of the
 * wrong one. This component only handles changes after hydration.
 *
 * With no stored choice, the OS preference wins, and the component keeps
 * following the OS until the visitor makes an explicit choice.
 *
 * ── How the switch is animated ─────────────────────────────────────────────
 * Preferred path is the **View Transitions API**: the browser snapshots the
 * page, we flip the attribute, and the new snapshot is revealed with a circular
 * wipe growing from the button. That is a single GPU-composited animation.
 *
 * The fallback transitions colours on the elements themselves. That was the
 * original approach for every browser and it was measurably rough — it applies
 * a transition to ~1100 elements at once and frame time hit ~93ms (about
 * 11fps). It is kept only for browsers without View Transitions, and trimmed
 * down (no `box-shadow`, which was the most expensive property to interpolate).
 */

export const THEME_KEY = "portfolio-theme";
type Theme = "light" | "dark";

/** Circular wipe duration. Matches the CSS fallback so both feel the same. */
const SWEEP_MS = 620;
/** Fallback colour-transition duration; must match `.theme-switching` in CSS. */
const FALLBACK_MS = 420;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
    setMounted(true);

    // Keep following the system until an explicit choice has been stored.
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(THEME_KEY);
      } catch {
        // Private mode or blocked storage: fall through to system preference.
      }
      if (stored === "light" || stored === "dark") return;
      const next: Theme = event.matches ? "light" : "dark";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    query.addEventListener("change", onSystemChange);
    return () => query.removeEventListener("change", onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    // Ignore repeat clicks while a sweep is in flight; restarting mid-animation
    // leaves the snapshot and the live DOM briefly disagreeing.
    if (busy.current) return;

    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const commit = () => {
      root.setAttribute("data-theme", next);
      setTheme(next);
    };

    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be unavailable; the theme still applies for this page view.
    }

    const doc = document as ViewTransitionDocument;

    if (reduceMotion || typeof doc.startViewTransition !== "function") {
      // Fallback: transition the colours themselves, enabled only for the
      // duration of the switch so the page is not paying for it on every hover.
      if (!reduceMotion) {
        busy.current = true;
        root.classList.add("theme-switching");
        window.setTimeout(() => {
          root.classList.remove("theme-switching");
          busy.current = false;
        }, FALLBACK_MS + 60);
      }
      commit();
      return;
    }

    // Circular wipe from the centre of the button.
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 48;
    const y = rect ? rect.top + rect.height / 2 : 32;
    // Radius needed to cover the furthest corner from that point.
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    busy.current = true;
    // While the snapshot is on screen the live page is not visible, so tell
    // continuous animations (the hero canvas) to stand down rather than burn
    // main-thread time rendering frames nobody sees.
    root.setAttribute("data-theme-switching", "");
    const transition = doc.startViewTransition(commit);

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: SWEEP_MS,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            // Only the incoming snapshot is clipped; the outgoing one stays put
            // underneath, so the new theme appears to wash over the old.
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {
        // A transition can be skipped (e.g. the tab is hidden). The attribute
        // is already committed by then, so there is nothing to undo.
      });

    transition.finished.finally(() => {
      root.removeAttribute("data-theme-switching");
      busy.current = false;
    });
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      // Before hydration the label would be a guess, so it is kept generic
      // rather than announced wrongly.
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Switch colour theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : undefined}
      className={`glass-panel group relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-colors duration-200 hover:border-accent/40 ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 grid place-items-center"
        >
          {isDark ? (
            <MoonIcon className="text-accent-soft" />
          ) : (
            <SunIcon className="text-accent-amber" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}
