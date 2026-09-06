# Md Nafizur Nayem — Portfolio Webapp

A full-stack portfolio for Md Nafizur Nayem (AI/ML researcher, NLP & LLM developer, robotics engineer) with a "Neural Console" AI/ML UI, a modular FastAPI backend, and a Next.js (App Router) frontend. Built from `PORTFOLIO_PLAN.md`.

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, React Hook Form + Zod
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic v2, Argon2 password hashing, JWT, slowapi rate limiting, bleach sanitization
- **Database:** SQLite by default for local dev (zero-config). PostgreSQL supported via `DATABASE_URL`.
- **Demo:** Plant-disease classifier upload page with deterministic placeholder predictions, ready to swap for a real model.

## Folder structure

```
portfolio-webapp/
  frontend/          # Next.js app
    app/             # App Router pages (/, /projects, /demos, /resume, /contact)
    components/      # UI primitives (terminal hero, project card, contact form, …)
    lib/             # API client + identity config
    public/
  backend/           # FastAPI app
    app/
      api/routes/    # health, projects, skills, blog, contact, demos, admin
      core/          # config, security, errors, rate_limit
      db/            # session + seed
      models/        # SQLAlchemy ORM
      schemas/       # Pydantic schemas
      services/      # sanitize helper, future services
    requirements.txt
    .env.example
  PORTFOLIO_PLAN.md
  README.md
```

## Quick start (Windows / PowerShell)

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env       # edit values; defaults work for local dev
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The first run creates `portfolio.db` (SQLite) and seeds an admin user, projects, skills, and blog posts.

- API: <http://127.0.0.1:8000/api>
- OpenAPI docs: <http://127.0.0.1:8000/docs>
- Default admin: whatever `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` are set to in `backend/.env`.
  The local `.env` ships with randomly generated values — read them with
  `Select-String ADMIN_ backend\.env` (PowerShell) or `grep ADMIN_ backend/.env`.
- Readiness probe (checks the database): <http://127.0.0.1:8000/api/health/ready>
- Interactive docs are automatically disabled when `APP_ENV=production`.

### 2. Frontend

In a new terminal:

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Linux / macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Personalize

1. Open `frontend/lib/identity.ts` and replace `name`, `title`, `tagline`, `email`, `github`, `linkedin`, `resumeUrl`, `initials`, `location`.
2. Drop your real resume PDF at `frontend/public/resume.pdf`.
3. Edit `backend/app/db/seed.py` to swap in your real projects and blog posts (or create them through the admin endpoints once you build a UI).
4. Update `.env` (backend) with real `JWT_SECRET_KEY`, `ADMIN_INITIAL_PASSWORD`, SMTP settings, and `CORS_ORIGINS` for your deployed domain.

## API endpoints

Public:

- `GET /api/health`
- `GET /api/projects?category=&featured=&limit=&offset=`
- `GET /api/projects/{slug}`
- `GET /api/skills`
- `GET /api/blog-posts` (still served; no frontend page consumes it)
- `GET /api/blog-posts/{slug}` (still served; no frontend page consumes it)
- `POST /api/contact` (rate-limited, honeypot, sanitized)
- `POST /api/demos/plant-disease` (multipart upload, MIME/magic-bytes verified, 4 MB cap, rate-limited)

Admin (Bearer token via `POST /api/admin/login`):

- `POST /api/admin/projects`
- `PATCH /api/admin/projects/{id}`
- `DELETE /api/admin/projects/{id}`
- `GET /api/admin/contact-messages`

## Security features

- Argon2 admin password hashing
- JWT bearer tokens with configurable expiry
- Login + contact + demo rate limiting (slowapi, IP-keyed)
- Strict Pydantic validation; `extra="forbid"` on sensitive schemas
- Generic error responses; structured server-side logging
- Honeypot spam field on the contact form
- Bleach-based sanitization for stored user text
- Magic-byte verification for image uploads (does not trust the extension)
- Security headers in both `next.config.mjs` and a FastAPI middleware: CSP, X-Content-Type-Options, X-Frame-Options/CSP `frame-ancestors`, Referrer-Policy, Permissions-Policy
- CORS restricted to `CORS_ORIGINS` (no wildcards)

