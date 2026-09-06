"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { identity } from "@/lib/identity";

type Line = {
  prompt: "$" | ">" | "✓" | "ⓘ" | "→";
  cmd: string;
  /** Output lines printed after the command "runs". Strings can include
   * inline markup using {green:text}, {cyan:text}, {dim:text}, {warn:text}. */
  out?: string[];
  /** Working directory shown in the prompt for this line. */
  cwd?: string;
  /** Override delay before this line begins (ms). */
  delay?: number;
};

const HOST = `${identity.name.toLowerCase().replace(/\s+/g, "-")}.dev`;
const USER = identity.name.split(" ")[0]?.toLowerCase() || "you";

const SCRIPT: Line[] = [
  {
    prompt: "$",
    cmd: "whoami",
    cwd: "~",
    out: [`{cyan:${identity.name}} — {dim:${identity.title}}`],
  },
  {
    prompt: "$",
    cmd: "cat manifest.toml",
    cwd: "~",
    out: [
      "{dim:[identity]}",
      `name     = "${identity.name}"`,
      `location = "${identity.location}"`,
      "{dim:[focus]}",
      'areas    = ["ai/ml", "nlp", "llm", "robotics", "full-stack"]',
      'shipping = "{green:enabled}"',
    ],
  },
  {
    prompt: "$",
    cmd: "ls research/ | head",
    cwd: "~",
    out: [
      "{cyan:llm-fine-tuning/}",
      "{cyan:ai-content-detection/}",
      "{cyan:plant-disease-detector/}",
      "{cyan:line-following-robot/}",
      "{dim:…}",
    ],
  },
  {
    prompt: "$",
    cmd: "systemctl status portfolio.service",
    cwd: "~",
    out: [
      "● portfolio.service — Personal site",
      "   Loaded: {green:loaded} (linked; enabled)",
      "   Active: {green:active (running)} since today",
      "    Tasks: 7 (limit: 4915)",
      "   Memory: 42.0M",
    ],
  },
  {
    prompt: "$",
    cmd: "echo $READY",
    cwd: "~",
    out: ["{green:true} {dim:— scroll to continue}"],
  },
];

