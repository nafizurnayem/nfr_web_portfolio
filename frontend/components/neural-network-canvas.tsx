"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's signature visual: a live feed-forward neural network.
 *
 * Rather than decorative particles, this draws something that actually maps to
 * what the site is about -- an input layer, hidden layers, an output layer, and
 * activation pulses travelling along weighted connections. Edge brightness
 * encodes weight magnitude and edge colour encodes sign (cyan positive, violet
 * negative), which is the same convention used when visualising a real network.
 *
 * Implementation notes:
 * - Pure 2D canvas + requestAnimationFrame. No WebGL, no library.
 * - Only `transform`-free drawing, so there is no layout cost.
 * - Honours `prefers-reduced-motion`: renders one static frame and stops.
 * - Pauses when the tab is hidden or the element scrolls out of view, so it
 *   never burns battery in the background.
 */

type Node = {
  x: number;
  y: number;
  layer: number;
  index: number;
  activation: number;
  /** Phase offset so idle nodes don't all breathe in sync. */
  phase: number;
};

type Edge = {
  from: Node;
  to: Node;
  weight: number; // -1..1
};

type Pulse = {
  edge: Edge;
  progress: number; // 0..1
  speed: number;
};

/** Full-size network for desktop. */
const LAYER_SIZES = [4, 6, 6, 3];
/** Narrow screens get a smaller graph so nodes do not crowd into a smear. */
const LAYER_SIZES_COMPACT = [3, 4, 4, 2];
const COMPACT_BREAKPOINT = 640;
const PULSE_SPAWN_PER_SECOND = 14;
const MAX_PULSES = 90;

