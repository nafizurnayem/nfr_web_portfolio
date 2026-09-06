"""Pydantic schemas for the Project resource."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9][a-z0-9\-]*$")
    title: str = Field(min_length=1, max_length=160)
    summary: str = Field(min_length=1, max_length=280)
    description: str = Field(min_length=1, max_length=20000)
    category: str = Field(min_length=1, max_length=64)
    tech_stack: str = Field(default="", max_length=512)
    github_url: Optional[str] = Field(default=None, max_length=512)
    live_url: Optional[str] = Field(default=None, max_length=512)
    image_url: Optional[str] = Field(default=None, max_length=512)
    image_credit: Optional[str] = Field(default=None, max_length=255)
    status: str = Field(default="published", max_length=32)
    featured: bool = False
    tags: List[str] = Field(default_factory=list, max_length=20)


class ProjectCreate(ProjectBase):
    model_config = ConfigDict(extra="forbid")


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = Field(default=None, max_length=160)
    summary: Optional[str] = Field(default=None, max_length=280)
    description: Optional[str] = Field(default=None, max_length=20000)
    category: Optional[str] = Field(default=None, max_length=64)
    tech_stack: Optional[str] = Field(default=None, max_length=512)
    github_url: Optional[str] = Field(default=None, max_length=512)
    live_url: Optional[str] = Field(default=None, max_length=512)
    image_url: Optional[str] = Field(default=None, max_length=512)
    image_credit: Optional[str] = Field(default=None, max_length=255)
    status: Optional[str] = Field(default=None, max_length=32)
    featured: Optional[bool] = None
    tags: Optional[List[str]] = Field(default=None, max_length=20)


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
