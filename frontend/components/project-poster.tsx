"use client";

import Image from "next/image";
import { useMemo } from "react";

/** A deterministic 32-bit hash used to derive procedural posters. */
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/**
 * Maps a project's category to the poster artwork it gets. These keys must match
 * the `category` values seeded in `backend/app/db/seed.py` exactly -- a key that
 * does not match silently falls through to the "default" poster, which is how
 * every card ended up looking identical before.
 */
const KIND_BY_CATEGORY: Record<string, "ai" | "iot" | "web" | "data" | "ui" | "default"> = {
  "Image Processing & Computer Vision": "ai",
  "AI/ML Research": "data",
  "IoT & Robotics": "iot",
  "Full-Stack Web": "web",
  "Academic / Coursework": "ui",
};

/**
 * A small, decorative "preview image" generated entirely from the slug + category.
 * Looks like a stylized screenshot/poster so cards feel inhabited even before
 * a real screenshot is supplied.
 */
export function ProjectPoster({
  slug,
  category,
  title,
  imageUrl,
  className,
  priority = false,
}: {
  slug: string;
  category: string;
  title: string;
  /** A real screenshot or figure. When set, it replaces the generated art. */
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
}) {
  // A supplied image always wins; the generated artwork is the fallback for
  // projects that have no screenshot yet.
  const { paths, kind, monogram } = useMemo(() => {
    const seed = hash32(`${category}::${slug}`);
    const kind = KIND_BY_CATEGORY[category] ?? "default";
    const monogram = title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("");
    // Hand out a *factory*, not a live generator. `rng` is stateful: sharing a
    // single instance across renders means the second render (React StrictMode
    // renders twice in development) continues the sequence instead of
    // restarting it, so the client drew different artwork than the server sent
    // and React reported a hydration mismatch. Each consumer now seeds its own.
    return { paths: { newRand: () => rng(seed), seed }, kind, monogram };
  }, [slug, category, title]);

  if (imageUrl) {
    return (
      <div
        className={
          "relative aspect-[300/134] w-full overflow-hidden rounded-lg border border-line/[0.07] bg-ink-900/40 " +
          (className ?? "")
        }
      >
        <Image
          src={imageUrl}
          alt={`${title} — project figure`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 30vw"
          className="object-cover"
        />
        {/* Keeps the card's own text legible over a bright figure. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(4,6,10,0.55), rgba(4,6,10,0.05) 45%, transparent)",
          }}
        />
      </div>
    );
  }

  const grad = `grad-${slug}`;
  const mask = `mask-${slug}`;
  const filter = `glow-${slug}`;

  // Build kind-specific overlay shapes
  const overlay = (() => {
    const r = paths.newRand();
    if (kind === "ai") {
      // Neural network nodes + edges
      const nodes: { x: number; y: number; layer: number }[] = [];
      const layers = 4;
      const perLayer = 4;
      for (let l = 0; l < layers; l++) {
        for (let i = 0; i < perLayer; i++) {
          nodes.push({
            x: 30 + (l / (layers - 1)) * 240,
            y: 28 + (i / (perLayer - 1)) * 88,
            layer: l,
          });
        }
      }
      return (
        <g>
          {nodes
            .filter((n) => n.layer < layers - 1)
            .flatMap((a, i) =>
              nodes
                .filter((b) => b.layer === a.layer + 1)
                .map((b, j) => (
                  <line
                    key={`e-${i}-${j}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(34,211,238,0.35)"
                    strokeWidth={0.6}
                  />
                ))
            )}
          {nodes.map((n, i) => (
            <circle
              key={`n-${i}`}
              cx={n.x}
              cy={n.y}
              r={2.2 + r() * 1.4}
              fill="#67e8f9"
              filter={`url(#${filter})`}
            />
          ))}
        </g>
      );
    }
    if (kind === "iot") {
      // Animated waveform sparkline
      const points: string[] = [];
      const amp = 14;
      const cy = 76;
      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = 12 + t * 276;
        const wobble =
          Math.sin(t * 9 + r() * 0.5) * amp +
          Math.sin(t * 22) * (amp * 0.25) * (0.7 + r() * 0.6);
        points.push(`${x.toFixed(2)},${(cy + wobble).toFixed(2)}`);
      }
      return (
        <g>
          {/* baseline */}
          <line x1={12} y1={76} x2={288} y2={76} stroke="rgba(255,255,255,0.06)" />
          {/* threshold lines */}
          {[40, 56, 92, 108].map((y, i) => (
            <line
              key={i}
              x1={12}
              y1={y}
              x2={288}
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeDasharray="2 4"
            />
          ))}
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={1.2}
            filter={`url(#${filter})`}
          />
        </g>
      );
    }
    if (kind === "data") {
      // Bar chart
      const bars = 18;
      const w = (276 / bars) * 0.7;
      const gap = 276 / bars;
      return (
        <g>
          {Array.from({ length: bars }).map((_, i) => {
            const h = 12 + r() * 70;
            const x = 12 + i * gap;
            const y = 110 - h;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={1}
                fill={`rgba(34,211,238,${0.45 + r() * 0.4})`}
              />
            );
          })}
        </g>
      );
    }
    if (kind === "ui") {
      // Faux UI: window with bars
      return (
        <g>
          <rect x={28} y={24} width={244} height={88} rx={6} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <circle cx={36} cy={32} r={2} fill="#ff5f56" />
          <circle cx={42} cy={32} r={2} fill="#ffbd2e" />
          <circle cx={48} cy={32} r={2} fill="#27c93f" />
          <rect x={36} y={42} width={120} height={6} rx={1} fill="rgba(34,211,238,0.55)" />
          <rect x={36} y={54} width={180} height={3} rx={1} fill="rgba(255,255,255,0.16)" />
          <rect x={36} y={62} width={150} height={3} rx={1} fill="rgba(255,255,255,0.10)" />
          <rect x={36} y={70} width={170} height={3} rx={1} fill="rgba(255,255,255,0.10)" />
          <rect x={36} y={86} width={50} height={14} rx={2} fill="rgba(34,211,238,0.85)" />
          <rect x={92} y={86} width={50} height={14} rx={2} fill="rgba(255,255,255,0.10)" />
        </g>
      );
    }
    if (kind === "web") {
      // Layered cards / browser windows
      return (
        <g>
          <rect x={20} y={32} width={176} height={70} rx={5} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
          <rect x={48} y={42} width={176} height={70} rx={5} fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.30)" />
          <rect x={76} y={52} width={176} height={70} rx={5} fill="rgba(57,255,122,0.05)" stroke="rgba(57,255,122,0.25)" />
          <line x1={20} y1={48} x2={196} y2={48} stroke="rgba(255,255,255,0.08)" />
          <line x1={48} y1={58} x2={224} y2={58} stroke="rgba(34,211,238,0.18)" />
          <line x1={76} y1={68} x2={252} y2={68} stroke="rgba(57,255,122,0.2)" />
        </g>
      );
    }
    // default: dotted constellation
    const dots: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 60; i++) {
      dots.push({ x: r() * 300, y: r() * 134, r: 0.6 + r() * 1.6 });
    }
    return (
      <g>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#67e8f9" opacity={0.4 + r() * 0.5} />
        ))}
      </g>
    );
  })();

  return (
    <div
      className={
        "relative aspect-[300/134] w-full overflow-hidden rounded-lg border border-line/[0.07] bg-ink-900/40 " +
        (className ?? "")
      }
    >
      <svg viewBox="0 0 300 134" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a0d13" />
            <stop offset="60%" stopColor="#0f131c" />
            <stop offset="100%" stopColor="#091016" />
          </linearGradient>
          <filter id={filter} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <pattern id={mask} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="transparent" />
            <circle cx="0.5" cy="0.5" r="0.45" fill="rgba(255,255,255,0.05)" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="300" height="134" fill={`url(#${grad})`} />
        <rect width="300" height="134" fill={`url(#${mask})`} />

        {/* Faint horizon glow */}
        <ellipse cx="150" cy="160" rx="200" ry="60" fill="rgba(34,211,238,0.10)" />

        {/* Kind-specific art */}
        {overlay}

        {/* Bottom info bar */}
        <rect x="0" y="116" width="300" height="18" fill="rgba(0,0,0,0.4)" />
        <text
          x="10"
          y="128"
          fill="#67e8f9"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="8"
        >
          {`./${kind}/${slug}`}
        </text>
        <text
          x="290"
          y="128"
          textAnchor="end"
          fill="#8d95a8"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="8"
        >
          v1
        </text>

        {/* Big monogram in faint type for personality */}
        <text
          x="288"
          y="34"
          textAnchor="end"
          fill="rgba(255,255,255,0.06)"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="24"
          fontWeight="bold"
        >
          {monogram}
        </text>
      </svg>

      {/* CRT scanlines on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Soft inner highlight, top-left → bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 30%), linear-gradient(315deg, rgba(0,0,0,0.5), rgba(0,0,0,0) 30%)",
        }}
      />
    </div>
  );
}