export function NeuralNetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /**
     * The canvas cannot use Tailwind classes, so it reads the same CSS
     * variables the rest of the theme uses. Without this it drew dark-theme
     * cyan over a light page, which both looked wrong and reduced the contrast
     * of the headline sitting on top of it.
     */
    let palette = { positive: "34, 211, 238", negative: "167, 139, 250", input: "125, 211, 252", output: "74, 222, 128", alpha: 1 };
    function readPalette() {
      const style = getComputedStyle(document.documentElement);
      const rgb = (name: string, fallback: string) => {
        const value = style.getPropertyValue(name).trim();
        return value ? value.split(/\s+/).join(", ") : fallback;
      };
      const light = document.documentElement.getAttribute("data-theme") === "light";
      palette = {
        positive: rgb("--accent", "34, 211, 238"),
        negative: rgb("--accent-violet", "167, 139, 250"),
        input: rgb("--accent-soft", "125, 211, 252"),
        output: rgb("--accent-green", "74, 222, 128"),
        // The light ground gives far less contrast headroom, so everything is
        // drawn fainter to stay decorative rather than noisy.
        alpha: light ? 0.55 : 1,
      };
    }
    readPalette();

    /** True while a theme switch is mid-flight. */
    let switching = false;

    const themeObserver = new MutationObserver(() => {
      readPalette();
      const nowSwitching = document.documentElement.hasAttribute("data-theme-switching");
      if (nowSwitching === switching) return;
      switching = nowSwitching;
      // Resume from a fresh timestamp, or the first frame back would integrate
      // the whole paused interval and jump every pulse forward at once.
      if (!switching && !reduceMotion && running && visible) {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-theme-switching"],
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let frame = 0;
    let lastTime = performance.now();
    let visible = true;
    let running = true;

    /** Layer sizes appropriate to the current canvas width. */
    let layerSizes: number[] = LAYER_SIZES;

    /** Build the network geometry for the current canvas size. */
    function layout() {
      nodes = [];
      edges = [];
      pulses = [];
      layerSizes = width < COMPACT_BREAKPOINT ? LAYER_SIZES_COMPACT : LAYER_SIZES;

      // Keep the graph inside a readable band; the left side of the hero holds
      // the headline, so the network is weighted toward the right.
      const marginX = width * 0.12;
      const usableWidth = width - marginX * 2;
      const marginY = height * 0.16;
      const usableHeight = height - marginY * 2;

      layerSizes.forEach((count, layerIndex) => {
        const x =
          marginX +
          (usableWidth * layerIndex) / Math.max(1, layerSizes.length - 1);
        for (let i = 0; i < count; i += 1) {
          // Centre each layer vertically regardless of how many nodes it has.
          const spacing = usableHeight / Math.max(1, count - 1 || 1);
          const y =
            count === 1
              ? marginY + usableHeight / 2
              : marginY + spacing * i;
          nodes.push({
            x,
            y,
            layer: layerIndex,
            index: i,
            activation: Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
          });
        }
      });

      // Fully connect adjacent layers.
      for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex += 1) {
        const from = nodes.filter((n) => n.layer === layerIndex);
        const to = nodes.filter((n) => n.layer === layerIndex + 1);
        from.forEach((a) => {
          to.forEach((b) => {
            edges.push({ from: a, to: b, weight: Math.random() * 2 - 1 });
          });
        });
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    function spawnPulse() {
      if (pulses.length >= MAX_PULSES || edges.length === 0) return;
      const edge = edges[Math.floor(Math.random() * edges.length)];
      // Strong weights fire more often, which is what makes the animation read
      // as computation rather than random motion.
      if (Math.random() > Math.abs(edge.weight) * 0.85 + 0.15) return;
      pulses.push({
        edge,
        progress: 0,
        speed: 0.35 + Math.random() * 0.45,
      });
    }

    function draw(time: number) {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx!.clearRect(0, 0, width, height);

      // ── Edges ──────────────────────────────────────────────────────────
      edges.forEach((edge) => {
        const magnitude = Math.abs(edge.weight);
        const positive = edge.weight >= 0;
        // Faint by default; the pulses supply the visual interest.
        const alpha = 0.03 + magnitude * 0.10;
        ctx!.strokeStyle = positive
          ? `rgba(${palette.positive}, ${alpha * palette.alpha})`
          : `rgba(${palette.negative}, ${alpha * palette.alpha})`;
        ctx!.lineWidth = 0.4 + magnitude * 0.9;
        ctx!.beginPath();
        ctx!.moveTo(edge.from.x, edge.from.y);
        ctx!.lineTo(edge.to.x, edge.to.y);
        ctx!.stroke();
      });

      // ── Pulses (activations travelling forward) ────────────────────────
      if (!reduceMotion) {
        pulses.forEach((pulse) => {
          pulse.progress += pulse.speed * deltaSeconds;
        });
        // Arriving pulses excite their destination node.
        pulses
          .filter((p) => p.progress >= 1)
          .forEach((p) => {
            p.edge.to.activation = Math.min(1, p.edge.to.activation + 0.5);
          });
        pulses = pulses.filter((p) => p.progress < 1);
      }

      pulses.forEach((pulse) => {
        const { from, to } = pulse.edge;
        // Ease so pulses accelerate away from the source node.
        const t = pulse.progress;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const positive = pulse.edge.weight >= 0;
        const fade = Math.sin(t * Math.PI); // fade in and out along the edge
        const colour = positive ? palette.positive : palette.negative;

        // Trailing streak.
        const trail = 0.12;
        const tx = from.x + (to.x - from.x) * Math.max(0, t - trail);
        const ty = from.y + (to.y - from.y) * Math.max(0, t - trail);
        const gradient = ctx!.createLinearGradient(tx, ty, x, y);
        gradient.addColorStop(0, `rgba(${colour}, 0)`);
        gradient.addColorStop(1, `rgba(${colour}, ${0.75 * fade * palette.alpha})`);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.6;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(tx, ty);
        ctx!.lineTo(x, y);
        ctx!.stroke();

        // Head.
        ctx!.fillStyle = `rgba(${colour}, ${0.9 * fade * palette.alpha})`;
        ctx!.beginPath();
        ctx!.arc(x, y, 1.7, 0, Math.PI * 2);
        ctx!.fill();
      });

      // ── Nodes ──────────────────────────────────────────────────────────
      nodes.forEach((node) => {
        if (!reduceMotion) {
          // Decay toward a slow idle breathing baseline.
          node.activation *= 0.965;
          const idle = 0.12 + 0.08 * Math.sin(time / 900 + node.phase);
          node.activation = Math.max(node.activation, idle);
        }

        const isOutput = node.layer === layerSizes.length - 1;
        const isInput = node.layer === 0;
        const colour = isOutput
          ? palette.output
          : isInput
          ? palette.input
          : palette.positive;
        const radius = 3 + node.activation * 2.6;

        // Halo.
        const halo = ctx!.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          radius * 5
        );
        halo.addColorStop(0, `rgba(${colour}, ${0.3 * node.activation * palette.alpha})`);
        halo.addColorStop(1, `rgba(${colour}, 0)`);
        ctx!.fillStyle = halo;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, radius * 5, 0, Math.PI * 2);
        ctx!.fill();

        // Core.
        ctx!.fillStyle = `rgba(${colour}, ${(0.45 + node.activation * 0.55) * palette.alpha})`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx!.fill();

        // Thin ring so nodes stay legible against bright pulses.
        ctx!.strokeStyle = `rgba(${colour}, ${(0.25 + node.activation * 0.35) * palette.alpha})`;
        ctx!.lineWidth = 0.8;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, radius + 2.5, 0, Math.PI * 2);
        ctx!.stroke();
      });

      if (!reduceMotion) {
        // Spawn proportional to elapsed time so the density is frame-rate
        // independent on both 60Hz and 144Hz displays.
        const spawnCount = PULSE_SPAWN_PER_SECOND * deltaSeconds;
        let whole = Math.floor(spawnCount);
        if (Math.random() < spawnCount - whole) whole += 1;
        for (let i = 0; i < whole; i += 1) spawnPulse();
      }

      if (running && !reduceMotion && visible && !switching) {
        frame = requestAnimationFrame(draw);
      }
    }

    resize();

    if (reduceMotion) {
      // One static frame: the structure is still communicated, nothing moves.
      draw(performance.now());
    } else {
      frame = requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(performance.now());
    });
    resizeObserver.observe(canvas);

    function handleVisibility() {
      const nowVisible = document.visibilityState === "visible";
      if (nowVisible === visible) return;
      visible = nowVisible;
      if (visible && !reduceMotion && running) {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // Stop drawing entirely once the hero has scrolled away.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen === visible) return;
        visible = onScreen;
        if (visible && !reduceMotion && running) {
          lastTime = performance.now();
          frame = requestAnimationFrame(draw);
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
