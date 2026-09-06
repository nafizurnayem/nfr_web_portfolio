"""Contact form endpoint with rate limiting and spam protection."""

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rate_limit import limiter
from app.models import ContactMessage
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.sanitize import clean_text

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse)
@limiter.limit("5/minute;30/hour")
def submit_contact(
    request: Request,
    payload: ContactCreate = Body(...),
    db: Session = Depends(get_db),
) -> ContactResponse:
    # Honeypot: silently accept but ignore obvious bot submissions.
    if payload.website:
        return ContactResponse(message="Thanks for reaching out.")

    name = clean_text(payload.name)
    subject = clean_text(payload.subject)
    message = clean_text(payload.message)

    if not name or not subject or len(message) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please fill in your name, subject, and a longer message.",
        )

    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:256]

    record = ContactMessage(
        name=name[:120],
        email=str(payload.email)[:255],
        subject=subject[:200],
        message=message[:5000],
        ip_address=ip_address,
        user_agent=user_agent,
        status="new",
    )
    db.add(record)
    db.commit()
    return ContactResponse()
