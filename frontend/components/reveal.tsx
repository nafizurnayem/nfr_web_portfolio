"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-in reveal.
 *
 * Deliberately animates **only transform and opacity**. An earlier version also
 * animated `filter: blur()`, which forces the browser to re-rasterise the layer
 * on every frame — with a `<Reveal>` wrapping every card and section on the
 * page, that was a measurable source of jank during load and scroll. Transform
 * and opacity are handled on the compositor and cost effectively nothing.
 */
const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredWords({
  text,
  className,
  wordClassName,
  /** Seconds between each word starting. Higher = slower, more deliberate. */
  stagger = 0.11,
  /** Seconds each word takes to settle. */
  duration = 0.85,
  /** Seconds to wait before the first word moves. */
  delay = 0,
}: {
  text: string;
  className?: string;
  /**
   * Optional className applied to each word span. Use this for visual
   * properties that must be on the actual text node — e.g. `bg-clip-text`
   * gradients — because applying them only to the outer span breaks once the
   * words become their own `inline-block` boxes.
   */
  wordClassName?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={cn("mr-[0.25em] inline-block", wordClassName)}
          variants={{
            // Transform + opacity only — see the note on `variants` above.
            // The slight scale and vertical travel give each word a sense of
            // arriving rather than simply fading in.
            hidden: { opacity: 0, y: "0.45em", scale: 0.94 },
            visible: {
              opacity: 1,
              y: "0em",
              scale: 1,
              transition: {
                duration,
                // Gentle overshoot, so words settle with a little weight.
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          {word}
          {/* A real space. The visual gap comes from `mr-[0.25em]`, but without
              actual whitespace in the DOM a screen reader runs the words
              together — "MdNafizurNayem" rather than "Md Nafizur Nayem". */}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
