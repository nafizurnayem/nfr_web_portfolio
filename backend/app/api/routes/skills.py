"""Public skills endpoint."""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Skill
from app.schemas.skill import SkillRead

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=List[SkillRead])
def list_skills(db: Session = Depends(get_db)) -> List[SkillRead]:
    rows = db.query(Skill).order_by(Skill.sort_order.asc(), Skill.name.asc()).all()
    return [SkillRead.model_validate(s, from_attributes=True) for s in rows]
