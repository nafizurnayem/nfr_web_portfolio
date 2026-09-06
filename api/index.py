"""Vercel entry point for the FastAPI backend.

Vercel's Python runtime looks for a module under `api/` and serves the ASGI
application it exports as `app`. The application itself lives in `backend/`, so
this module only puts that directory on `sys.path` and re-exports it — there is
no logic here, and there should not be.

Routing: `vercel.json` sends `/api/*` here, and the app's own `api_prefix` is
also `/api`, so the path the function receives (`/api/projects`) is exactly the
path FastAPI has a route for. Do not strip the prefix in either place.

Configuration comes from real environment variables set in the Vercel project.
`pydantic-settings` still points at a `.env` file, which simply does not exist
in the deployment — a missing env file is ignored, and environment variables
take precedence over it in any case.
"""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402  (path must be set before this import)

# Vercel discovers the ASGI application by this name.
__all__ = ["app"]
