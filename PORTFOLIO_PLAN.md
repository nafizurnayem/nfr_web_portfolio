# Full-Stack Portfolio Plan

## Goal

Build a fully functional full-stack portfolio for a CSE background that blends polished UI/UX with real engineering depth.

The project will use:

- Frontend: Next.js with React
- Backend: Python with FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- API style: REST
- Visual direction: Artistic CSE, dark, technical, interactive

Implementation should begin only after the customization choices below are confirmed.

## Core Experience

The portfolio should feel like a technical command center rather than a generic resume site.

Main user-facing sections:

- Home / hero section
- About section
- Skills and tech stack
- Projects with dynamic filtering
- Interactive demos
- Research / academic work
- Blog or notes
- Resume / CV
- Contact form
- Admin or content-management area

## Design Concept

Default direction: Terminal Meets Glassmorphism.

Visual language:

- Deep charcoal or near-black background
- Neon cyan, green, or violet accents
- Subtle glass panels for project and dashboard surfaces
- Terminal-inspired details
- Monospace headings or technical labels
- Smooth, restrained micro-interactions
- Dense but readable engineering-focused layouts

Typography:

- Body: Inter or similar modern sans-serif
- Technical text: JetBrains Mono or Fira Code

UI behavior:

- Animated terminal intro or command prompt effect
- Project cards with hover reveal states
- Smooth route transitions
- Filterable project grid
- Interactive demo panels
- Backend-powered contact form

## Full-Stack Architecture

### Frontend

Recommended:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animation
- React Hook Form for forms
- Zod for frontend validation

Main pages:

- `/`
- `/projects`
- `/projects/[slug]`
- `/demos`
- `/blog`
- `/blog/[slug]`
- `/resume`
- `/contact`
- `/admin`

### Backend

Recommended:

- FastAPI
- SQLAlchemy 2.x
- Alembic migrations
- Pydantic schemas
- PostgreSQL database
- JWT or session-based admin authentication
- CORS configured for the frontend origin

Main API routes:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/{slug}`
- `GET /api/skills`
- `GET /api/blog-posts`
- `GET /api/blog-posts/{slug}`
- `POST /api/contact`
- `POST /api/admin/login`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/{id}`
- `DELETE /api/admin/projects/{id}`

### Database

Core tables:

- `users`
- `projects`
- `project_tags`
- `skills`
- `blog_posts`
- `contact_messages`
- `demo_runs`
- `telemetry_logs`

Optional tables:

- `certifications`
- `education`
- `experience`
- `resume_items`
- `gallery_assets`

## Functional Features

### Dynamic Project System

Projects will be stored in PostgreSQL and served through FastAPI.

Each project can include:

- Title
- Slug
- Short summary
- Long description
- Tech stack
- GitHub link
- Live demo link
- Featured image
- Category
- Tags
- Screenshots
- Status
- Featured flag

### Interactive Demos

Possible demo modules:

- AI image classification demo
- Plant disease detection upload flow
- Algorithm visualizer
- IoT telemetry dashboard
- Mini code playground
- Data visualization dashboard

The first version should include a clean placeholder demo architecture even if the ML model is added later.

### Secure Contact Form

Contact form should include:

- Server-side validation
- Sanitized input
- Rate limiting
- Spam protection
- Email forwarding through SMTP or a transactional email provider
- Database persistence for messages

### Admin Area

Admin area should allow:

- Login
- Add/edit/delete projects
- Manage skills
- Manage blog posts
- View contact submissions

Admin can be built after the public site and core API are complete.

## Security Requirements

Security should be treated as a core feature of the portfolio, not an afterthought. The site will include public pages, admin-only routes, contact submissions, optional uploads, and database-backed content, so the implementation needs layered protection.

### Secrets and Configuration

- Keep all secrets in environment variables.
- Never expose database credentials, JWT secrets, SMTP credentials, API keys, or cloud storage credentials to the frontend.
- Add `.env.example` files with placeholder values only.
- Add `.env` to `.gitignore`.
- Use separate environment variables for development, staging, and production.
- Rotate production secrets if they are ever exposed.
- Use strong random values for JWT/session secrets.

Required backend environment variables:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS`
- `ADMIN_EMAIL`
- `ADMIN_INITIAL_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `CONTACT_RECEIVER_EMAIL`

### FastAPI API Security

- Validate every request body, query parameter, and path parameter with Pydantic schemas.
- Use strict field length limits for names, emails, slugs, titles, messages, and uploaded metadata.
- Reject unexpected fields in sensitive schemas.
- Return generic error messages for authentication failures.
- Avoid returning stack traces or internal exception details to clients.
- Add a global exception handler for clean API errors.
- Add request size limits for upload and contact endpoints.
- Add structured server-side logging without logging passwords, tokens, or private messages.
- Add API route versioning if the API grows, for example `/api/v1`.

### Database Security

