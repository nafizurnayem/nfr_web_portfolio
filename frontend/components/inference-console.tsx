"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { identity } from "@/lib/identity";

/**
 * An animated console that plays back a realistic model-training and inference
 * session. It replaces the generic shell terminal: instead of `whoami` and
 * `ls`, it shows checkpoint loading, tensor shapes, epoch metrics, and a
 * softmax output -- the things a reviewer from an ML team actually recognises.
 *
 * The transcript is fictional but internally consistent: the reported accuracy,
 * class count, and tensor shapes all match the potato-disease classifier that
 * is the portfolio's lead project.
 */

export type ConsoleLine = {
  prompt: "$" | ">>>";
  cmd: string;
  out?: string[];
};

/** Inline markup tags: {cyan:…} {green:…} {violet:…} {warn:…} {dim:…} */
const DEFAULT_SCRIPT: ConsoleLine[] = [
  {
    prompt: "$",
    cmd: "python -m vision.infer --checkpoint leafnet-v3.pt",
    out: [
      "{dim:[00:00]} loading checkpoint {cyan:leafnet-v3.pt} {dim:(18.4 MB)}",
      "{dim:[00:01]} device = {violet:cuda:0} · precision = {violet:float32}",
      "{green:✓} model ready — {violet:2,318,915} parameters",
    ],
  },
  {
    prompt: ">>>",
    cmd: "model.summary()",
    out: [
      "input          {violet:[1, 3, 224, 224]}",
      "conv_block_1   {violet:[1, 32, 112, 112]}   {dim:896 params}",
      "conv_block_2   {violet:[1, 64,  56,  56]}   {dim:18,496 params}",
      "conv_block_3   {violet:[1, 128, 28,  28]}   {dim:73,856 params}",
      "global_pool    {violet:[1, 128]}",
      "classifier     {violet:[1, 7]}              {dim:903 params}",
    ],
  },
  {
    prompt: ">>>",
    cmd: "trainer.fit(epochs=30)",
    out: [
      "epoch 10/30  loss {cyan:0.284}  val_acc {green:0.912}  {dim:───────░░░}",
      "epoch 20/30  loss {cyan:0.121}  val_acc {green:0.958}  {dim:████████░░}",
      "epoch 30/30  loss {cyan:0.067}  val_acc {green:0.974}  {dim:██████████}",
      "{green:✓} best checkpoint saved — val_acc {green:0.974}",
    ],
  },
  {
    prompt: ">>>",
    cmd: 'predict("field_sample_014.jpg")',
    out: [
      "preprocess → resize(224) → normalize(imagenet)",
      "{green:Potato — Late Blight}      {green:0.964}  {dim:████████████████░}",
      "Potato — Early Blight     {cyan:0.021}  {dim:▌}",
      "Healthy Leaf              {dim:0.009}",
      "{dim:inference time: 31 ms · batch size: 1}",
    ],
  },
  {
    prompt: "$",
    cmd: "curl -s localhost:8000/api/health",
    out: [
      '{dim:{} "status": {green:"ok"}, "database": {green:"up"} {dim:}}',
      "{green:✓} serving {cyan:16} projects · {cyan:54} tracked skills",
    ],
  },
];

const USER = identity.name.split(" ").pop()?.toLowerCase() || "nayem";

const TAG_CLASSES: Record<string, string> = {
  cyan: "text-accent-soft",
  green: "text-accent-green",
  violet: "text-accent-violet",
  warn: "text-accent-amber",
  dim: "text-ink-300",
};

function renderInline(text: string, key: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /\{(cyan|green|violet|warn|dim):([^}]*)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <span key={`${key}-${i++}`} className={TAG_CLASSES[match[1]]}>
        {match[2]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {["#ff5f56", "#ffbd2e", "#27c93f"].map((colour) => (
        <span
          key={colour}
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: colour,
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.35)",
          }}
        />
      ))}
    </div>
  );
}

