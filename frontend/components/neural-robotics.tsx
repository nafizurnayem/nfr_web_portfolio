"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * "NeuralRobotics" — an ambient hero animation that visually maps to the
 * site's stated skills (deep learning, NLP/LLM, robotics).
 *
 * What it draws each frame:
 *   1. Trail-fade overlay so motion leaves a soft comet tail.
 *   2. A faint dot grid (background texture).
 *   3. A 3-segment articulated robot arm rooted at the bottom-left,
 *      driven by 3 phase-offset sine waves.
 *   4. A 4-layer fully-connected neural network (4-6-6-3 nodes) on the right
 *      with bright pulses constantly traveling along random edges. When a
 *      pulse arrives at a node, that node flashes and decays.
 *
 * Keeping it cheap:
 *   - Pure 2D canvas (no WebGL, no DOM nodes).
 *   - One requestAnimationFrame loop, decays node flash by *0.93/frame.
 *   - Caps DPR at 2 to stay sane on retina displays.
 *   - Honors prefers-reduced-motion (renders a single static frame).
 */

type NNNode = {
  x: number;
  y: number;
  r: number;
  flash: number; // 0..1, decays each frame after a pulse arrives
  layer: number;
};

type NNEdge = {
  a: number;
  b: number;
  weight: number; // affects line tint
};

type NNPulse = {
  edge: number;
  t: number; // progress 0..1 along edge
  speed: number;
  hot: boolean; // green vs cyan
};

const PALETTE = {
  ink: "#05070b",
  edge: "rgba(103, 232, 249, 0.10)",
  edgeHot: "rgba(103, 232, 249, 0.22)",
  node: "rgba(241, 251, 255, 0.7)",
  nodeRing: "rgba(34, 211, 238, 0.85)",
  pulse: "rgba(241, 251, 255, 0.95)",
  pulseHot: "rgba(57, 255, 122, 0.95)",
  arm: "rgba(34, 211, 238, 0.55)",
  armCore: "rgba(241, 251, 255, 0.5)",
  armFill: "rgba(57, 255, 122, 0.18)",
  joint: "rgba(241, 251, 255, 0.85)",
  gripper: "rgba(57, 255, 122, 0.85)",
  grid: "rgba(103, 232, 249, 0.06)",
  label: "rgba(103, 232, 249, 0.45)",
  trail: "rgba(5, 7, 11, 0.20)",
};

const LAYERS = [4, 6, 6, 3];
const LAYER_NAMES = ["input", "hidden", "hidden", "output"];

