"""Public blog endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import BlogPost
from app.schemas.blog import BlogPostRead, BlogPostSummary

router = APIRouter(prefix="/blog-posts", tags=["blog"])


@router.get("", response_model=List[BlogPostSummary])
def list_posts(db: Session = Depends(get_db)) -> List[BlogPostSummary]:
    rows = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(50)
        .all()
    )
    return [BlogPostSummary.model_validate(r, from_attributes=True) for r in rows]


@router.get("/{slug}", response_model=BlogPostRead)
def get_post(slug: str, db: Session = Depends(get_db)) -> BlogPostRead:
    if len(slug) > 120:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slug.")
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.status == "published")
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return BlogPostRead.model_validate(post, from_attributes=True)
