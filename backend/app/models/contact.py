"""Contact message model."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ContactMessage(Base, TimestampMixin):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), default=None)
    user_agent: Mapped[Optional[str]] = mapped_column(String(256), default=None)
    status: Mapped[str] = mapped_column(String(32), default="new", index=True, nullable=False)