/** Inline markup → JSX. Tags supported: cyan, green, warn, dim. */
function renderInline(text: string, key: string) {
  const parts: React.ReactNode[] = [];
  const re = /\{(cyan|green|warn|dim):([^}]+)\}/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    const [_, tag, body] = m;
    const cls = {
      cyan: "text-accent-soft",
      green: "text-accent-green",
      warn: "text-amber-300",
      dim: "text-ink-300",
    }[tag as "cyan" | "green" | "warn" | "dim"];
    parts.push(
      <span key={`${key}-${i++}`} className={cls}>
        {body}
      </span>
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function TrafficLights() {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="flex items-center gap-1.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {[
        { c: "#ff5f56", g: "#bf4943", glyph: "×" },
        { c: "#ffbd2e", g: "#bf8d24", glyph: "−" },
        { c: "#27c93f", g: "#1d962f", glyph: "+" },
      ].map((l, i) => (
        <span
          key={i}
          className="grid h-3 w-3 place-items-center rounded-full text-[8px] font-bold leading-none"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${l.c}, ${l.g})`,
            color: "rgba(0,0,0,0.55)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <span className={hover ? "opacity-100" : "opacity-0"}>{l.glyph}</span>
        </span>
      ))}
    </div>
  );
}

export function TerminalHero() {
  const [executed, setExecuted] = useState<{ line: Line; out: string[] }[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"typing" | "running" | "output" | "done">(
    "typing"
  );
  const [typed, setTyped] = useState("");
  const [outIdx, setOutIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = SCRIPT[step];

  // Step machine: typing → running → printing output line by line → next line.
  useEffect(() => {
    if (!current) {
      setPhase("done");
      return;
    }
    if (phase === "typing") {
      if (typed.length < current.cmd.length) {
        const t = setTimeout(
          () => setTyped(current.cmd.slice(0, typed.length + 1)),
          14 + Math.random() * 28
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("running"), 220);
      return () => clearTimeout(t);
    }
    if (phase === "running") {
      const t = setTimeout(() => setPhase("output"), 180);
      return () => clearTimeout(t);
    }
    if (phase === "output") {
      const max = current.out?.length ?? 0;
      if (outIdx < max) {
        const t = setTimeout(() => setOutIdx((i) => i + 1), 70);
        return () => clearTimeout(t);
      }
      // Commit this line and move on.
      const finished = {
        line: { ...current, cmd: typed },
        out: current.out?.slice(0, max) ?? [],
      };
      setExecuted((prev) => [...prev, finished]);
      setTyped("");
      setOutIdx(0);
      setPhase("typing");
      setStep((s) => s + 1);
    }
  }, [phase, typed, outIdx, current]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executed, typed, outIdx]);

  const breadcrumb = useMemo(() => {
    const c = current?.cwd ?? "~";
    return c;
  }, [current]);

  const totalLines = useMemo(() => {
    let n = 0;
    executed.forEach((e) => (n += 1 + (e.out?.length ?? 0)));
    if (current && phase !== "done") n += 1 + outIdx;
    return n;
  }, [executed, current, phase, outIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal overflow-hidden"
    >
      {/* Title bar */}
      <div className="grid grid-cols-[auto,1fr,auto] items-center border-b border-line/10 bg-gradient-to-b from-surface/[0.07] to-transparent px-4 py-2.5">
        <TrafficLights />
        <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-ink-200">
          <span className="hidden sm:inline text-ink-300">{USER}@{HOST}</span>
          <span className="text-ink-400">:</span>
          <span className="text-accent-soft">{breadcrumb}</span>
          <span className="ml-1 text-ink-300">— zsh</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-300">
          <span className="hidden md:inline">utf-8</span>
          <span className="hidden md:inline">·</span>
          <span>80×24</span>
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="relative max-h-[360px] min-h-[280px] space-y-1 overflow-hidden p-4 sm:p-5 font-mono text-[13px] leading-relaxed scrollbar-thin"
      >
        {/* CRT scanline overlay (only over the body) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
            mixBlendMode: "overlay",
          }}
        />

        {executed.map((e, i) => (
          <div key={`done-${i}`}>
            <PromptLine line={e.line} text={e.line.cmd} caret={false} />
            {e.out?.map((line, j) => (
              <div key={`out-${i}-${j}`} className="pl-4 text-ink-100">
                {renderInline(line, `out-${i}-${j}`)}
              </div>
            ))}
          </div>
        ))}

        {current && phase !== "done" && (
          <div>
            <PromptLine line={current} text={typed} caret={phase === "typing"} />
            {phase === "running" && (
              <div className="pl-4 text-ink-300">
                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-accent" />
                <span className="ml-2">running…</span>
              </div>
            )}
            {phase === "output" &&
              current.out?.slice(0, outIdx).map((line, j) => (
                <div key={`live-out-${j}`} className="pl-4 text-ink-100">
                  {renderInline(line, `live-${j}`)}
                </div>
              ))}
          </div>
        )}
        {phase === "done" && (
          <div className="pl-4 text-ink-300">
            <span className="text-accent">›</span> session ready · {executed.length} commands ·{" "}
            <span className="text-accent-green">all checks passed</span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 border-t border-line/10 bg-ink-950/70 px-4 py-1.5 font-mono text-[10px] text-ink-300">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent-green"
            style={{ boxShadow: "0 0 8px rgba(74,222,128,0.8)" }}
          />
          <span className="text-ink-200">online</span>
        </div>
        <div className="truncate text-center">
          <span className="text-ink-300">main</span>
          <span className="mx-1.5 text-ink-400">•</span>
          <span>tsx · utf-8 · LF</span>
        </div>
        <div className="text-right tabular-nums">
          <span className="text-ink-200">L{totalLines}</span>
          <span className="mx-1 text-ink-400">·</span>
          <span>{phase}</span>
        </div>
      </div>
    </motion.div>
  );
}

function PromptLine({
  line,
  text,
  caret,
}: {
  line: Line;
  text: string;
  caret: boolean;
}) {
  const promptColor =
    line.prompt === "$"
      ? "text-accent"
      : line.prompt === ">"
      ? "text-accent-green"
      : line.prompt === "✓"
      ? "text-accent-green"
      : line.prompt === "ⓘ"
      ? "text-accent-soft"
      : "text-amber-300";
  return (
    <div className="flex items-baseline gap-2">
      <span className="select-none text-ink-300">
        <span className="text-accent-green">{USER}</span>
        <span className="text-ink-400">@</span>
        <span className="text-accent-soft">{HOST}</span>
        <span className="text-ink-400">:</span>
        <span className="text-amber-300">{line.cwd ?? "~"}</span>
      </span>
      <span className={promptColor}>{line.prompt}</span>
      <span className="text-ink-50">
        {text}
        {caret && (
          <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-blink-caret bg-accent align-[-1px]" />
        )}
      </span>
    </div>
  );
}
