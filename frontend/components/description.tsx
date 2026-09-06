import type { ReactNode } from "react";

/**
 * A tiny markdown-lite renderer for project descriptions stored in the DB.
 *
 * Supported block syntax:
 *   `## Heading`           → section heading
 *   `### Heading`          → sub-heading
 *   `- item`               → bulleted list item
 *   `1. item`              → numbered list item
 *   blank line             → paragraph break
 *
 * Supported inline syntax:
 *   `**bold**`             → <strong>
 *   `*italic*`             → <em>
 *   `` `code` ``           → <code>
 *   `[text](url)`          → <a target=_blank>
 *
 * Anything not matching falls through as plain text. Deliberately minimal — we
 * keep our descriptions in the seed file, so we don't need a full markdown
 * dependency.
 */

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <a
          key={key++}
          href={m[2]}
          target="_blank"
          rel="noreferrer"
          className="text-accent-soft underline-offset-2 hover:underline"
        >
          {m[1]}
        </a>,
      );
    } else if (m[3]) {
      out.push(
        <strong key={key++} className="font-semibold text-ink-50">
          {m[3]}
        </strong>,
      );
    } else if (m[4]) {
      out.push(
        <em key={key++} className="text-ink-50">
          {m[4]}
        </em>,
      );
    } else if (m[5]) {
      out.push(
        <code
          key={key++}
          className="rounded bg-surface/[0.10] px-1.5 py-0.5 font-mono text-xs text-accent-soft"
        >
          {m[5]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Description({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];

  let listBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paraBuf: string[] = [];

  function flushList() {
    if (listBuf.length === 0) return;
    const items = listBuf.map((s, i) => (
      <li key={i} className="leading-relaxed">
        {renderInline(s)}
      </li>
    ));
    if (listType === "ol") {
      out.push(
        <ol
          key={`ol-${out.length}`}
          className="ml-5 list-decimal space-y-1.5 text-sm text-ink-100 marker:text-accent-soft"
        >
          {items}
        </ol>,
      );
    } else {
      out.push(
        <ul
          key={`ul-${out.length}`}
          className="ml-5 list-disc space-y-1.5 text-sm text-ink-100 marker:text-accent"
        >
          {items}
        </ul>,
      );
    }
    listBuf = [];
    listType = null;
  }

  function flushPara() {
    if (paraBuf.length === 0) return;
    out.push(
      <p
        key={`p-${out.length}`}
        className="text-sm leading-relaxed text-ink-100"
      >
        {renderInline(paraBuf.join(" "))}
      </p>,
    );
    paraBuf = [];
  }

  function flush() {
    flushList();
    flushPara();
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      out.push(
        <h2
          key={`h2-${out.length}`}
          className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-soft first:mt-0"
        >
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(
        <h3
          key={`h3-${out.length}`}
          className="mt-4 font-mono text-sm text-accent-soft"
        >
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(line.slice(2));
      continue;
    }
    const numMatch = /^(\d+)\.\s+(.+)$/.exec(line);
    if (numMatch) {
      flushPara();
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(numMatch[2]);
      continue;
    }
    flushList();
    paraBuf.push(line);
  }
  flush();

  return <div className="space-y-4">{out}</div>;
}
