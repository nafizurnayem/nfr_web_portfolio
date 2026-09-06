import type { Config } from "tailwindcss";

/**
 * Design system: "Liquid Glass" — frosted translucent surfaces over a soft
 * ground, in the manner of iOS. Ships in both a light and a dark theme.
 *
 * Accent roles are unchanged from the previous dark-only system:
 *   cyan   -> primary action
 *   violet -> model internals
 *   green  -> live / passing
 *   amber  -> warning
 *
 * **Every colour below is a CSS variable**, and both themes redefine them in
 * `globals.css`. Do not reintroduce literal hex values or `white/[x]` here —
 * they cannot follow the theme. Contrast for both palettes is checked in
 * `scripts/check-contrast.mjs`.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Both scales resolve to CSS variables defined in globals.css, and both
         * themes redefine those variables. The `ink` scale is *semantic, not
         * literal*: `ink-950` always means "page background" and `ink-50`
         * always means "strongest text". In dark mode 950 is near-black and 50
         * is near-white; in light mode they swap. That is what lets ~200
         * existing `ink-*` utilities invert correctly without being touched.
         *
         * Values are space-separated RGB triplets so Tailwind's opacity
         * modifiers (`bg-ink-950/60`) keep working.
         */
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          50: "rgb(var(--ink-50) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
          green: "rgb(var(--accent-green) / <alpha-value>)",
          violet: "rgb(var(--accent-violet) / <alpha-value>)",
          magenta: "rgb(var(--accent-magenta) / <alpha-value>)",
          amber: "rgb(var(--accent-amber) / <alpha-value>)",
        },
        /** Theme-aware hairlines and glass fills, replacing raw `white/[x]`. */
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          strong: "rgb(var(--surface-strong) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-lg": "var(--shadow-glass-lg)",
        "glow-cyan": "var(--shadow-glow-cyan)",
        "glow-violet": "var(--shadow-glow-violet)",
        "glow-green": "var(--shadow-glow-green)",
      },
      backgroundImage: {
        "grid-faint": "var(--grid-faint)",
        "radial-fade": "var(--radial-fade)",
      },
      animation: {
        "blink-caret": "blink 1.05s step-end infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
        scan: "scan 6s linear infinite",
        "pulse-node": "pulseNode 2.4s ease-in-out infinite",
        "gradient-pan": "gradientPan 8s ease infinite",
        "data-flow": "dataFlow 3s linear infinite",
      },
      keyframes: {
        blink: {
          "from, to": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseNode: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.35)" },
        },
        gradientPan: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        dataFlow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
