"""Project and ProjectTag models."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import Boolean, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class ProjectTag(Base, TimestampMixin):
    __tablename__ = "project_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    label: Mapped[str] = mapped_column(String(64), nullable=False)

    project: Mapped["Project"] = relationship(back_populates="tags")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    summary: Mapped[str] = mapped_column(String(280), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    tech_stack: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    github_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    live_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    # Attribution for artwork that is not the owner's own. Rendered beside the
    # image so third-party material is never presented as his work.
    image_credit: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    status: Mapped[str] = mapped_column(String(32), default="published", index=True, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    tags: Mapped[List[ProjectTag]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_projects_status_featured", "status", "featured"),
    )
