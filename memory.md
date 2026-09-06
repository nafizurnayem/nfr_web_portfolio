# Portfolio Webapp — Project Memory

> **Purpose:** living state document for AI agents working on this codebase.
> **Read this first** before making changes. **Update the relevant sections + the
> "Update log" at the bottom** every time something meaningful changes (new
> features, file moves, schema changes, identity edits, animation swaps, etc.).
>
> When in doubt, prefer adding a short fact here over leaving it implicit in code.

---

## Owner

- **Name:** Md Nafizur Nayem
- **Email:** nfrnayem123@gmail.com
- **Location:** Kuril, Dhaka, Bangladesh
- **School:** AIUB (American International University, Bangladesh) — CSE student
- **Primary focus:** Image Processing & Computer Vision (custom CNNs, OpenCV pipelines)
- **Public title (identity.ts):** `Computer Vision & Machine Learning Engineer`
- **Secondary:** AI/ML research, NLP & LLMs, Robotics (ESP32 / Arduino), Full-Stack Web
- **Socials (all wired in `frontend/lib/identity.ts`):**
  - GitHub: https://github.com/nafizurnayem
  - LinkedIn: https://www.linkedin.com/in/nafizur-nayem-38055b335/
  - X / Twitter: https://x.com/NafizurNayem
  - Facebook: https://www.facebook.com/nafizurnayeme/
  - Google Scholar: https://scholar.google.com/citations?user=zH1VbbAAAAAJ&hl=en
  - ResearchGate: https://www.researchgate.net/profile/Md-Nayem-9?ev=hdr_xprf
  - Spotify: https://open.spotify.com/user/31v4sdaoy5ypxohu5zlo7hnh65rm

---

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS,
  Framer Motion, React-Three-Fiber + `drei` + postprocessing, React Hook Form + Zod.
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic v2, Argon2 password hashing, JWT,
  slowapi rate limiting, bleach sanitization, magic-byte image verification.
- **Database:** SQLite (`backend/portfolio.db`) for dev. Postgres supported via `DATABASE_URL`.
- **Theme:** "Liquid Glass" — frosted translucent surfaces, **light and dark** — dark AI/ML console aesthetic. Accent scale is semantic:
  cyan = inference/primary, violet = model internals/embeddings, green = passing metrics/live,
  amber = warnings. Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (technical).
  Component classes (`.model-card`, `.metric`, `.tensor-chip`, `.layer-label`,
  `.availability-banner`, `.text-neural`) live in `frontend/app/globals.css`.
  Body overlays (grid, radial fade, film grain, vignette) applied by `frontend/app/layout.tsx`.
  **Scanlines overlay was removed** — it read as retro-CRT rather than AI.

---

## Key files

### Frontend

- `frontend/lib/identity.ts` — **single source of truth** for name, email, title, socials,
  availability line. Exports `identity`, `socialLinks`, `navLinks`. Add a social here and it
  appears in the footer, contact page, resume, and the JSON-LD `sameAs` array automatically.
- `frontend/app/layout.tsx` — root layout. Loads the three fonts, emits Person JSON-LD
  structured data, renders the skip-to-content link, and paints the fixed body overlays
  (grid at z-`-20`, radial fade at `-10`, film grain `[60]`, vignette `[59]`).
- `frontend/app/page.tsx` — home. Sections: hero, capabilities, about, featured work, stack,
  contact CTA. `CATEGORY_PRIORITY` here controls the order of the skill panels.
- `frontend/components/neural-network-canvas.tsx` — **the hero visual.** Live feed-forward
  network on a 2D canvas: edge colour encodes weight sign (cyan positive / violet negative),
  brightness encodes magnitude, and pulses travel forward and excite destination nodes.
  Pauses on tab-hidden and off-screen; renders one static frame under `prefers-reduced-motion`.
- `frontend/components/capability-showcase.tsx` — the "What I can build for you" section.
  Split layout: capability list on the left, animated terminal on the right, **wired together** —
  selecting a capability replays `InferenceConsole` with that discipline's own transcript
  (vision training / document extraction / API hardening), each with its own host and status bar.
  Built as a real **tablist** (`role="tab"` / `tabpanel"`, arrow-key + Home/End navigation,
  roving `tabIndex`), not styled divs. The console is remounted via `key={active.id}` so a
  selection change replays cleanly from the first line. Selection is marked by a left edge bar as
  well as colour.
- `frontend/components/skill-matrix.tsx` — the "Tools I reach for" section. Bento grid of category
  panels with skill chips, replacing 54 animated confidence bars: too much simultaneous motion for
  something readers only scan, and a two-decimal bar implied precision a self-assessment does not
  have. `PRIMARY_CATEGORY` gets the double-width accented cell; skills at/above `CORE_THRESHOLD`
  (88) get an accented chip with a dot, so emphasis is not colour-only. Sort order comes from the
  database `proficiency`.
