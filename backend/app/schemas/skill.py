"""Pydantic schemas for the Skill resource."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class SkillRead(BaseModel):
    id: int
    name: str
    category: str
    proficiency: int = Field(ge=0, le=100)
    sort_order: int

    model_config = ConfigDict(from_attributes=True)
