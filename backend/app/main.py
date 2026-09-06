"""FastAPI application entry point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.api.routes import admin, blog, contact, demos, health, projects, skills
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.rate_limit import limiter
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.db.seed import seed_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
)
logger = logging.getLogger("portfolio")

# Hard ceiling on any request body. Individual routes narrow this further; this
# exists so an oversized body is rejected before it is buffered into memory.
MAX_REQUEST_BYTES = 8 * 1024 * 1024  # 8 MB


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach defensive response headers to every response."""

    def __init__(self, app, *, is_production: bool) -> None:
        super().__init__(app)
        self.is_production = is_production

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        response.headers.setdefault("Cross-Origin-Resource-Policy", "same-site")
        # The API returns JSON only; a restrictive CSP costs nothing here.
        response.headers.setdefault(
            "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
        )
        if self.is_production:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests whose declared body exceeds the global ceiling."""

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                declared = int(content_length)
            except ValueError:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": {"code": 400, "message": "Invalid Content-Length header."}},
                )
            if declared > MAX_REQUEST_BYTES:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "error": {
                            "code": 413,
                            "message": "Request body is too large.",
                        }
                    },
                )
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed reference data before the app serves traffic."""
    settings = get_settings()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_all(db)
    logger.info(
        "Backend ready [env=%s]. CORS origins: %s",
        settings.app_env,
        settings.cors_origin_list,
    )
    yield
    logger.info("Backend shutting down.")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        # Interactive docs are useful locally but are an unnecessary surface in
        # production, where the API is consumed only by the portfolio frontend.
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(BodySizeLimitMiddleware)
    app.add_middleware(SecurityHeadersMiddleware, is_production=settings.is_production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        max_age=600,
    )

    register_exception_handlers(app)

    api_prefix = settings.api_prefix
    app.include_router(health.router, prefix=api_prefix)
    app.include_router(projects.router, prefix=api_prefix)
    app.include_router(skills.router, prefix=api_prefix)
    app.include_router(blog.router, prefix=api_prefix)
    app.include_router(contact.router, prefix=api_prefix)
    app.include_router(demos.router, prefix=api_prefix)
    app.include_router(admin.router, prefix=api_prefix)

    @app.get("/")
    def root() -> dict:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": None if settings.is_production else "/docs",
            "api": api_prefix,
        }

    return app


app = create_app()
