"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  intensity?: number;
  /** Disable the cursor glow halo. */
  noGlow?: boolean;
  /** Additional inline style passthrough. */
  style?: CSSProperties;
};

/**
 * 3D perspective tilt + cursor-following radial glow.
 *
 * The element rotates in response to the pointer position relative to its
 * own bounding box. A second layer renders a soft radial gradient that
 * tracks the cursor for a "spotlight under glass" effect.
 */
export function TiltCard({
  children,
  className,
  intensity = 9,
  noGlow = false,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Normalized pointer position within the element, range [-0.5, 0.5].
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Glow position (in pixels, relative to element).
  const gx = useMotionValue(-200);
  const gy = useMotionValue(-200);

  const rotateX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.5 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.5 });
  const lift = useSpring(0, { stiffness: 220, damping: 22, mass: 0.5 });

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const nx = lx / rect.width - 0.5;
    const ny = ly / rect.height - 0.5;
    px.set(nx);
    py.set(ny);
    rotateY.set(nx * intensity);
    rotateX.set(-ny * intensity);
    lift.set(6);
    gx.set(lx);
    gy.set(ly);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
    gx.set(-200);
    gy.set(-200);
  }

  const glowBg = useMotionTemplate`radial-gradient(220px circle at ${gx}px ${gy}px, rgba(34,211,238,0.18), transparent 60%)`;
  const topEdgeOpacity = useTransform(py, [-0.5, 0.5], [0.9, 0.1]);

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "[transform-style:preserve-3d] [perspective:1000px] will-change-transform",
        className
      )}
      style={{
        rotateX,
        rotateY,
        translateZ: lift,
        ...style,
      }}
    >
      <div className="relative h-full w-full [transform-style:preserve-3d]">
        {children}
        {!noGlow && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-100 mix-blend-screen"
            style={{ backgroundImage: glowBg }}
          />
        )}
        {/* Subtle highlight on the top edge, scaled by tilt for added depth. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
            opacity: topEdgeOpacity,
          }}
        />
      </div>
    </motion.div>
  );
}
