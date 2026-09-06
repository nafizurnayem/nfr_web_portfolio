"""Admin endpoints: login + project CRUD."""

from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.core.security import create_access_token, verify_password
from app.models import Project, ProjectTag, User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


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
        tags=[t.label for t in project.tags],
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute;30/hour")
def login(
    request: Request,
    payload: LoginRequest = Body(...),
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = db.query(User).filter(User.email == str(payload.email)).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password."
        )
    settings = get_settings()
    token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ProjectRead:
    if db.query(Project).filter(Project.slug == payload.slug).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="A project with that slug already exists."
        )
    data = payload.model_dump()
    tags = data.pop("tags", [])
    project = Project(**data)
    for label in tags:
        project.tags.append(ProjectTag(label=label[:64]))
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_to_read(project)


@router.patch("/projects/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ProjectRead:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    data = payload.model_dump(exclude_unset=True)
    tags = data.pop("tags", None)
    for key, value in data.items():
        setattr(project, key, value)
    if tags is not None:
        project.tags.clear()
        for label in tags:
            project.tags.append(ProjectTag(label=label[:64]))
    db.commit()
    db.refresh(project)
    return _project_to_read(project)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Response:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    db.delete(project)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/contact-messages")
def list_contact_messages(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[dict]:
    from app.models import ContactMessage  # local import to avoid cycles

    rows = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "subject": r.subject,
            "message": r.message,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
