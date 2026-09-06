"""Health check routes.

`/health` is a cheap liveness probe. `/health/ready` is a readiness probe that
actually touches the database, so a deploy platform can tell the difference
between "the process is up" and "the process can serve requests".
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import get_settings

router = APIRouter(tags=["health"])
logger = logging.getLogger("portfolio")


@router.get("/health")
def health() -> dict:
    settings = get_settings()
    return {"status": "ok", "env": settings.app_env, "version": settings.app_version}


@router.get("/health/ready")
def readiness(response: Response, db: Session = Depends(get_db)) -> dict:
    """Verify the database is reachable before reporting ready."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - we deliberately catch everything here
        logger.error("Readiness check failed: %s", exc)
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unavailable", "database": "down"}
    return {"status": "ok", "database": "up"}
