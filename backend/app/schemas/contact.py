"""Pydantic schemas for the contact form."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    # Honeypot — must be empty for legitimate submissions.
    website: Optional[str] = Field(default="", max_length=200)


class ContactResponse(BaseModel):
    ok: bool = True
    message: str = "Thanks for reaching out. I'll get back to you soon."