- `frontend/components/inference-console.tsx` — now takes `script` / `host` / `status` / `className`
  props (defaults preserve the original vision transcript). `ConsoleLine` is exported.
- `frontend/components/thunder-effect.tsx` — lightning that strikes while scrolling **down**,
  mounted once in `app/layout.tsx` so it works on every page. **The constants at the top are
  photosensitivity limits, not taste settings:** two flashes per strike (WCAG 2.3.1 allows three
  per second), a 7s hard cooldown on a monotonic clock, `PEAK_OPACITY` 0.28 on the full-screen
  wash, and the whole component returns `null` under `prefers-reduced-motion`. The *bolt* is
  drawn much brighter than the wash on purpose — the flash threshold is area-based, and a thin
  bolt covers a tiny fraction of the viewport. Raising any of these trades away that margin.
  - Gotcha fixed during build: `lastStrikeAt` was initialised to `0`, which `performance.now()`
    reads as "a strike happened at page load", silently blocking the first strike for a whole
    cooldown window. It is `Number.NEGATIVE_INFINITY` now.
- `frontend/components/rotating-headline.tsx` — the hero's second headline line, cycling four
  audience-specific phrases (AI/ML, embedded, software, web) every 5s.
  - **Every phrase must wrap to the same number of lines at every width.** All phrases render
    into one grid cell so the block reserves the tallest — that is what gives zero layout shift,
    but a phrase that wraps one line shorter then sits in an over-tall box with a visible gap.
    Character count is a *poor proxy*: a 54-character phrase wrapped to three lines while its
    54-character neighbours wrapped to two. Measure instead:
    `Range.selectNodeContents(el).getClientRects().length`.
  - Current set is equal at 375/414/768/1024/1440/1920 and off by one line at 320 only; several
    shorter alternatives were measured and each broke parity at some other width.
  - Rotation pauses on hover and focus, when the tab is hidden, and when scrolled out of view;
    `prefers-reduced-motion` freezes it on the first phrase (WCAG 2.2.2).
- `frontend/components/portrait-hero.tsx` — **the hero's right panel.** Owner's cut-out photo
  (`frontend/public/nafiz.webp`, 960x2051, 128 KB) with a **scroll-driven alter-ego
  transformation**: at rest it is the plain professional photograph; as the hero scrolls away it
  crossfades to a solid black silhouette wearing a drawn cowl, backlit by a bright disc, with a
  cold rim light. Driven by one `useScroll` progress value through a spring; every derived value
  is `opacity` or `transform` only. The silhouette is the *same image* with a **static**
  `filter: brightness(0) saturate(0)` — the source has an alpha channel, so that yields a clean
  cutout. The filter is never animated (see the blur gotcha below). `ALTER_EGO_SRC` at the top of
  the file swaps in a purpose-shot photograph if one is ever taken.
  - `HEAD` is a percentage of the **visible crop**, not the source image: the frame is
    `aspect-[1286/2200]` with `object-top`, so the bottom ~20% of the photo is never shown.
  - **The earlier face/person-detection overlay was removed at the owner's request.**
  - **A cape was built and removed.** The subject's silhouette (broad suit, arms at his sides)
    fills the full width of the lower frame, so anything drawn behind him is entirely occluded —
    it rendered nothing and still cost paint. Don't add one back without a photo shot in a pose
    that leaves room for it.
  - The cowl's brow band was also removed: mid-crossfade it read as a floating oval on a
    still-visible face. The cowl now fades in only after the silhouette has formed (0.55-0.85).
- `frontend/components/inference-console.tsx` — **moved out of the hero into the "What I can
  build for you" section**, paired with a four-step explainer panel. Animated transcript of
  a checkpoint load, layer summary, training run, and a softmax prediction. Numbers are
  internally consistent with the potato-disease classifier. Skips the animation entirely
  under `prefers-reduced-motion` and shows the finished transcript.
- `frontend/components/capability-card.tsx` — the "what I can build for you" cards.
- `frontend/components/project-card.tsx` — model card: poster, category, title, summary,
  tech chips, tags, then `details` / `code` / `live` actions. Hover changes colour only,
  never scale, so the grid never shifts under the pointer.
- `frontend/components/project-poster.tsx` — procedural per-project artwork.
  `KIND_BY_CATEGORY` **must** match the seeded category strings exactly.
- `frontend/components/skill-bar.tsx` — renders a skill as a softmax-style confidence row.
- `frontend/components/contact-form.tsx` — hand-written zod resolver bridges zod into
  react-hook-form without `@hookform/resolvers`, so per-field schema messages actually appear.
- `frontend/app/robots.ts`, `frontend/app/sitemap.ts` — SEO. The sitemap is generated from
  live API data, so a newly seeded project appears without a code change.
- `frontend/app/demos/loading.tsx`, `frontend/app/resume/loading.tsx` — the **only** two
  loading files. See the soft-404 gotcha below before adding another.