export function NeuralRobotics({ className }: { className?: string }) {
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
    let nodes: NNNode[] = [];
    let edges: NNEdge[] = [];
    let pulses: NNPulse[] = [];
    let lastSpawn = 0;
    const t0 = performance.now();

    function buildNetwork() {
      nodes = [];
      edges = [];
      pulses = [];

      // Reserve the left ~30% for the robot arm, place the network on the right.
      const padL = W * 0.32;
      const padR = W * 0.06;
      const padY = Math.max(28, H * 0.16);
      const innerW = Math.max(40, W - padL - padR);
      const innerH = Math.max(40, H - padY * 2);

      const layerStart: number[] = [];
      LAYERS.forEach((count, li) => {
        layerStart.push(nodes.length);
        const x = padL + (innerW * li) / (LAYERS.length - 1);
        for (let i = 0; i < count; i++) {
          const y = padY + (innerH * (i + 0.5)) / count;
          nodes.push({
            x,
            y,
            r: li === 0 || li === LAYERS.length - 1 ? 5 : 4,
            flash: 0,
            layer: li,
          });
        }
      });

      for (let li = 0; li < LAYERS.length - 1; li++) {
        const aStart = layerStart[li];
        const aEnd = aStart + LAYERS[li];
        const bStart = layerStart[li + 1];
        const bEnd = bStart + LAYERS[li + 1];
        for (let a = aStart; a < aEnd; a++) {
          for (let b = bStart; b < bEnd; b++) {
            edges.push({ a, b, weight: 0.35 + Math.random() * 0.65 });
          }
        }
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNetwork();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function drawGrid() {
      const step = 32;
      ctx!.fillStyle = PALETTE.grid;
      for (let x = step; x < W; x += step) {
        for (let y = step; y < H; y += step) {
          ctx!.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }
    }

    function drawRobotArm(t: number) {
      const baseX = W * 0.12;
      const baseY = H * 0.78;
      const scale = Math.min(W, H);
      const len = [scale * 0.16, scale * 0.13, scale * 0.08];

      // Phase-offset oscillators give the arm a "looking around / scanning" feel.
      const a1 = -1.15 + Math.sin(t * 0.55) * 0.32;
      const a2 = a1 + 0.85 + Math.sin(t * 0.42 + 1.1) * 0.45;
      const a3 = a2 + 0.7 + Math.sin(t * 0.33 + 2.4) * 0.55;

      const j1 = { x: baseX, y: baseY };
      const j2 = { x: j1.x + Math.cos(a1) * len[0], y: j1.y + Math.sin(a1) * len[0] };
      const j3 = { x: j2.x + Math.cos(a2) * len[1], y: j2.y + Math.sin(a2) * len[1] };
      const tip = { x: j3.x + Math.cos(a3) * len[2], y: j3.y + Math.sin(a3) * len[2] };

      // Base block
      ctx!.fillStyle = PALETTE.armFill;
      ctx!.fillRect(baseX - 22, baseY, 44, 16);
      ctx!.strokeStyle = PALETTE.arm;
      ctx!.lineWidth = 1.2;
      ctx!.strokeRect(baseX - 22, baseY, 44, 16);
      // Base ground line
      ctx!.beginPath();
      ctx!.moveTo(baseX - 60, baseY + 16);
      ctx!.lineTo(baseX + 60, baseY + 16);
      ctx!.strokeStyle = "rgba(34, 211, 238, 0.25)";
      ctx!.stroke();

      const segs: Array<[{ x: number; y: number }, { x: number; y: number }]> = [
        [j1, j2],
        [j2, j3],
        [j3, tip],
      ];
      ctx!.lineCap = "round";
      segs.forEach(([p, q], i) => {
        ctx!.lineWidth = 7 - i * 1.8;
        ctx!.strokeStyle = PALETTE.arm;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(q.x, q.y);
        ctx!.stroke();
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = PALETTE.armCore;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(q.x, q.y);
        ctx!.stroke();
      });

      [j1, j2, j3].forEach((j) => {
        ctx!.fillStyle = PALETTE.joint;
        ctx!.beginPath();
        ctx!.arc(j.x, j.y, 3, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Gripper
      const gripAngle = a3;
      const gripLen = 8;
      const gripSpread = 0.7 + Math.sin(t * 1.4) * 0.3;
      const gripA = gripAngle + gripSpread;
      const gripB = gripAngle - gripSpread;
      ctx!.strokeStyle = PALETTE.gripper;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(tip.x, tip.y);
      ctx!.lineTo(tip.x + Math.cos(gripA) * gripLen, tip.y + Math.sin(gripA) * gripLen);
      ctx!.moveTo(tip.x, tip.y);
      ctx!.lineTo(tip.x + Math.cos(gripB) * gripLen, tip.y + Math.sin(gripB) * gripLen);
      ctx!.stroke();
      ctx!.fillStyle = PALETTE.gripper;
      ctx!.beginPath();
      ctx!.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);
      ctx!.fill();

      // Label under base
      ctx!.font = "10px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace";
      ctx!.fillStyle = PALETTE.label;
      ctx!.textAlign = "center";
      ctx!.fillText("robot.arm", baseX, baseY + 30);
    }

    function drawNetwork(now: number) {
      // Edges (back layer of the network)
      ctx!.lineWidth = 1;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        ctx!.strokeStyle = e.weight > 0.85 ? PALETTE.edgeHot : PALETTE.edge;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      // Spawn pulses periodically
      if (edges.length > 0 && now - lastSpawn > 60 + Math.random() * 130) {
        lastSpawn = now;
        const e = Math.floor(Math.random() * edges.length);
        pulses.push({
          edge: e,
          t: 0,
          speed: 0.6 + Math.random() * 0.9,
          hot: Math.random() < 0.25,
        });
      }

      // Update + draw pulses
      pulses = pulses.filter((p) => {
        p.t += 0.016 * p.speed;
        const e = edges[p.edge];
        const a = nodes[e.a];
        const b = nodes[e.b];
        if (p.t >= 1) {
          nodes[e.b].flash = 1;
          return false;
        }
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        const tt = Math.max(0, p.t - 0.08);
        const tx = a.x + (b.x - a.x) * tt;
        const ty = a.y + (b.y - a.y) * tt;
        ctx!.strokeStyle = p.hot ? PALETTE.pulseHot : "rgba(103, 232, 249, 0.85)";
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.moveTo(tx, ty);
        ctx!.lineTo(px, py);
        ctx!.stroke();
        ctx!.fillStyle = p.hot ? PALETTE.pulseHot : PALETTE.pulse;
        ctx!.beginPath();
        ctx!.arc(px, py, 1.9, 0, Math.PI * 2);
        ctx!.fill();
        return true;
      });

      // Nodes (with halo + flash)
      for (const n of nodes) {
        n.flash *= 0.93;
        const haloR = (n.r + n.flash * 4) * 3.5;
        const grad = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
        grad.addColorStop(0, `rgba(103, 232, 249, ${0.35 + n.flash * 0.55})`);
        grad.addColorStop(1, "rgba(103, 232, 249, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, haloR, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = PALETTE.node;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.strokeStyle = PALETTE.nodeRing;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Layer labels above the topmost node of each layer.
      ctx!.font = "10px JetBrains Mono, ui-monospace, Menlo, Consolas, monospace";
      ctx!.textAlign = "center";
      ctx!.fillStyle = PALETTE.label;
      LAYERS.forEach((_count, li) => {
        const first = nodes.find((n) => n.layer === li);
        if (first) ctx!.fillText(LAYER_NAMES[li], first.x, first.y - 16);
      });
    }

    function frame(now: number) {
      const t = (now - t0) / 1000;

      ctx!.fillStyle = PALETTE.trail;
      ctx!.fillRect(0, 0, W, H);

      drawGrid();
      drawRobotArm(t);
      drawNetwork(now);

      rafRef.current = requestAnimationFrame(frame);
    }

    if (!reduced) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      // Single static composition for reduced-motion users.
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      drawRobotArm(0);
      drawNetwork(0);
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