- Use SQLAlchemy parameterized queries only.
- Avoid raw SQL unless absolutely necessary, and parameterize it when used.
- Use a PostgreSQL user with the minimum required permissions.
- Do not use the PostgreSQL superuser account in the app.
- Add database indexes for frequently queried public fields such as `slug`, `status`, and `published_at`.
- Add uniqueness constraints for slugs and admin email addresses.
- Store timestamps for created and updated records.
- Use Alembic migrations for all schema changes.
- Back up production PostgreSQL data before major releases.

### Authentication and Admin Authorization

- Hash admin passwords with Argon2 or bcrypt.
- Never store plaintext passwords.
- Use short-lived access tokens.
- Prefer HTTP-only secure cookies for admin sessions in production.
- If JWT bearer tokens are used, store them carefully and avoid localStorage for sensitive sessions.
- Protect every admin route with authentication middleware or dependencies.
- Add role-based authorization if more than one admin role is introduced.
- Add login rate limiting to reduce brute-force attempts.
- Add logout support.
- Add password change support after the first admin login.
- Consider two-factor authentication for the admin area after the MVP.

### CORS and Frontend Protection

- Restrict CORS to the exact frontend production domain and local development URLs.
- Do not use wildcard CORS in production.
- Add secure HTTP response headers through Next.js and/or reverse proxy configuration:
  - `Content-Security-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options` or CSP `frame-ancestors`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security` in production HTTPS environments
- Sanitize or safely render any rich text content.
- Avoid dangerously setting HTML in React unless content is sanitized first.
- Validate form inputs on both frontend and backend.

### Contact Form Security

- Validate name, email, subject, and message on the backend.
- Add rate limiting by IP address and optionally by email address.
- Add a honeypot field to reduce spam.
- Add optional CAPTCHA or Turnstile if spam becomes an issue.
- Sanitize stored message content before display in the admin panel.
- Escape message content when rendering it.
- Send email through a trusted SMTP or transactional provider.
- Store contact messages in the database with status fields such as `new`, `read`, `archived`, and `spam`.
- Do not expose submitted messages through public API routes.

### File Upload and AI Demo Security

- Restrict accepted upload MIME types, for example JPEG, PNG, or WebP.
- Verify file content, not only file extension.
- Set a strict file size limit.
- Rename uploaded files to random server-generated names.
- Do not execute uploaded files.
- Store uploads outside the application source tree or in a secure object storage bucket.
- Strip image metadata if files are stored.
- Automatically delete temporary demo uploads after processing.
- Add rate limiting to demo endpoints.
- Add timeout limits for expensive AI/ML inference tasks.
- Queue long-running inference jobs if model execution becomes slow.
- Return only safe model output to the frontend.

### Rate Limiting and Abuse Protection

- Add rate limits to:
  - `POST /api/contact`
  - `POST /api/admin/login`
  - Upload/demo endpoints
  - Any future write endpoint
- Use Redis-backed rate limiting in production if the backend has multiple instances.
- Add request logging for suspicious repeated failures.
- Consider IP blocking or provider-level WAF rules for production.

### Dependency and Supply Chain Security

- Pin backend and frontend dependency versions where practical.
- Run dependency vulnerability checks before deployment.
- Use `pip-audit` or equivalent for Python dependencies.
- Use `npm audit` or equivalent for frontend dependencies.
- Avoid abandoned packages for authentication, uploads, and sanitization.
- Keep FastAPI, SQLAlchemy, Next.js, and security-related packages updated.

### Deployment Security

- Enforce HTTPS in production.
- Use managed PostgreSQL with backups enabled.
- Restrict database access to the backend service where possible.
- Do not expose the database directly to the public internet.
- Store production secrets in the deployment provider's secret manager.
- Disable debug mode in production.
- Configure production logging and error monitoring.
- Add health checks that do not reveal sensitive internal details.
- Review deployment environment variables before launch.

### Security Testing Checklist

- Test invalid API inputs.
- Test unauthorized admin API access.
- Test expired or missing auth tokens.
- Test contact form rate limiting.
- Test upload file type restrictions.
- Test oversized upload rejection.
- Test CORS restrictions.
- Test SQL injection attempts against public endpoints.
- Test XSS payload handling in contact messages and blog/project content.
- Test production build with debug mode disabled.

### Recommended Security Libraries

Backend:

- `passlib[argon2]` or `argon2-cffi` for password hashing
- `python-jose` or `pyjwt` for JWT handling if token auth is used
- `slowapi` or equivalent for rate limiting
- `bleach` for sanitizing rich text if needed
- `python-multipart` for controlled uploads
- `pydantic-settings` for typed environment configuration

Frontend:

- Zod for form validation
- DOMPurify only if sanitized client-side HTML rendering becomes necessary
- Next.js security headers through `next.config`

## Development Sprints

### Sprint 1: Foundation

- Initialize frontend and backend folders
- Configure Next.js, FastAPI, PostgreSQL, SQLAlchemy, Alembic
- Add environment variable templates
- Add Docker Compose for PostgreSQL
- Add health-check route
- Add `.gitignore` entries for secrets and local runtime files
- Add typed backend settings for environment variables

### Sprint 2: Database and API

- Design SQLAlchemy models
- Add Alembic migrations
- Implement project, skill, blog, and contact APIs
- Add validation schemas
- Seed initial portfolio data
- Add database constraints and indexes for security and integrity
- Add global API error handling

### Sprint 3: Frontend Design System

- Configure Tailwind theme
- Add typography, colors, spacing, and reusable components
- Build layout shell
- Build navigation
- Build responsive page structure
- Configure frontend security headers

### Sprint 4: Public Portfolio Pages

- Build home page
- Build about section
- Build skills section
- Build project grid
- Build project detail pages
- Build resume page
- Build contact page
- Add safe frontend validation for public forms

### Sprint 5: Interactive Features

- Add demo page architecture
- Add upload-based AI demo placeholder
- Add telemetry dashboard placeholder
- Add animated project exploration interactions
- Add upload restrictions, file size limits, and demo rate limiting

### Sprint 6: Admin and Content Management

- Add admin authentication
- Add project management UI
- Add blog management UI
- Add contact inbox UI
- Add password hashing, protected admin routes, and login rate limiting
- Add safe rendering for user-submitted contact messages

### Sprint 7: Polish and Deployment

- Add loading and error states
- Add accessibility checks
- Add responsive polish
- Add SEO metadata
- Add test coverage
- Prepare deployment docs
- Run security checks for dependencies, CORS, uploads, auth, and production environment settings

## Customization Choices

Choose one option from each group before implementation starts.

### 1. Visual Theme

- A. Terminal Glass: charcoal, cyan, green, translucent panels
- B. Cyber Lab: black, electric blue, magenta, sharper neon UI
- C. Academic Engineer: dark graphite, emerald, warm white, cleaner research feel
- D. Minimal Systems: black and white, one accent color, very refined and quiet

Recommended: A. Terminal Glass

### 2. Accent Color

- A. Cyan
- B. Matrix green
- C. Violet
- D. Amber
- E. Emerald

Recommended: A. Cyan

### 3. Frontend Style

- A. Artistic but professional
- B. Highly animated and experimental
- C. Minimal and recruiter-friendly
- D. Dashboard-heavy engineering console

Recommended: A. Artistic but professional

### 4. Portfolio Identity

Provide:

- Your full name
- Short title, for example: CSE Student, Full-Stack Developer, AI/ML Enthusiast
- Location
- Email
- GitHub URL
- LinkedIn URL
- Resume file path or resume link

### 5. Project Categories

Select the categories you want:

- AI / Machine Learning
- Full-Stack Web
- IoT / Embedded Systems
- Data Analysis
- UI/UX
- Academic Research
- Competitive Programming
- Open Source

Recommended: AI / Machine Learning, Full-Stack Web, IoT / Embedded Systems, Data Analysis, UI/UX

### 6. Interactive Demo Priority

Choose the first interactive demo to build:

- A. Plant disease detection image upload
- B. IoT telemetry dashboard
- C. Algorithm visualizer
- D. Data analytics dashboard
- E. Code playground

Recommended: A. Plant disease detection image upload

### 7. Content Management

- A. Public site first, admin panel later
- B. Public site plus basic admin panel immediately
- C. Database-backed content only, no admin panel for now

Recommended: A. Public site first, admin panel later

### 8. Deployment Target

- A. Frontend on Vercel, backend and database on Render
- B. Full stack on Railway
- C. Full stack on a VPS
- D. Local development only for now

Recommended: A. Frontend on Vercel, backend and database on Render

### 9. Backend Structure

- A. Simple FastAPI app for faster launch
- B. Modular FastAPI app with routers, services, repositories, and schemas
- C. Enterprise-style layered architecture

Recommended: B. Modular FastAPI app with routers, services, repositories, and schemas

### 10. Database Setup

- A. Local PostgreSQL through Docker Compose
- B. Existing local PostgreSQL installation
- C. Cloud PostgreSQL from the beginning

Recommended: A. Local PostgreSQL through Docker Compose

## Proposed Folder Structure

```text
portfolio-webapp/
  frontend/
    app/
    components/
    lib/
    styles/
    public/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
    alembic/
    tests/
  docker-compose.yml
  README.md
  .env.example
```

## Initial Data Needed

Before building the final website, provide:

- Name and professional title
- 3 to 6 featured projects
- Skills list
- Education details
- Resume link or file
- GitHub and LinkedIn URLs
- Contact email
- Preferred theme choices from the customization section

## Definition of Done

The finished site should include:

- Responsive polished frontend
- FastAPI backend
- PostgreSQL database integration
- SQLAlchemy models and migrations
- Dynamic project loading
- Secure contact form
- At least one interactive demo route
- Clean README with local setup instructions
- Environment variable examples
- Deployment guidance
- Protected admin routes
- Hashed admin passwords
- CORS restricted by environment
- Security headers configured
- Rate limiting on contact, login, and upload/demo endpoints
- Upload validation for demo files
- Basic security test coverage