## Switching to PostgreSQL

Set:

```env
DATABASE_URL=postgresql+psycopg2://portfolio:portfolio@localhost:5432/portfolio
```

Then start a local Postgres (Docker is the easiest):

```bash
docker run --name portfolio-pg -e POSTGRES_USER=portfolio -e POSTGRES_PASSWORD=portfolio -e POSTGRES_DB=portfolio -p 5432:5432 -d postgres:16
```

The startup hook will create tables and seed data automatically. For production, replace this with Alembic migrations (`alembic init`, `alembic revision --autogenerate -m "init"`, `alembic upgrade head`) — `alembic` is already in `requirements.txt`.

## Responsive tests

The layout is checked at 320, 375, 414, 768, 1024, 1440 and 1920px against every
page. With the backend running on port 8000:

```powershell
cd frontend
npx playwright test
```

Each page is asserted to have no horizontal overflow, no text under 11px, and —
on touch viewports only — no tap target under 38px tall.

The overflow check walks every element's bounding box rather than reading
`document.scrollWidth`, because `<body>` sets `overflow-x: hidden`: a blown-out
layout gets *clipped* rather than made scrollable, so `scrollWidth` reports the
viewport width while text is actually cut off mid-word.

## Verifying links

Every project's GitHub and live-demo URL can be checked in one command while the
backend is running:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts\check_links.py
```

It exits non-zero if anything is broken, so it works as a deploy gate. Sites that
block bots (LinkedIn, ResearchGate) are reported as `blocked`, not failures.

## Deploying

The frontend and backend deploy independently.

### Backend (FastAPI)

Any host that runs a Python web service works — Railway, Render, Fly.io, or a VPS
behind nginx. Required environment variables:

```env
APP_ENV=production
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
JWT_SECRET_KEY=<64+ random chars>
ADMIN_EMAIL=you@your-domain.com
ADMIN_INITIAL_PASSWORD=<12+ chars>
CORS_ORIGINS=https://your-domain.com
```

Generate a secret with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**The app refuses to start in production** if `JWT_SECRET_KEY` or
`ADMIN_INITIAL_PASSWORD` is still a placeholder, if the JWT key is under 32
characters, if `ADMIN_EMAIL` is still an `@example.com` address, or if
`CORS_ORIGINS` contains `*` or a non-HTTPS origin. That is deliberate: a
misconfigured deploy fails loudly instead of running insecurely.

Serve it with a process manager, e.g.:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

### Frontend (Next.js)

Vercel is the path of least resistance; anything that runs `next build` works.
Set both variables in the host's dashboard:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

`NEXT_PUBLIC_API_BASE_URL` also feeds the Content-Security-Policy `connect-src`
directive, so the browser is allowed to reach exactly that origin and no other.
`NEXT_PUBLIC_SITE_URL` drives canonical URLs, Open Graph tags, `robots.txt`, and
`sitemap.xml` — set it before the first crawl or those will all point at localhost.

Then:

```bash
npm run build
npm run start
```

### Post-deploy checks

```bash
curl -s https://api.your-domain.com/api/health/ready     # {"status":"ok","database":"up"}
curl -o /dev/null -w "%{http_code}" https://your-domain.com/projects/does-not-exist   # must be 404
curl -s https://your-domain.com/robots.txt
```

A 200 on that middle command means a `loading.tsx` has been added above a route
that calls `notFound()`, which turns real 404s into soft 404s. See the note in
`frontend/app/demos/loading.tsx`.

## Production checklist

- [ ] `APP_ENV=production` set on the backend.
- [ ] `JWT_SECRET_KEY` and `ADMIN_INITIAL_PASSWORD` replaced with generated values.
- [ ] `CORS_ORIGINS` limited to the real HTTPS domain.
- [ ] `DATABASE_URL` pointed at PostgreSQL, not SQLite.
- [ ] `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL` set on the frontend host.
- [ ] `python scripts/check_links.py` passes.
- [ ] `/projects/does-not-exist` returns 404, not 200.
- [ ] Real résumé PDF present at `frontend/public/resume.pdf`.
- [ ] `pip-audit` and `npm audit` run clean.
