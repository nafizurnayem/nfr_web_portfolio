"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Canvas-based "code rain" animation that doubles as an ambient video-style
 * backdrop for the hero. Designed to be cheap on CPU/GPU:
 *  - 2D canvas (no WebGL) with a translucent black overlay each frame so
 *    trails fade naturally instead of via per-cell opacity bookkeeping.
 *  - Single rAF loop with a 35ms tick budget (≈28fps) — fast enough to feel
 *    alive, slow enough to be cool on laptops.
 *  - Disables itself if the user prefers reduced motion.
 */
export function MatrixRain({
  className,
  density = 1,
  charset = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]<>$&|=+#@/\\*-",
}: {
  className?: string;
  /** Multiplier for column count. 1 = ~1 col every 14px. */
  density?: number;
  charset?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const fontSize = 14;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor((width / fontSize) * density));
      drops = Array.from({ length: cols }, () => Math.random() * (height / fontSize));
      speeds = Array.from({ length: cols }, () => 0.4 + Math.random() * 0.9);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = performance.now();
    const TICK = 35;

    function frame(now: number) {
      if (!ctx) return;
      const dt = now - last;
      if (dt < TICK) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      last = now;

      // Trail fade: a near-black translucent fill leaves a comet tail.
      ctx.fillStyle = "rgba(5, 7, 11, 0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";

      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const ch = charset.charAt(Math.floor(Math.random() * charset.length));

        // Head of the column: bright cyan/green, occasionally a hot accent.
        const isHead = Math.random() < 0.08;
        const isAccent = i % 11 === 0;
        ctx.fillStyle = isHead
          ? "#f1fbff"
          : isAccent
          ? "rgba(57, 255, 122, 0.95)"
          : "rgba(103, 232, 249, 0.85)";

        ctx.fillText(ch, x, y);

        // Reset column to top at random once it leaves the canvas.
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] += speeds[i];
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    if (!reduced) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      // Single static frame so the layer isn't blank.
      ctx.fillStyle = "rgba(5, 7, 11, 1)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(103, 232, 249, 0.4)";
      ctx.font = `${fontSize}px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace`;
      for (let i = 0; i < cols; i += 2) {
        ctx.fillText(charset[i % charset.length], i * fontSize, (i % 20) * fontSize);
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [charset, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-full w-full", className)}
    />
  );
}
