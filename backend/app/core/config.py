"""Typed application settings loaded from environment variables.

Settings are validated on load. In production (`APP_ENV=production`) the
application refuses to start with placeholder secrets or a wildcard CORS
origin, so a misconfigured deploy fails loudly instead of running insecurely.
"""

from __future__ import annotations

import logging
import secrets
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("portfolio")

# Values that ship in `.env.example`. They are fine for local development and
# unacceptable in production, so we check for them explicitly.
PLACEHOLDER_SECRETS = {
    "",
    "change-me",
    "change-me-to-a-strong-random-value",
    "dev-secret-change-me",
    "change-me-after-first-login",
    "secret",
    "changeme",
}

MIN_SECRET_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_env: str = Field(default="development")
    app_name: str = Field(default="Portfolio API")
    app_version: str = Field(default="1.0.0")
    api_prefix: str = Field(default="/api")

    # Database
    database_url: str = Field(default="sqlite:///./portfolio.db")

    # Auth / JWT
    jwt_secret_key: str = Field(default="dev-secret-change-me")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60, ge=5, le=1440)

    # CORS
    cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

    # Admin bootstrap
    admin_email: str = Field(default="admin@example.com")
    admin_initial_password: str = Field(default="change-me-after-first-login")

    # SMTP / Contact
    smtp_host: str = Field(default="")
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str = Field(default="")
    smtp_password: str = Field(default="")
    contact_receiver_email: str = Field(default="admin@example.com")

    # Startup behaviour
    # On a serverless host the lifespan hook runs on every cold start, so
    # creating tables and re-running the seed each time is pure latency once the
    # database is populated. Set to false in production after the first deploy.
    run_startup_migrations: bool = Field(default=True)

    # Upload limits (shared by the demo endpoints)
    max_upload_bytes: int = Field(default=4 * 1024 * 1024, ge=1024)

    @field_validator("cors_origins")
    @classmethod
    def _strip_origins(cls, v: str) -> str:
        return v.strip()

    @field_validator("app_env")
    @classmethod
    def _normalize_env(cls, v: str) -> str:
        return v.strip().lower()

    @model_validator(mode="after")
    def _validate_production_secrets(self) -> "Settings":
        """Fail fast when production is configured with development defaults."""
        if not self.is_production:
            # Development: warn, but keep the app runnable with zero config.
            if self.jwt_secret_key in PLACEHOLDER_SECRETS:
                logger.warning(
                    "JWT_SECRET_KEY is a development placeholder. Set a real value "
                    "before deploying (generate one with: python -c \"import secrets; "
                    "print(secrets.token_urlsafe(48))\")."
                )
            return self

        problems: List[str] = []

        if self.jwt_secret_key in PLACEHOLDER_SECRETS:
            problems.append("JWT_SECRET_KEY is still a placeholder value.")
        elif len(self.jwt_secret_key) < MIN_SECRET_LENGTH:
            problems.append(
                f"JWT_SECRET_KEY must be at least {MIN_SECRET_LENGTH} characters."
            )

        if self.admin_initial_password in PLACEHOLDER_SECRETS:
            problems.append("ADMIN_INITIAL_PASSWORD is still a placeholder value.")
        elif len(self.admin_initial_password) < 12:
            problems.append("ADMIN_INITIAL_PASSWORD must be at least 12 characters.")

        if self.admin_email.endswith("@example.com"):
            problems.append("ADMIN_EMAIL is still the example address.")

        origins = self.cors_origin_list
        if not origins:
            problems.append("CORS_ORIGINS must list at least one origin in production.")
        if "*" in origins:
            problems.append("CORS_ORIGINS cannot be '*' when credentials are allowed.")
        for origin in origins:
            if origin.startswith("http://") and "localhost" not in origin and "127.0.0.1" not in origin:
                problems.append(f"CORS origin '{origin}' must use HTTPS in production.")

        if self.database_url.startswith("sqlite"):
            logger.warning(
                "Running production on SQLite. Set DATABASE_URL to PostgreSQL for "
                "concurrent writes and durability."
            )

        if problems:
            bullet_list = "\n  - ".join(problems)
            raise ValueError(
                "Refusing to start in production with an insecure configuration:\n  - "
                + bullet_list
                + "\n\nGenerate a strong secret with:\n"
                "  python -c \"import secrets; print(secrets.token_urlsafe(48))\""
            )

        return self

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def generate_secret() -> str:
    """Helper used by the setup docs to mint a production-grade secret."""
    return secrets.token_urlsafe(48)
