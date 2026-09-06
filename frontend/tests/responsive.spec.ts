import { test, expect, type Page } from "@playwright/test";

/**
 * Responsive regression suite.
 *
 * Checks three things that are easy to break and hard to notice:
 *   1. No horizontal overflow at any supported width.
 *   2. No readable text below 11px (decorative SVG artwork excluded).
 *   3. Tap targets at least 38px tall on touch devices.
 *
 * The tap-target rule is deliberately scoped to touch viewports. A 30px button
 * is perfectly usable with a mouse; the 44px guidance exists for fingers, and
 * `@media (pointer: coarse)` in globals.css is what enforces it at runtime.
 */

const PAGES = [
  "/",
  "/projects",
  "/projects/pico-assistant-pc-control",
  "/demos",
  "/resume",
  "/contact",
];

const VIEWPORTS = [
  { name: "small phone", width: 320, height: 640, touch: true },
  { name: "phone", width: 375, height: 812, touch: true },
  { name: "large phone", width: 414, height: 896, touch: true },
  { name: "tablet", width: 768, height: 1024, touch: true },
  { name: "laptop", width: 1024, height: 768, touch: false },
  { name: "desktop", width: 1440, height: 900, touch: false },
  { name: "wide", width: 1920, height: 1080, touch: false },
];

/** Minimum height for a standalone control on a touch device. */
const MIN_TAP_HEIGHT = 38;
/** Smallest font size we allow for real (non-decorative) text. */
const MIN_FONT_SIZE = 11;

async function collectIssues(page: Page, viewportWidth: number) {
  return page.evaluate(
    ({ vw, minTap, minFont }) => {
      const documentWidth = document.documentElement.scrollWidth;

      // `overflow-x: hidden` on <body> means scrollWidth alone cannot detect a
      // blown-out layout -- the overflow is clipped, so the page measures as
      // exactly the viewport width while content is cut off mid-word. Always
      // walk the real element boxes instead of trusting scrollWidth.
      /**
       * An element only overflows the *page* if nothing between it and <body>
       * clips or scrolls it. A wide child inside a horizontally scrollable
       * strip (the category quick-nav) or inside an SVG viewBox is contained
       * by design and must not be reported.
       */
      const isContained = (el: Element): boolean => {
        if (el.closest("svg")) return true;
        let node: Element | null = el.parentElement;
        while (node && node !== document.body) {
          const s = getComputedStyle(node);
          if (s.overflowX !== "visible") return true;
          node = node.parentElement;
        }
        return false;
      };

      const overflowing: string[] = [];
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        if (getComputedStyle(el).position === "fixed") continue;
        if (isContained(el)) continue;
        if (rect.right > vw + 1 || rect.left < -1) {
          overflowing.push(
            `<${el.tagName.toLowerCase()} class="${(el.className || "")
              .toString()
              .slice(0, 60)}"> [${Math.round(rect.left)}..${Math.round(rect.right)}]`
          );
        }
      }

      const tinyText: string[] = [];
      for (const el of Array.from(document.querySelectorAll("*"))) {
        if (el.children.length || !el.textContent?.trim()) continue;
        // SVG <text> scales with its viewBox; it is artwork, not copy.
        if (el.closest("svg")) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < minFont) {
          tinyText.push(`${size}px "${el.textContent.trim().slice(0, 30)}"`);
        }
      }

      const smallTargets: string[] = [];
      for (const el of Array.from(
        document.querySelectorAll("a[href], button, [role='button'], input, select, textarea")
      )) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        // The skip link is intentionally 1x1 until focused.
        if (el.classList.contains("sr-only")) continue;
        // Links inside prose are part of a sentence; padding them out would
        // wreck the paragraph, and they are never the only route to an action.
        if (el.tagName === "A" && el.closest("p, li")) continue;
        if (rect.height < minTap) {
          smallTargets.push(
            `${Math.round(rect.width)}x${Math.round(rect.height)} "${(
              el.textContent ||
              el.getAttribute("aria-label") ||
              ""
            )
              .trim()
              .slice(0, 30)}"`
          );
        }
      }

      return {
        documentWidth,
        overflowing: overflowing.slice(0, 5),
        tinyText: tinyText.slice(0, 5),
        smallTargets: smallTargets.slice(0, 5),
      };
    },
    { vw: viewportWidth, minTap: MIN_TAP_HEIGHT, minFont: MIN_FONT_SIZE }
  );
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.touch,
      isMobile: viewport.touch,
    });

    for (const path of PAGES) {
      test(`${path} lays out correctly`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        await page.waitForTimeout(250);

        const issues = await collectIssues(page, viewport.width);

        expect(
          issues.documentWidth,
          "Page scrolls horizontally"
        ).toBeLessThanOrEqual(viewport.width + 1);

        expect(
          issues.overflowing,
          `Elements extend past the viewport (clipped by body overflow-x:hidden): ${issues.overflowing.join(
            " | "
          )}`
        ).toEqual([]);

        expect(
          issues.tinyText,
          `Text below ${MIN_FONT_SIZE}px: ${issues.tinyText.join(", ")}`
        ).toEqual([]);

        // Tap-target size only matters where the pointer is a finger.
        if (viewport.touch) {
          expect(
            issues.smallTargets,
            `Controls under ${MIN_TAP_HEIGHT}px tall: ${issues.smallTargets.join(", ")}`
          ).toEqual([]);
        }
      });
    }
  });
}
