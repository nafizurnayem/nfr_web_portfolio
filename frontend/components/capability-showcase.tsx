"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InferenceConsole, type ConsoleLine } from "@/components/inference-console";
import { cn } from "@/lib/cn";

/**
 * "What I can build for you" — capabilities on one side, a live terminal on the
 * other, wired together: selecting a capability replays the console with that
 * discipline's own session.
 *
 * Implemented as a real tablist rather than a set of styled divs, so keyboard
 * users get arrow-key navigation and screen readers are told which panel each
 * tab controls. The console is the single tabpanel.
 *
 * Inline markup in the transcripts: {cyan:…} {green:…} {violet:…} {dim:…}
 */

type Accent = "cyan" | "violet" | "green";
type IconName = "vision" | "llm" | "stack";

type Capability = {
  id: string;
  label: string;
  title: string;
  body: string;
  items: string[];
  icon: IconName;
  accent: Accent;
  host: string;
  status: string;
  script: ConsoleLine[];
};

const ACCENTS: Record<Accent, { text: string; ring: string; dot: string; edge: string }> = {
  cyan: {
    text: "text-accent",
    ring: "border-accent/40 bg-accent/[0.08]",
    dot: "bg-accent",
    edge: "before:bg-accent",
  },
  violet: {
    text: "text-accent-violet",
    ring: "border-accent-violet/40 bg-accent-violet/[0.08]",
    dot: "bg-accent-violet",
    edge: "before:bg-accent-violet",
  },
  green: {
    text: "text-accent-green",
    ring: "border-accent-green/40 bg-accent-green/[0.08]",
    dot: "bg-accent-green",
    edge: "before:bg-accent-green",
  },
};

const CAPABILITIES: Capability[] = [
  {
    id: "vision",
    label: "Computer vision",
    title: "Computer vision systems",
    body: "Custom CNNs, OpenCV pipelines, detection and segmentation. I train the model, measure it honestly, and wrap it in an API you can actually call.",
    items: [
      "Image classification & detection",
      "OpenCV preprocessing pipelines",
      "Model evaluation & error analysis",
    ],
    icon: "vision",
    accent: "cyan",
    host: "leafnet",
    status: "val_acc 0.974 · f1 0.968",
    script: [
      {
        prompt: "$",
        cmd: "python -m vision.train --config leafnet.yaml",
        out: [
          "{dim:[00:00]} dataset {cyan:plantvillage/potato} · {violet:2,152} images",
          "{dim:[00:01]} augment  flip · rotate15 · colour-jitter",
          "{green:✓} model built — {violet:2,318,915} parameters",
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
          "{green:Potato — Late Blight}      {green:0.964}  {dim:████████████████░}",
          "Potato — Early Blight     {cyan:0.021}  {dim:▌}",
          "Healthy Leaf              {dim:0.009}",
          "{dim:inference: 31 ms · batch size 1}",
        ],
      },
    ],
  },
  {
    id: "llm",
    label: "NLP & LLM",
    title: "NLP & LLM applications",
    body: "Retrieval, extraction, and assistant features built on hosted models — with the prompt work, evaluation, and guardrails that keep output reliable.",
    items: [
      "Document understanding & OCR repair",
      "Retrieval-augmented answering",
      "Structured extraction from text",
    ],
    icon: "llm",
    accent: "violet",
    host: "docpipe",
    status: "42 docs · 0 schema failures",
    script: [
      {
        prompt: "$",
        cmd: "python -m docpipe.run --in scans/ --schema invoice.json",
        out: [
          "{dim:[00:00]} loaded {violet:42} scans · {violet:118} pages",
          "{dim:[00:01]} preprocess: deskew · dewarp · denoise",
          "{green:✓} pipeline ready",
        ],
      },
      {
        prompt: ">>>",
        cmd: "pipeline.stages",
        out: [
          "1. {cyan:opencv}   perspective correction + adaptive threshold",
          "2. {cyan:ocr}      raw character recognition",
          "3. {violet:llm}      context repair + field extraction",
          "4. {cyan:validate} schema check, retry on failure",
        ],
      },
      {
        prompt: ">>>",
        cmd: 'extract("invoice_0042.png")',
        out: [
          'raw   {dim:Total: 1,4Z0.O0}   {warn:← 3 character errors}',
          'fixed {green:Total: 1,420.00}  {dim:repaired from context}',
          '{green:✓} {{ "vendor": "Acme Ltd", "total": 1420.00 }}',
        ],
      },
      {
        prompt: ">>>",
        cmd: "report()",
        out: [
          "extracted     {green:42/42} documents",
          "schema valid  {green:42/42} {dim:(0 retries needed)}",
          "{dim:mean latency 1.9 s/doc}",
        ],
      },
    ],
  },
  {
    id: "stack",
    label: "Full-stack",
    title: "Full-stack delivery",
    body: "FastAPI or Node on the back, Next.js on the front, with validation, rate limiting, and security headers in place from the first commit.",
    items: [
      "REST APIs with typed schemas",
      "Next.js / React interfaces",
      "Embedded & IoT integrations",
    ],
    icon: "stack",
    accent: "green",
    host: "api",
    status: "all checks passing",
    script: [
      {
        prompt: "$",
        cmd: "uvicorn app.main:app --host 0.0.0.0 --port 8000",
        out: [
          "{dim:[00:00]} tables created · seed data applied",
          "{dim:[00:01]} CORS locked to {cyan:https://your-domain.com}",
          "{green:✓} serving {cyan:16} projects · {cyan:54} skills",
        ],
      },
      {
        prompt: "$",
        cmd: "curl -s localhost:8000/api/health/ready",
        out: ['{dim:{} "status": {green:"ok"}, "database": {green:"up"} {dim:}}'],
      },
      {
        prompt: "$",
        cmd: "curl -X POST /api/contact -d @bad-payload.json",
        out: [
          "{warn:422} field {cyan:email}    not a valid email address",
          "{warn:422} field {cyan:message}  min length 10",
          "{dim:submitted values are never echoed back}",
        ],
      },
      {
        prompt: "$",
        cmd: "for i in $(seq 1 6); do post /api/contact; done",
        out: [
          "1..5  {green:200 ok}",
          "6     {warn:429 rate limited}  {dim:5/min · 30/hour, per IP}",
          "{green:✓} validation · limits · headers all enforced",
        ],
      },
    ],
  },
];

