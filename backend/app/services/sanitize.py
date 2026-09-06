"""Lightweight text sanitization helpers for user-submitted content."""

from __future__ import annotations

import bleach

# No HTML tags are allowed in plain user-submitted text fields.
_ALLOWED_TAGS: list[str] = []
_ALLOWED_ATTRS: dict[str, list[str]] = {}


def clean_text(value: str) -> str:
    """Strip any HTML/script content from free-form text input."""
    if not value:
        return ""
    return bleach.clean(value, tags=_ALLOWED_TAGS, attributes=_ALLOWED_ATTRS, strip=True).strip()
