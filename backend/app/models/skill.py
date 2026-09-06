"""Skill model."""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    proficiency: Mapped[int] = mapped_column(Integer, default=70, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
