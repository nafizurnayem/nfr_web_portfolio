"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Minimal cursor: one filled dot with a soft halo on hover.
 *
 * - Idle: 8px solid cyan dot with a small glow.
 * - Hover (over any interactive element): same dot grows a touch (12px) and
 *   gains a soft circular halo around it (rendered as a single layered
 *   box-shadow, so we still only have one element on screen).
 * - Press: dot contracts slightly to acknowledge the click.
 *
 * Hidden on touch / coarse-pointer devices.
 */
export function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 800, damping: 50, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 800, damping: 50, mass: 0.2 });

  const lastTarget = useRef<Element | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    function onMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      if (target !== lastTarget.current) {
        lastTarget.current = target;
        const interactive = !!target?.closest(
          "a, button, [role='button'], input, textarea, select, summary, [data-cursor='hover']"
        );
        setHover(interactive);
      }
    }
    function onDown() {
      setPressed(true);
    }
    function onUp() {
      setPressed(false);
    }
    function onLeave() {
      setHidden(true);
    }
    function onEnter() {
      setHidden(false);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = hover ? 12 : 8;
  const scale = pressed ? 0.85 : 1;
  // The halo is a transparent circle painted around the dot using a single
  // box-shadow with positive spread. Adding a second outer shadow gives it a
  // smooth glow falloff. On press the halo briefly intensifies.
  const boxShadow = pressed
    ? "0 0 0 14px rgba(34,211,238,0.18), 0 0 24px rgba(34,211,238,0.55)"
    : hover
    ? "0 0 0 10px rgba(34,211,238,0.10), 0 0 18px rgba(34,211,238,0.45)"
    : "0 0 0 0 rgba(34,211,238,0), 0 0 10px rgba(34,211,238,0.50)";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      style={{
        x: sx,
        y: sy,
        opacity: hidden ? 0 : 1,
      }}
      animate={{
        width: size,
        height: size,
        boxShadow,
        scale,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 26,
        mass: 0.35,
      }}
      initial={false}
    />
  );
}
