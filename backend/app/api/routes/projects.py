"""Public project endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Project
from app.schemas.project import ProjectRead

router = APIRouter(prefix="/projects", tags=["projects"])


def _project_to_read(project: Project) -> ProjectRead:
    return ProjectRead(
        id=project.id,
        slug=project.slug,
        title=project.title,
        summary=project.summary,
        description=project.description,
        category=project.category,
        tech_stack=project.tech_stack,
        github_url=project.github_url,
        live_url=project.live_url,
        image_url=project.image_url,
        image_credit=project.image_credit,
        status=project.status,
        featured=project.featured,
        tags=[tag.label for tag in project.tags],
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.get("", response_model=List[ProjectRead])
def list_projects(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(default=None, max_length=64),
    featured: Optional[bool] = Query(default=None),
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0, le=10_000),
) -> List[ProjectRead]:
    query = db.query(Project).filter(Project.status == "published")
    if category:
        query = query.filter(Project.category == category)
    if featured is not None:
        query = query.filter(Project.featured == featured)
    query = query.order_by(Project.featured.desc(), Project.created_at.desc())
    rows = query.offset(offset).limit(limit).all()
    return [_project_to_read(p) for p in rows]


@router.get("/{slug}", response_model=ProjectRead)
def get_project(slug: str, db: Session = Depends(get_db)) -> ProjectRead:
    if len(slug) > 120:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slug.")
    project = (
        db.query(Project)
        .filter(Project.slug == slug, Project.status == "published")
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return _project_to_read(project)
