"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * "AudioWaveform" — an ambient hero animation that reads as an NLP / speech
 * processing rig.
 *
 * Composition each frame:
 *   1. Translucent black trail-fade.
 *   2. Faint horizontal oscilloscope grid.
 *   3. A scrolling waveform line (top 40%) computed from a sum of sine waves
 *      to feel like a real signal — drawn twice (glow pass + sharp pass).
 *   4. A frequency-spectrum bar graph (bottom 40%) with smoothed amplitudes,
 *      gradient fills (cyan → soft cyan → green), and bright top caps.
 *   5. NLP-themed HUD chips that fade in/out at random positions:
 *      `transcribing…`, `tokens: 1,247 / 8,192`, `asr: whisper-large-v3`, etc.
 *   6. A blinking REC dot, a millisecond timer, and a small frequency scale.
 *
 * Cheap: pure 2D canvas, one rAF loop, smoothed bar amplitudes via single-pole
 * IIR (current + 0.20 * (target - current)). Honors prefers-reduced-motion.
 */

const PALETTE = {
  ink: "#05070b",
  trail: "rgba(5, 7, 11, 0.20)",
  grid: "rgba(103, 232, 249, 0.06)",
  centerline: "rgba(103, 232, 249, 0.18)",
  waveform: "rgba(103, 232, 249, 0.90)",
  waveformGlow: "rgba(34, 211, 238, 0.45)",
  barLow: "rgba(34, 211, 238, 0.85)",
  barMid: "rgba(103, 232, 249, 0.90)",
  barHi: "rgba(57, 255, 122, 0.95)",
  barCap: "rgba(241, 251, 255, 0.85)",
  label: "rgba(103, 232, 249, 0.65)",
  labelDim: "rgba(103, 232, 249, 0.30)",
  rec: "#ff5f56",
  recDim: "rgba(255, 95, 86, 0.30)",
} as const;

const WAVE_RES = 220;

const HUD_LABELS = [
  "transcribing…",
  "lang: en",
  "tokens: 1,247 / 8,192",
  "wpm: 142",
  "asr: whisper-large-v3",
  "embedding dim: 1536",
  "vad: active",
  "snr: 27 db",
  "model: gemma-3-9b",
  "cosine: 0.87",
  "intent: query",
  "rms: -18 db",
  "sample rate: 16 kHz",
  "▶ stream",
];

const FREQ_TICKS = ["80 Hz", "250 Hz", "1 kHz", "4 kHz", "16 kHz"];

type Bar = { amp: number; target: number };
type HudLabel = {
  text: string;
  x: number;
  y: number;
  spawnedAt: number;
  duration: number;
};

