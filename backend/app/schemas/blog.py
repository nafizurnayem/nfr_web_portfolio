"""Pydantic schemas for blog posts."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class BlogPostRead(BaseModel):
    id: int
    slug: str
    title: str
    excerpt: str
    content: str
    tags: str
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlogPostSummary(BaseModel):
    id: int
    slug: str
    title: str
    excerpt: str
    tags: str
    published_at: Optional[datetime] = Field(default=None)

    model_config = ConfigDict(from_attributes=True)
