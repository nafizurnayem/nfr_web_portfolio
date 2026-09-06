"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * The headline's second line, cycling through one phrase per discipline so a
 * visitor from any of them sees themselves addressed within a few seconds.
 *
 * Three things this has to get right:
 *
 * 1. **No layout shift.** The phrases wrap to different numbers of lines. Every
 *    phrase is therefore rendered into the same grid cell — inactive ones
 *    hidden — so the container is always as tall as the longest one and nothing
 *    below it moves. Reserving that space is the whole reason for the grid.
 * 2. **One phrase in the accessibility tree.** Inactive phrases are
 *    `aria-hidden`, and the live region is `off` — a headline that announced
 *    itself every five seconds would be hostile to a screen reader.
 * 3. **Stoppable.** WCAG 2.2.2 expects a way to pause auto-updating content.
 *    Rotation pauses on hover and on keyboard focus, stops when the tab is
 *    hidden or the element scrolls away, and never starts at all under
 *    `prefers-reduced-motion`.
 */

/** Time each phrase is held, in ms. */
const INTERVAL_MS = 5000;

/**
 * Ordered so the lead specialism shows first.
 *
 * **These must all wrap to the same number of lines**, because the block
 * reserves the height of the tallest and every other phrase then sits in an
 * over-tall box with a visible gap beneath it. Character count is a poor proxy
 * — wrapping depends on word lengths — so measure the rendered line boxes after
 * editing (`Range.selectNodeContents(el).getClientRects().length`) rather than
 * trusting the string length. One earlier phrase was 54 characters, the same as
 * its neighbours, and still wrapped to three lines.
 *
 * This set wraps identically at 375, 414, 768, 1024, 1440 and 1920. At 320px the
 * last two phrases take one line more than the first two, so those two reserve a
 * little extra space on the very smallest screens. Several shorter alternatives
 * were measured and every one of them broke parity at some *other* width, so
 * this is the best available set rather than an oversight. There is still no
 * layout shift at 320 — only slightly more whitespace.
 */
const PHRASES = [
  "trains vision models and ships them as real products.",
  "builds embedded systems that hold up in the real world.",
  "writes software that other engineers can actually read.",
  "builds full-stack web apps from database to interface.",
];

export function RotatingHeadline({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const onScreen = useRef(true);

  // Don't rotate while off-screen — the visitor is not reading it, and it would
  // otherwise be mid-cycle at some arbitrary phrase when they scroll back.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        onScreen.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !onScreen.current) return;
      setIndex((i) => (i + 1) % PHRASES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, paused]);

  const active = PHRASES[index];

  return (
    <span
      ref={containerRef}
      className={`grid ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/*
        Height reservation. Every phrase is laid out in the same grid cell, so
        the cell is as tall as the tallest. This copy is invisible and removed
        from the accessibility tree; it exists only to hold the space open.
      */}
      {PHRASES.map((phrase) => (
        <span
          key={`reserve-${phrase}`}
          aria-hidden
          className="invisible col-start-1 row-start-1"
        >
          {phrase}
        </span>
      ))}

      {/* The visible phrase, stacked into the same cell. */}
      <span className="col-start-1 row-start-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            // `block`, not `inline-block`: the reserve copies below are full-cell
            // width, and an inline-block shrink-to-fit box wraps at a different
            // point, which made the reserved height taller than the phrase
            // actually needed and left a gap under the headline.
            className="text-neural-sheen block"
            initial={prefersReducedMotion ? false : { opacity: 0, y: "0.35em" }}
            animate={{ opacity: 1, y: "0em" }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: "-0.35em" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {active}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