function Icon({ name, className }: { name: IconName; className?: string }) {
  const shared = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  if (name === "vision") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v5.8M21 12h-5.8M12 21v-5.8M3 12h5.8" />
      </svg>
    );
  }
  if (name === "llm") {
    return (
      <svg {...shared}>
        <circle cx="6" cy="7" r="2.2" />
        <circle cx="6" cy="17" r="2.2" />
        <circle cx="18" cy="12" r="2.2" />
        <path d="M8.1 8.2 15.9 11M8.1 15.8 15.9 13" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <path d="M12 3 21 7.5 12 12 3 7.5 12 3Z" />
      <path d="M3 12.2 12 16.7l9-4.5" />
      <path d="M3 16.7 12 21.2l9-4.5" />
    </svg>
  );
}

export function CapabilityShowcase() {
  const [activeId, setActiveId] = useState(CAPABILITIES[0].id);
  const activeIndex = CAPABILITIES.findIndex((c) => c.id === activeId);
  const active = CAPABILITIES[activeIndex];

  /** Left/right arrows move between tabs, as expected of a tablist. */
  function onKeyDown(event: React.KeyboardEvent) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const last = CAPABILITIES.length - 1;
    let next = activeIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = activeIndex >= last ? 0 : activeIndex + 1;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = activeIndex <= 0 ? last : activeIndex - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    setActiveId(CAPABILITIES[next].id);
    document.getElementById(`cap-tab-${CAPABILITIES[next].id}`)?.focus();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr,1.08fr] lg:items-start">
      {/* ── What I build ─────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Capabilities"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex flex-col gap-2.5"
      >
        {CAPABILITIES.map((capability, index) => {
          const selected = capability.id === activeId;
          const accent = ACCENTS[capability.accent];
          return (
            <button
              key={capability.id}
              id={`cap-tab-${capability.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="cap-console"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(capability.id)}
              className={cn(
                // A left edge bar marks the selection, so the active item is
                // not signalled by colour alone.
                "group relative w-full cursor-pointer overflow-hidden rounded-xl border p-4 text-left transition-colors duration-200",
                "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:transition-opacity before:duration-200",
                accent.edge,
                selected
                  ? cn("border-line/20 bg-surface/[0.08] before:opacity-100")
                  : "border-line/10 bg-surface/[0.03] before:opacity-0 hover:border-line/20 hover:bg-surface/[0.06]"
              )}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                    selected ? accent.ring : "border-line/10 bg-surface/[0.06]"
                  )}
                >
                  <Icon
                    name={capability.icon}
                    className={selected ? accent.text : "text-ink-300"}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-ink-300">
                      0{index + 1}
                    </span>
                    <h3
                      className={cn(
                        "font-display text-base transition-colors duration-200",
                        selected ? "text-ink-50" : "text-ink-100"
                      )}
                    >
                      {capability.title}
                    </h3>
                  </div>

                  <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
                    {capability.body}
                  </p>

                  {/* Detail expands only for the selected capability, so the
                      column stays scannable instead of a wall of bullets. */}
                  <AnimatePresence initial={false}>
                    {selected && (
                      <motion.ul
                        key="items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <span className="mt-3 block border-t border-line/10 pt-3">
                          {capability.items.map((item) => (
                            <span
                              key={item}
                              className="mb-1.5 flex gap-2.5 font-mono text-xs text-ink-100 last:mb-0"
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "mt-[6px] h-1 w-1 shrink-0 rounded-full",
                                  accent.dot
                                )}
                              />
                              <span>{item}</span>
                            </span>
                          ))}
                        </span>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          );
        })}

        <p className="mt-1 px-1 font-mono text-[11px] leading-relaxed text-ink-300">
          Pick one — the terminal runs that discipline&rsquo;s actual workflow.
        </p>
      </div>

      {/* ── Terminal ─────────────────────────────────────────────────── */}
      <div
        id="cap-console"
        role="tabpanel"
        aria-labelledby={`cap-tab-${active.id}`}
        className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
      >
        <InferenceConsole
          // Keying on the id remounts the console, which is the simplest way to
          // guarantee a clean replay when the selection changes.
          key={active.id}
          script={active.script}
          host={active.host}
          status={active.status}
        />
      </div>
    </div>
  );
}