**Unused hero alternates kept on disk** (nothing imports them): `terminal-hero.tsx`,
`audio-waveform.tsx`, `matrix-rain.tsx`, `neural-robotics.tsx`, `video-backdrop.tsx`,
`hero-3d-scene.tsx`. They are tree-shaken out of the bundle. `hero-3d-scene.tsx` is the
only consumer of `three` / `@react-three/*` — if you delete it, drop those four packages
from `package.json` too.

### Backend

- `backend/app/main.py` — FastAPI app, CORS, security-headers middleware, startup hook calls `seed_all`.
- `backend/app/db/seed.py` — seeds admin user, skills, projects, blog posts. **All seed functions
  early-out if rows already exist.** To pick up edits, delete `backend/portfolio.db` and restart.
- `backend/app/api/routes/` — `health`, `projects`, `skills`, `blog`, `contact`, `demos`, `admin`.
- `backend/.env` — local dev config (copy of `.env.example`).

---

## Skills (currently 40, in `backend/app/db/seed.py::_ensure_skills`)

Categories appear in this order on the home page (driven by `sort_order`):

1. **Image Processing & CV** (9) — OpenCV, Pillow (PIL), Image Classification (CNN),
   Object Detection (YOLO), Image Segmentation (U-Net), Image Filtering & Morphology,
   Edge & Feature Detection, Image Augmentation (albumentations), Plant-Disease Detection
2. **AI/ML & Data Science** (7) — PyTorch, TensorFlow, Keras, scikit-learn, Pandas, NumPy, Matplotlib
3. **NLP & LLM** (5) — Hugging Face, OpenAI API, LangChain, spaCy, NLTK
4. **Languages** (10) — Python, C++, C, Java, C#, JavaScript, TypeScript, HTML5, CSS3, MicroPython
5. **Robotics & Hardware** (4) — Arduino, Raspberry Pi, Fusion 360, EasyEDA
6. **Development Tools** (5) — VS Code, Jupyter, Google Colab, Git, GitHub

Image Processing is the **primary focus** and is reflected in the headline, about card, resume
"experience" section, and the home-page tagline.

---

## Projects (16 total, all real GitHub repos; forks excluded)

Verified reachable by `backend/scripts/check_links.py` — 19/19 links return 2xx/3xx.

| Slug | Title | Category | Featured | Live |
|---|---|---|---|---|
| `potato-disease-classification-cnn` | Potato Disease Classification (Custom CNN) | Image Processing & CV | * | - |
| `smart-lamp-document-scanner` | Smart Lamp Document Scanner | Image Processing & CV | * | - |
| `images-to-pdf-converter` | Images -> PDF Converter | Image Processing & CV | * | - |
| `model-testing-lab` | Model Testing Lab | AI/ML Research | | - |
| `school-result-gpa-engine` | School Result Processing & GPA Engine | AI/ML Research | | streamlit |
| `agrobot-autonomous-farming` | AgroBot - Autonomous Farming Operator | IoT & Robotics | * | - |
| `pico-assistant-pc-control` | Pico Assistant - Desk & Remote PC Control | IoT & Robotics | * | - |
| `esp32-smart-home-automation` | ESP32 Smart Home Automation | IoT & Robotics | * | - |
| `smart-solar-power-management` | Smart Solar Power Management | IoT & Robotics | | - |
| `remote-pc-power-on` | Remote PC Power-On | IoT & Robotics | | - |
| `pharmashelf-expiry-audit` | PharmaShelf - Pharmacy Expiry Auditing | Full-Stack Web | * | vercel |
| `evershop-ecommerce` | EverShop - E-Commerce Platform | Full-Stack Web | * | vercel |
| `microjob-campus-marketplace` | Microjob - Campus Freelance Marketplace | Full-Stack Web | | - |
| `naf-portfolio-website` | Earlier Portfolio Site | Full-Stack Web | | - |
| `restaurant-management-system` | Restaurant Management System | Academic / Coursework | | - |
| `webtech-coursework` | Web Technologies Coursework | Academic / Coursework | | - |

**Project images:** `image_url` renders a real figure in place of the generated poster art
(`components/project-poster.tsx` short-circuits when it is set); `image_credit` renders beneath
it on the detail page. Only `potato-disease-classification-cnn` has one so far:
`/projects/potato-disease-chart.webp` (1400x764, 222 KB, from a 3.3 MB JPEG in `Photos/`).
**That chart is third-party** — Agricultural Research Center, 2022 — which is exactly why the
`image_credit` column exists. Do not add third-party artwork without filling it in.

**Removed:** `project-simulator-group-1` — its `github_url` was a hard 404; the repo
does not exist on the account. Do not re-add it.