export function InferenceConsole({
  script = DEFAULT_SCRIPT,
  host = "leafnet",
  status = "val_acc 0.974 · f1 0.968",
  className,
}: {
  /** Transcript to play. Changing it restarts the animation from the top. */
  script?: ConsoleLine[];
  /** Shown in the title bar after the username. */
  host?: string;
  /** Right-hand text in the status bar. */
  status?: string;
  className?: string;
} = {}) {
  const [executed, setExecuted] = useState<{ line: ConsoleLine; out: string[] }[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"typing" | "running" | "output" | "done">("typing");
  const [typed, setTyped] = useState("");
  const [outIdx, setOutIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = script[step];

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Selecting a different capability swaps the transcript; reset so the new
  // one types from the beginning rather than resuming mid-way.
  useEffect(() => {
    setExecuted([]);
    setStep(0);
    setTyped("");
    setOutIdx(0);
    setPhase("typing");
  }, [script]);

  // With reduced motion we skip the animation and show the finished transcript.
  useEffect(() => {
    if (!reduceMotion) return;
    setExecuted(script.map((line) => ({ line, out: line.out ?? [] })));
    setStep(script.length);
    setPhase("done");
  }, [reduceMotion, script]);

  useEffect(() => {
    if (reduceMotion) return;
    if (!current) {
      setPhase("done");
      return;
    }
    if (phase === "typing") {
      if (typed.length < current.cmd.length) {
        const timer = setTimeout(
          () => setTyped(current.cmd.slice(0, typed.length + 1)),
          12 + Math.random() * 22
        );
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setPhase("running"), 240);
      return () => clearTimeout(timer);
    }
    if (phase === "running") {
      const timer = setTimeout(() => setPhase("output"), 260);
      return () => clearTimeout(timer);
    }
    if (phase === "output") {
      const max = current.out?.length ?? 0;
      if (outIdx < max) {
        const timer = setTimeout(() => setOutIdx((i) => i + 1), 110);
        return () => clearTimeout(timer);
      }
      setExecuted((prev) => [...prev, { line: current, out: current.out ?? [] }]);
      setTyped("");
      setOutIdx(0);
      setPhase("typing");
      setStep((s) => s + 1);
    }
  }, [phase, typed, outIdx, current, reduceMotion]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executed, typed, outIdx]);

  const lineCount = useMemo(() => {
    let n = executed.reduce((acc, e) => acc + 1 + e.out.length, 0);
    if (current && phase !== "done") n += 1 + outIdx;
    return n;
  }, [executed, current, phase, outIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`model-card overflow-hidden font-mono shadow-glow-cyan ${className ?? ""}`}
    >
      {/* Title bar */}
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 border-b border-line/10 bg-surface/[0.04] px-4 py-2.5">
        <TrafficLights />
        <div className="flex min-w-0 items-center justify-center gap-1.5 truncate text-[11px] text-ink-200">
          <span className="text-accent-green">{USER}</span>
          <span className="text-ink-400">@</span>
          <span className="text-accent-soft">{host}</span>
          <span className="hidden text-ink-300 sm:inline">— inference session</span>
        </div>
        <span className="shrink-0 text-[11px] text-ink-300">py3.11</span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="scrollbar-thin relative max-h-[300px] min-h-[240px] space-y-1 overflow-auto p-3.5 text-[11.5px] leading-relaxed sm:max-h-[380px] sm:min-h-[300px] sm:p-5 sm:text-[12.5px]"
        role="log"
        aria-live="off"
        aria-label="Simulated model training and inference session"
      >
        {executed.map((entry, i) => (
          <div key={`done-${i}`} className="mb-2">
            <PromptLine prompt={entry.line.prompt} text={entry.line.cmd} caret={false} />
            {entry.out.map((line, j) => (
              <div key={`out-${i}-${j}`} className="whitespace-pre pl-4 text-ink-100">
                {renderInline(line, `out-${i}-${j}`)}
              </div>
            ))}
          </div>
        ))}

        {current && phase !== "done" && (
          <div className="mb-2">
            <PromptLine
              prompt={current.prompt}
              text={typed}
              caret={phase === "typing"}
            />
            {phase === "running" && (
              <div className="flex items-center gap-2 pl-4 text-ink-300">
                <span className="status-dot animate-pulse bg-accent" />
                <span>running…</span>
              </div>
            )}
            {phase === "output" &&
              current.out?.slice(0, outIdx).map((line, j) => (
                <div key={`live-${j}`} className="whitespace-pre pl-4 text-ink-100">
                  {renderInline(line, `live-${j}`)}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 border-t border-line/10 bg-ink-950/60 px-3 py-2 text-[11px] text-ink-300 sm:px-4">
        <div className="flex items-center gap-2">
          <span
            className="status-dot bg-accent-green"
            style={{ boxShadow: "0 0 8px rgba(74,222,128,0.8)" }}
          />
          <span className="text-ink-200">gpu ready</span>
        </div>
        <div className="truncate text-center">{status}</div>
        <div className="tabular text-right">L{lineCount}</div>
      </div>
    </motion.div>
  );
}

function PromptLine({
  prompt,
  text,
  caret,
}: {
  prompt: string;
  text: string;
  caret: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={
          prompt === "$" ? "select-none text-accent" : "select-none text-accent-violet"
        }
      >
        {prompt}
      </span>
      <span className="whitespace-pre text-ink-50">
        {text}
        {caret && (
          <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-blink-caret bg-accent align-[-1px]" />
        )}
      </span>
    </div>
  );
}
