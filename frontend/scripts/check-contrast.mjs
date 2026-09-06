/**
 * Checks the text colours of both themes against their own background.
 *
 * Reads the RGB triplets straight out of `app/globals.css`, so it cannot drift
 * from the shipped values the way a hard-coded table would.
 *
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero if any tone that carries text falls below WCAG AA (4.5:1).
 */

import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** Tones used for text, and the minimum ratio each must clear. */
const TEXT_TONES = [
  ["--ink-50", 4.5, "headings"],
  ["--ink-100", 4.5, "body"],
  ["--ink-200", 4.5, "secondary body"],
  ["--ink-300", 4.5, "metadata"],
  ["--accent", 4.5, "links / primary accent"],
  ["--accent-soft", 4.5, "accent text"],
  ["--accent-green", 4.5, "success text"],
  ["--accent-violet", 4.5, "violet text"],
  ["--accent-amber", 4.5, "warning text"],
];

/** Tones used only for borders and separators. 3:1 is the UI-component floor. */
const UI_TONES = [["--ink-400", 3, "hairlines"]];

/**
 * Slice the declaration block containing a given anchor. Anchoring on a unique
 * variable rather than the selector text avoids breaking on whitespace or a
 * selector-list reshuffle.
 */
function blockFor(anchor) {
  const at = CSS.indexOf(anchor);
  if (at === -1) throw new Error(`anchor "${anchor}" not found in globals.css`);
  const open = CSS.lastIndexOf("{", at);
  const close = CSS.indexOf("\n}", at);
  return CSS.slice(open, close);
}

function readVar(block, name) {
  const match = block.match(
    new RegExp(`${name}:\\s*([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s*;`)
  );
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function luminance([r, g, b]) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failures = 0;

for (const [label, anchor] of [
  ["dark", "--ink-950: 4 6 10"],
  ["light", "--ink-950: 242 242 247"],
]) {
  const block = blockFor(anchor);
  const bg = readVar(block, "--ink-950");
  if (!bg) throw new Error(`${label}: --ink-950 missing`);

  console.log(`\n${label} theme — background rgb(${bg.join(" ")})`);
  for (const [name, min, use] of [...TEXT_TONES, ...UI_TONES]) {
    const value = readVar(block, name);
    if (!value) {
      console.log(`  MISSING ${name}`);
      failures += 1;
      continue;
    }
    const r = ratio(value, bg);
    const ok = r >= min;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${name.padEnd(16)} ${use}`
    );
  }
}

if (failures) {
  console.log(`\n${failures} contrast failure(s).`);
  process.exit(1);
}
console.log("\nAll tones clear their minimum in both themes.");