export function AudioWaveform({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0;
    let H = 0;
    let bars: Bar[] = [];
    const wave = new Float32Array(WAVE_RES);
    let labels: HudLabel[] = [];
    let lastLabelMs = 0;
    const t0 = performance.now();

    function build() {
      // Adaptive bar count: ~1 bar per 12px of width, clamped to a sane range.
      const count = Math.max(40, Math.min(120, Math.floor(W / 12)));
      bars = new Array(count).fill(null).map(() => ({ amp: 0, target: 0 }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Synthetic spectrum: more energy in low frequencies (like real speech),
    // overlapping harmonics, and an occasional "beat" so the bars don't feel
    // perfectly periodic.
    function spectrumTarget(t: number, i: number, n: number) {
      const f = i / n;
      const lowBoost = Math.exp(-f * 1.8);
      const a = Math.sin(t * 1.4 + i * 0.32) * 0.5 + 0.5;
      const b = Math.sin(t * 0.7 - i * 0.21 + 1.5) * 0.5 + 0.5;
      const c = Math.sin(t * 2.7 + i * 0.05 + 2.1) * 0.5 + 0.5;
      const beat = Math.max(0, Math.sin(t * 1.5 + i * 0.5) ** 6);
      const noise = Math.random() * 0.08;
      return Math.min(
        1,
        lowBoost * (0.45 * a + 0.30 * b + 0.20 * c) + 0.4 * beat * lowBoost + noise,
      );
    }

    function drawGrid() {
      ctx!.strokeStyle = PALETTE.grid;
      ctx!.lineWidth = 1;
      const lines = 8;
      for (let i = 1; i < lines; i++) {
        const y = (H * i) / lines;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(W, y);
        ctx!.stroke();
      }
    }

    function drawWaveform(t: number) {
      const waveTop = H * 0.10;
      const waveBottom = H * 0.45;
      const waveHeight = waveBottom - waveTop;
      const cy = (waveTop + waveBottom) / 2;

      for (let i = 0; i < WAVE_RES; i++) {
        const x = (i / WAVE_RES) * 8;
        const v =
          Math.sin(t * 2.2 + x * 7.1) * 0.35 +
          Math.sin(t * 1.3 + x * 3.4 + 1.1) * 0.25 +
          Math.sin(t * 4.1 + x * 14 + 0.5) * 0.15 +
          Math.sin(t * 0.8 - x * 5.6 + 2.3) * 0.20 +
          (Math.random() - 0.5) * 0.05;
        wave[i] = v;
      }

      // Center reference line (dashed, very dim).
      ctx!.strokeStyle = PALETTE.centerline;
      ctx!.lineWidth = 0.5;
      ctx!.setLineDash([4, 6]);
      ctx!.beginPath();
      ctx!.moveTo(0, cy);
      ctx!.lineTo(W, cy);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Glow pass (thick, soft).
      ctx!.strokeStyle = PALETTE.waveformGlow;
      ctx!.lineWidth = 4;
      ctx!.lineJoin = "round";
      ctx!.beginPath();
      for (let i = 0; i < WAVE_RES; i++) {
        const x = (i / (WAVE_RES - 1)) * W;
        const y = cy + wave[i] * waveHeight * 0.45;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // Sharp pass (thin, bright).
      ctx!.strokeStyle = PALETTE.waveform;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      for (let i = 0; i < WAVE_RES; i++) {
        const x = (i / (WAVE_RES - 1)) * W;
        const y = cy + wave[i] * waveHeight * 0.45;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // "Now" cursor: a vertical line on the right edge with a bright dot.
      const lastX = W;
      const lastY = cy + wave[WAVE_RES - 1] * waveHeight * 0.45;
      ctx!.strokeStyle = "rgba(57, 255, 122, 0.55)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(lastX - 1, waveTop);
      ctx!.lineTo(lastX - 1, waveBottom);
      ctx!.stroke();
      ctx!.fillStyle = "rgba(57, 255, 122, 1)";
      ctx!.beginPath();
      ctx!.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawSpectrum(t: number) {
      const top = H * 0.55;
      const bottom = H * 0.92;
      const barAreaH = bottom - top;
      const n = bars.length;
      const totalGap = W * 0.02;
      const gap = totalGap / n;
      const barW = (W - totalGap) / n;

      // Reusable gradient — created once, since x is constant for vertical bars.
      const grad = ctx!.createLinearGradient(0, bottom, 0, top);
      grad.addColorStop(0, PALETTE.barLow);
      grad.addColorStop(0.6, PALETTE.barMid);
      grad.addColorStop(1, PALETTE.barHi);

      for (let i = 0; i < n; i++) {
        bars[i].target = spectrumTarget(t, i, n);
        bars[i].amp += (bars[i].target - bars[i].amp) * 0.20;
        const h = bars[i].amp * barAreaH;
        const x = i * (barW + gap);
        const y = bottom - h;
        ctx!.fillStyle = grad;
        ctx!.fillRect(x, y, barW, h);
        ctx!.fillStyle = PALETTE.barCap;
        ctx!.fillRect(x, y - 2, barW, 2);
      }

      // Soft fade-to-ink at the bottom edge for a "polished pro audio" feel.
      const refl = ctx!.createLinearGradient(0, bottom, 0, bottom + 28);
      refl.addColorStop(0, "rgba(5, 7, 11, 0)");
      refl.addColorStop(1, "rgba(5, 7, 11, 1)");
      ctx!.fillStyle = refl;
      ctx!.fillRect(0, bottom, W, 28);
    }

    function drawHud(t: number) {
      ctx!.font =
        "10px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace";
      ctx!.textBaseline = "middle";

      // Blinking REC dot top-left.
      const recOn = Math.floor(t * 1.6) % 2 === 0;
      ctx!.fillStyle = recOn ? PALETTE.rec : PALETTE.recDim;
      ctx!.beginPath();
      ctx!.arc(18, 18, 4, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = PALETTE.label;
      ctx!.textAlign = "left";
      ctx!.fillText("REC", 28, 18);

      // Centisecond timer top-right.
      const total = Math.floor(t);
      const mm = String(Math.floor(total / 60)).padStart(2, "0");
      const ss = String(total % 60).padStart(2, "0");
      const cs = String(Math.floor((t * 100) % 100)).padStart(2, "0");
      ctx!.textAlign = "right";
      ctx!.fillStyle = "rgba(103, 232, 249, 0.65)";
      ctx!.fillText(`${mm}:${ss}.${cs}`, W - 14, 18);

      // Frequency scale ticks under the spectrum.
      ctx!.textAlign = "center";
      ctx!.fillStyle = PALETTE.labelDim;
      ctx!.textBaseline = "bottom";
      FREQ_TICKS.forEach((l, i) => {
        const x = (W * (i + 0.5)) / FREQ_TICKS.length;
        ctx!.fillText(l, x, H - 6);
      });
    }

    function drawLabels(t: number) {
      const nowMs = t * 1000;
      if (nowMs - lastLabelMs > 1100) {
        lastLabelMs = nowMs;
        const text = HUD_LABELS[Math.floor(Math.random() * HUD_LABELS.length)];
        labels.push({
          text,
          x: 40 + Math.random() * Math.max(40, W - 240),
          y: 40 + Math.random() * (H * 0.40),
          spawnedAt: t,
          duration: 2.6,
        });
      }
      ctx!.font =
        "11px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace";
      ctx!.textBaseline = "alphabetic";
      ctx!.textAlign = "left";
      labels = labels.filter((l) => {
        const age = t - l.spawnedAt;
        if (age > l.duration) return false;
        let alpha = 1;
        if (age < 0.4) alpha = age / 0.4;
        else if (age > l.duration - 0.4) alpha = (l.duration - age) / 0.4;
        ctx!.fillStyle = `rgba(103, 232, 249, ${0.7 * alpha})`;
        ctx!.fillText(`▸ ${l.text}`, l.x, l.y);
        return true;
      });
    }

    function frame(now: number) {
      const t = (now - t0) / 1000;
      ctx!.fillStyle = PALETTE.trail;
      ctx!.fillRect(0, 0, W, H);
      drawGrid();
      drawWaveform(t);
      drawSpectrum(t);
      drawLabels(t);
      drawHud(t);
      rafRef.current = requestAnimationFrame(frame);
    }

    if (!reduced) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      drawWaveform(0);
      drawSpectrum(0);
      drawHud(0);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-full w-full", className)}
    />
  );
}