**Forks intentionally excluded** (not the owner's work): FreeRDP, JohnTechFreeRDP,
Dell-XPS-13-7390-macOS, ai_ml_data-science_roadmap, career-ops. The profile-readme
repo (`nafizurnayem`) and the throwaway `GitLabTask` are also excluded.

Category values are load-bearing: `frontend/components/project-poster.tsx`
(`KIND_BY_CATEGORY`) and `frontend/components/projects-grid.tsx` (`CATEGORY_ORDER`)
both key off these exact strings. Changing a category in `seed.py` without updating
both files makes posters fall back to the generic artwork.

Descriptions use markdown-lite sections in plain language:
`## What it does` -> `## Why I built it` -> `## How it works` -> `## Key features`,
optionally `## What I learned` / `## What's next`.

---

## Skills (54, in `backend/app/db/seed.py::_ensure_skills`)

Categories: Image Processing & CV (9), AI/ML & Data Science (7), NLP & LLM (5),
Languages (10), Robotics & Hardware (7), Backend & Data (6), Frontend (5),
Development Tools (5).

Home-page ordering is controlled by `CATEGORY_PRIORITY` in `frontend/app/page.tsx`,
not by `sort_order` alone.

---

## Dev workflow

```powershell
# Backend (port 8000)
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Frontend (port 3000) — Turbopack
cd frontend
npm run dev
```

### Reseed the database

```powershell
# 1. Stop backend (kill whoever is on port 8000)
netstat -ano | Select-String ":8000\s+.*LISTENING" | ForEach-Object { ($_ -split "\s+")[-1] } | ForEach-Object { Stop-Process -Id $_ -Force }
# 2. Delete the DB (SQLite holds a file lock while uvicorn runs)
Remove-Item backend\portfolio.db -Force
# 3. Restart backend — it auto-seeds on startup
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

## Quirks / gotchas (learned the hard way)

- **`StaggeredWords` used to emit no whitespace between words.** The visual gap came from
  `mr-[0.25em]`, so it looked right but the accessible name was "MdNafizurNayem". It now renders a
  real space between words. Watch for this in any component that splits text into per-word spans.

- **Theme switching uses the View Transitions API, not per-element CSS transitions.** The original
  approach put a colour transition on `*` — measured at **~1100 elements** with frame time
  reaching **93ms (about 11fps)**. `theme-toggle.tsx` now calls `document.startViewTransition`
  and animates a circular `clip-path` on `::view-transition-new(root)` from the button's centre:
  one compositor animation instead of 1100 main-thread ones. The old CSS path is kept only as a
  fallback for browsers without the API, minus `box-shadow` (the most expensive property to
  interpolate at that scale).
  - `::view-transition-old/new(root)` must have `animation: none` in CSS, or the browser's default
    cross-fade fights the wipe and the result looks muddy.
  - **Playwright screenshots interrupt view transitions**, so a mid-wipe frame cannot be captured
    that way. Verify the animation exists instead by patching `Element.prototype.animate` and
    asserting a call with `pseudoElement: "::view-transition-new(root)"`.
  - **Frame timing during a view transition is not measurable from rAF in headless.** The
    animation runs compositor-side; a harness comparing "canvas removed" and "backdrop-filter
    disabled" produced results where removing *both* measured worse than removing neither, i.e.
    pure noise. Don't draw conclusions from it.
- **`data-theme-switching` on `<html>` means "a snapshot is on screen".** The hero canvas watches
  for it and stops its rAF loop, since rendering frames nobody can see is wasted main-thread time
  during the one moment that needs to be smooth. On resume it resets `lastTime`, or the first
  frame back would integrate the whole paused interval at once.

- **The `ink` scale is semantic, not literal.** `ink-950` always means "page ground" and `ink-50`
  always means "strongest text"; the two themes swap the literal values. That is the whole trick
  that let ~200 existing `ink-*` utilities invert for free. Never assume `ink-950` is dark.
- **Never use `white/[x]` or a literal hex in a component again** — they cannot follow the theme.
  Use `line-*` (hairlines), `surface-*` (glass fills), or a CSS variable. Every colour in
  `tailwind.config.ts` resolves to a variable defined in both themes; values are space-separated
  RGB triplets so Tailwind's opacity modifiers still work.
- **The theme must be applied before first paint.** `app/layout.tsx` carries a small blocking
  inline script (`THEME_INIT_SCRIPT`) that reads `localStorage` then the OS preference. Doing this
  in a React effect instead gives every visitor a flash of the wrong palette. `<html>` therefore
  needs `suppressHydrationWarning`, because the script mutates it before React hydrates.
- **The colour transition is opt-in via `.theme-switching`.** That class is added to `<html>` only
  for the duration of a toggle. Making the transition permanent would put a colour transition on
  every hover of every card on the page.
- **`backdrop-filter` needs something behind it.** The frosted look depends on the ambient grid and
  radial gradient; remove those and the glass panels turn into flat translucent rectangles.
- **Run `npm run check:contrast` after touching any colour.** It parses the RGB triplets out of
  `globals.css` and checks every text tone against its own theme's background. It caught two real
  light-mode failures (`--accent` at 3.90:1 and `--ink-400` at 2.31:1) that looked fine by eye.

- **`ProjectRead` is built by a hand-written mapper, not `from_attributes`.** Adding a column to
  `models/project.py` and `schemas/project.py` is not enough — the field is silently dropped
  unless it is also added to `_project_to_read()`, and that function is **duplicated in two
  files**: `api/routes/projects.py` and `api/routes/admin.py`. Both must be updated. This is how
  `image_credit` came back as `null` despite being correct in the database.
- **Uvicorn here runs without `--reload`.** Backend code edits need a restart before they take
  effect; a stale process will happily serve the old behaviour and look like a code bug.

- **A scroll-scrubbed effect on an element finishes as that element leaves the screen.** The
  portrait's alter-ego transformation was driven by `useScroll({ target })`, so it only reached
  its final state once the hero had scrolled ~450-800px — by which point the portrait was 19-59%
  visible and the cowl had passed under the sticky header (measured: the cowl clears the 69px
  header only up to ~110px of scroll). It is now a **timed** animation *triggered* by a shallow
  scroll (60px, reverting below 20px with hysteresis), so it plays out over ~1.9s with the
  portrait fully in view. Prefer trigger-then-animate over scrub whenever the end state is the
  point.
- **`[0.22, 1, 0.36, 1]` is a strong ease-out — it front-loads motion badly for anything meant to
  be watched.** With it, a nominal 1.6s transformation was visually over in ~500ms because half
  the progress elapsed in the first sixth of the duration. The portrait transformation uses
  `[0.45, 0.05, 0.35, 1]` (near-constant rate) instead. The site's other reveals keep the
  ease-out, which is right for them.

- **The page shell width is a token, not a literal.** `maxWidth.shell` in `tailwind.config.ts`
  (1560px) is used by `app/layout.tsx`, `site-header.tsx` and `site-footer.tsx`. Change it once;
  never hard-code a width in one of those files or they drift apart. It is intentionally not
  edge-to-edge: wider tracks stretch cards, and long-form paragraphs keep their own narrower
  `max-w-*` because line length is a separate readability constraint.
- **`--header-height` in `globals.css` must match the real header.** It drives the projects
  page's sticky quick-nav offset. It was 61px/65px against an actual 69px, so the quick-nav
  overlapped the header. The header is the same height at every breakpoint, so no media query is
  needed. Verify with: header `getBoundingClientRect().bottom` should equal the quick-nav's `top`
  once scrolled.

- **"The site feels laggy on refresh" is almost always dev-mode overhead, not the site.**
  Measured on this project: dev serves **5.1 MB across 26 requests with LCP ~1.1 s**, of which
  ~2.9 MB is Next's own machinery (`react-dom` dev build 1033 KB, `next-devtools` 729 KB, plus
  unminified vendor chunks). The same pages in a production build are **1.2 MB with LCP ~296 ms**.
  Always confirm with `npm run build && npm start` before optimising anything. Sustained frame
  time on the home page is ~17 ms against a 16.8 ms blank-page baseline — i.e. at vsync.
- **Never animate `filter: blur()`.** `Reveal` and `StaggeredWords` used to animate blur on entry,
  and a `<Reveal>` wraps nearly every card and section. Blur forces the layer to re-rasterise on
  every frame, unlike transform/opacity which the compositor handles. Both now animate transform
  and opacity only.
- **`next/image` makes the source file's size almost irrelevant to what ships, but not to dev.**
  The portrait was a 1.6 MB PNG; the browser only ever received ~46 KB because next/image resized
  and re-encoded it. Pre-resizing to a 960x2051 WebP (128 KB) did not change production numbers —
  it cuts cold-start optimisation work and repo weight. The frame renders at most ~480 CSS px, so
  960 covers a 2x display exactly.

- **Grid/flex items default to `min-width: auto`, and `<body>` has `overflow-x: hidden`.**
  Together these hide layout blowouts instead of revealing them: a track that cannot shrink
  below its content's min-content pushes children past the viewport, and the body then *clips*
  the overflow — so `document.documentElement.scrollWidth` still equals the viewport width
  while text is visibly cut off mid-word. Two real instances were shipped this way: the project
  card (a `truncate` title sets `white-space: nowrap`, making min-content the full title width)
  and the hero headline. `.grid > * { min-width: 0 }` in `globals.css` is the blanket fix.
  **Never measure responsiveness with `scrollWidth` alone** — walk `getBoundingClientRect()` on
  every element, skipping those inside a clipping/scrolling ancestor. `tests/responsive.spec.ts`
  does exactly that.
- **`truncate` is hostile to responsive layout.** It sets `white-space: nowrap`, so the element's
  min-content contribution becomes its full unwrapped width. Prefer `line-clamp-*` + `break-words`
  for anything inside a grid or flex track.
- **A stateful seeded RNG shared across renders breaks hydration.** `project-poster.tsx` handed
  out one `rng()` instance from a `useMemo`; React StrictMode renders twice in development, so
  the second render continued the sequence rather than restarting it and drew different artwork
  than the server sent. The memo now returns a *factory* (`newRand()`) and each render seeds its
  own generator. Symptom was the Next.js dev overlay showing "1 Issue" with a hydration mismatch.
- **Tap targets are enforced in CSS, not per-component.** `@media (pointer: coarse)` in
  `globals.css` gives buttons, `[role=button]`, `.btn*` and `.tap-link` a 44px minimum, and
  disables the `preserve-3d` tilt (which otherwise sticks at an angle after a tap). Desktop keeps
  its tighter 30-38px controls deliberately — the 44px rule is about fingers.
- **iOS Safari zooms the page when focusing an input whose font is under 16px.** `.input` is
  `text-base` on mobile and only drops to `text-sm` from `sm:` upward.

- **`loading.tsx` above a `notFound()` route creates a soft 404.** A `loading.tsx` opens a
  Suspense boundary; once the response starts streaming the 200 status is already committed,
  so a later `notFound()` renders the 404 page **with a 200 status**. This was live on
  `/projects/[slug]` and `/blog/[slug]`. Fix: the root `app/loading.tsx` was deleted and
  loading files now exist **only** in `app/demos/` and `app/resume/`, neither of which has
  dynamic children. Verify after any change:
  `curl -o /dev/null -w "%{http_code}" http://localhost:3000/projects/does-not-exist` -> must be 404.
- **Seeded category strings are an API between the backend and two frontend files.**
  `project-poster.tsx` (`KIND_BY_CATEGORY`) and `projects-grid.tsx` (`CATEGORY_ORDER`) both
  key off them. A mismatch fails silently — every poster falls back to the generic artwork,
  which is exactly what happened before.
- **`ink-400` and darker are for borders only, never text.** `ink-400` is 3.3:1 and `ink-500`
  is far below that on the `ink-950` background. `ink-300` (#787F95, 5.09:1) is the darkest
  tone permitted on text of any size.
- **react-hook-form needs a resolver to surface zod messages.** Without one, RHF only knows
  about `required`, so every invalid field reports the same generic error. `contact-form.tsx`
  has a hand-written 15-line resolver — do not "simplify" it away.
- **Python on Windows writes `

` to stdout.** Piping a URL list from Python into a bash
  `while read` loop gives every URL a trailing `
`, and curl then reports `000` for all of
  them. Use `backend/scripts/check_links.py` instead of shell pipelines for link checks.
- **curl inside `while read` steals the loop's stdin.** Add `< /dev/null` to the curl call.

- **SQLite is locked while uvicorn runs.** Always stop backend before deleting `portfolio.db`.
- **`Get-Process node` doesn't always show the dev server.** Use `netstat -ano | Select-String ":3000"`
  to find the actual PID.
- **PowerShell `Invoke-WebRequest` can hang on IPv6.** Prefer `curl.exe` for API smoke checks.
- **`StaggeredWords` + `bg-clip-text` gradient.** Pass gradient classes via `wordClassName`, not
  `className`. Each word is its own `inline-block` so the gradient on the outer span doesn't paint
  through child boxes.
- **Negative z-index inside a non-isolated section leaks to root stacking context** and can be
  hidden by the layout's `-z-10` overlays in `app/layout.tsx`. Use `isolate` + positive z-indices
  for stacked hero layers.
- **Body has fixed overlays** at z-`[60]` (film grain) and z-`[59]` (vignette). They float above
  hero content on every page. This is intentional — it gives the "old monitor" feel.
- **Seed is idempotent.** Editing `seed.py` does nothing until the DB is deleted.
- **PowerShell + Python one-liners** dislike unicode arrows / quoting tricks. Prefer writing a
  small `_check.py` for non-trivial verification steps.
- **`group-hover` only works on descendants of `group`** — don't apply both to the same element.

---

## Update log

> Append a one-liner each time you make a meaningful change. Newest entries at the top.

- **2026-09-06**: Hero headline now rotates through four audience-specific phrases every 5s
  (`rotating-headline.tsx`), with height reserved so there is no layout shift, pause on
  hover/focus/hidden/off-screen, and a reduced-motion freeze. Fixed a pre-existing a11y bug in
  `StaggeredWords` that ran the name together as one word for screen readers.

- **2026-09-06**: Theme switch rebuilt on the View Transitions API — a circular wipe from the
  toggle button, replacing a colour transition applied to ~1100 elements (p95 frame time 91ms).
  Hero canvas now pauses while the switch is in flight. CSS transition retained as a fallback.

- **2026-09-06**: **Light/dark themes added and the UI restyled as iOS-style "Liquid Glass".**
  Removed the hero's scroll transformation and the site-wide thunder effect at the owner's request
  (`thunder-effect.tsx` deleted; `portrait-hero.tsx` reduced to a static framed photo). Every
  colour now resolves to a CSS variable with light and dark definitions; the `ink` scale inverts
  semantically. New `theme-toggle.tsx` plus a blocking no-flash init script in the layout, and
  `scripts/check-contrast.mjs` (`npm run check:contrast`) which verifies both palettes. Fixed a
  768px header overflow introduced by the new toggle.

- **2026-09-06**: Project figures wired up. Added an `image_credit` column (model, schemas, both
  `_project_to_read` mappers), taught `ProjectPoster` to render a supplied image with the
  procedural art as fallback, and attached the optimised potato-disease chart to that project with
  attribution. DB deleted and reseeded for the schema change.

- **2026-09-06**: "What I can build for you" rebuilt as a two-column showcase — capabilities on
  one side driving an animated terminal on the other, as an accessible tablist. "Tools I reach
  for" restyled from 54 confidence bars to a bento chip matrix. `InferenceConsole` parameterised.
  `skill-bar.tsx` and `capability-card.tsx` deleted (orphaned by the rewrite).

- **2026-09-06**: Portrait alter-ego transformation reworked so it is actually seen — switched
  from scroll-scrubbed to a scroll-*triggered* timed animation (`TRIGGER_SCROLL` 60px,
  `TRANSFORM_SECONDS` 1.9, hysteresis revert at 20px) and evened out the easing. Also fixed a
  real bug this exposed: the old scroll offset left the portrait already ~35% transformed at
  rest, so the photo sat at 0.82 opacity over a fully-formed silhouette on first paint.

- **2026-09-06**: Page shell widened from `max-w-6xl` (1152px) to a shared `max-w-shell` token
  (1560px) across layout/header/footer, with `2xl:px-12`; card grids gain a 4th column at `2xl`;
  hero grid gives the copy more of the extra width and the portrait is capped so it cannot
  balloon. Fixed header wrapping at 1024px (SystemStatus moved `lg`->`xl`, brand subtitle and
  hire-me CTA set `whitespace-nowrap`) and corrected `--header-height` 65px -> 69px.

- **2026-09-06**: Added `thunder-effect.tsx` — scroll-triggered lightning (flash wash + generated
  jagged bolt) mounted site-wide in the layout, with photosensitivity limits documented in the
  file. Added the `bolt-flash` keyframe to `tailwind.config.ts`.

- **2026-09-06**: Hero animation replaced. Detection overlay (scan sweep, person/face boxes, pose
  keypoints, readout) removed; the portrait now transforms on scroll into a cowled black
  silhouette against a lit disc. Trade-off noted for the owner: this is original artwork, not
  Batman — DC's character is trademarked and using it on a site soliciting client work is a real
  legal risk. Cape and cowl brow band were both built, reviewed against screenshots, and removed
  because they did not read; only the horns and silhouette survived.

- **2026-09-06**: Headline animation slowed and made the focal point — `StaggeredWords` now takes
  `stagger`/`duration`/`delay` props; the name plays at 0.13s stagger and the value proposition
  follows after a 0.55s delay at 0.15s stagger, so the full sequence reads over ~3.3s. Added
  `.text-neural-sheen`, a 9s gradient sweep across the headline (held still under
  `prefers-reduced-motion`). Performance: removed the `filter: blur()` entry animation from both
  `Reveal` and `StaggeredWords`, and replaced the 1.6 MB portrait PNG with a 128 KB WebP
  (`public/nafiz.webp`; the PNG was deleted, original still in `Photos/`). Investigated the
  reported refresh lag — it is Next dev-mode overhead, documented under gotchas.

- **2026-09-06**: Hero reworked around the owner's photo. `Photos/nafiz_TB.png` copied to
  `frontend/public/nafiz.png` and rendered through `next/image` (`priority`, `sizes`, automatic
  WebP/AVIF) inside the new `portrait-hero.tsx`, which overlays a staged object-detection
  animation. The `InferenceConsole` moved from the hero to the "What I can build for you"
  section, beside a new four-step explainer. Also stopped ordered-list markers wrapping their
  trailing period in that panel and on `/demos`. 42 responsive tests still pass; build clean.

- **2026-09-06**: **Responsive pass across 320/375/414/768/1024/1440/1920.** Fixed two layout
  blowouts that `overflow-x: hidden` was silently clipping (project-card `truncate` title, hero
  grid track), added `.grid > * { min-width: 0 }`, made the projects quick-nav horizontally
  scrollable on phones, stacked all CTA rows below `sm`, moved the "hire me" CTA into the mobile
  menu, raised every sub-11px label, gave `.input` a 16px mobile font to stop iOS zoom, added a
  `@media (pointer: coarse)` block enforcing 44px tap targets and disabling the 3D tilt on touch,
  and made the neural-network hero use a smaller graph below 640px. Also fixed a React hydration
  mismatch in `project-poster.tsx`. Added Playwright (`@playwright/test`) plus
  `frontend/tests/responsive.spec.ts` — 42 tests, all passing — and `playwright.config.ts`.
  Run with `npx playwright test` (backend must be up on :8000).

- **2026-09-06**: **Blog removed from the frontend.** Deleted `frontend/app/blog/`, dropped the
  nav and footer entries, removed the blog routes from `sitemap.ts`, and deleted `BlogSummary`,
  `BlogPost`, `fetchBlogPosts` and `fetchBlogPost` from `frontend/lib/api.ts`. Site is now
  home / projects / demos / resume / contact. **The backend is untouched** — `GET /api/blog-posts`
  still responds and `_ensure_blog_posts` still seeds 3 posts. Nothing links to them. To remove
  the backend side too: drop `blog` from the router list in `app/main.py`, delete
  `app/api/routes/blog.py`, `app/models/blog.py`, `app/schemas/blog.py`, the `BlogPost` import and
  `_ensure_blog_posts` in `app/db/seed.py`, then delete `portfolio.db` and restart to reseed.

- **2026-09-06**: Security/validation pass — production config guard (`config.py` refuses to
  boot with placeholder secrets, weak JWT key, wildcard or non-HTTPS CORS), deprecated
  `@app.on_event` replaced with a lifespan handler, global 8 MB body-size middleware,
  CSP/COOP/CORP/HSTS response headers, `/api/health/ready` DB readiness probe, docs and
  OpenAPI disabled in production, and validation errors no longer echo submitted values back
  to the client. Local `backend/.env` secrets randomised.
- **2026-09-06**: Frontend hardening — env-derived CSP (no `unsafe-eval` in production,
  `connect-src` derived from `NEXT_PUBLIC_API_BASE_URL`), HSTS, skip-to-content link,
  Person JSON-LD, `robots.ts` + `sitemap.ts`, `NEXT_PUBLIC_SITE_URL` for canonical URLs.
- **2026-09-06**: Bug fixes — resume 404 (`Nafiz_s_Resume.pdf` copied to
  `frontend/public/resume.pdf`); soft-404 on all dynamic routes (root `loading.tsx` removed);
  `KIND_BY_CATEGORY` never matched a real category so every poster was generic; three demo
  stubs linked to project slugs that do not exist; contact form's zod messages never reached
  the fields; plant-demo dropzone was keyboard-inert despite `role="button"`; plant-demo
  leaked object URLs; `text-ink-500` was invisible on the page background.
- **2026-09-06**: Projects rebuilt from the live GitHub account — dead
  `project-simulator-group-1` removed, 9 real repos added (Smart Lamp, AgroBot, Pico
  Assistant, Smart Solar, PharmaShelf, GPA Engine, Microjob, Restaurant MS, Webtech), each
  with a hand-written plain-language case study. 16 projects total, 19/19 links verified.
  Skills expanded 40 -> 54 with Backend & Data and Frontend categories.
- **2026-09-06**: UI redesigned from "Terminal Glass" to **"Neural Console"** — live neural
  network hero canvas replaces the audio waveform, terminal replaced by an ML inference
  console, skills render as softmax confidence rows, new capabilities section, availability
  banners, hire-me CTA in the header, resume bullets now link to the projects that prove
  them. Contrast raised so every text tone clears WCAG AA.
- **2026-09-06**: Added `backend/scripts/check_links.py` — verifies every project link and
  exits non-zero on a broken one, so it can gate a deploy.

- **2026-05-09**: Initial `memory.md` created.
- **2026-05-09**: Project descriptions rewritten in plain language with structured markdown-lite
  sections; `<Description>` renderer added; detail page header gained primary `view source` +
  ghost `open live demo` buttons.
- **2026-05-09**: Real GitHub projects seeded (8, forks excluded); `/projects` reorganized into
  category sections with sticky quick-nav + IntersectionObserver active highlight + `/` shortcut;
  `<ProjectCard>` upgraded to icon buttons (view / source / live).
- **2026-05-09**: Skills reseeded with Image Processing & CV (9) leading; home/about/resume
  copy updated to lead with image processing.
- **2026-05-09**: Hero animation iterated: `MatrixRain` → `NeuralRobotics` → `AudioWaveform`
  (current). Old animations kept on disk but not imported. `<VideoBackdrop>` slot at z-0
  reads `/public/hero.mp4` if present.
- **2026-05-09**: Identity rewrite — `Md Nafizur Nayem`, AI/ML/Image Processing focus, all 7
  socials wired through `socialLinks`. Headline visibility bug fixed (`StaggeredWords` now
  supports `wordClassName` so the cyan→green gradient paints per-word).
