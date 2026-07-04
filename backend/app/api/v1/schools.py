from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_optional_user
from app.db.session import get_db
from app.models import Achievement, Club, ClubEvent, User, VerifiedSchool
from app.schemas.auth import UserPublic
from app.services.clubs import club_member_count, creator_has_pro
from app.services.username import slugify

router = APIRouter(prefix="/schools", tags=["schools"])


def _resolve_school(db: Session, slug: str) -> tuple[str, VerifiedSchool | None]:
    verified = db.query(VerifiedSchool).filter(VerifiedSchool.slug == slug).first()
    if verified:
        return verified.school_name, verified

    rows = db.query(User.school_name).filter(User.is_active == True).distinct().all()
    for (name,) in rows:
        if slugify(name) == slug:
            return name, None
    raise HTTPException(status_code=404, detail="School not found")


@router.get("")
def list_schools(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=0),
    limit: int = Query(30, le=50),
):
    query = (
        db.query(User.school_name, func.count(User.id).label("student_count"))
        .filter(User.is_active == True)
        .group_by(User.school_name)
    )
    if q.strip():
        query = query.filter(User.school_name.ilike(f"%{q.strip()}%"))
    rows = query.order_by(func.count(User.id).desc()).limit(limit).all()
    verified_names = {v.school_name for v in db.query(VerifiedSchool).filter(VerifiedSchool.is_verified == True).all()}
    return [
        {
            "name": name,
            "slug": slugify(name),
            "student_count": count,
            "is_verified": name in verified_names,
        }
        for name, count in rows
    ]


@router.get("/{slug}")
def get_school(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
):
    school_name, verified = _resolve_school(db, slug)
    students = (
        db.query(User)
        .filter(User.is_active == True, User.school_name == school_name)
        .order_by(User.full_name.asc())
        .limit(24)
        .all()
    )
    student_ids = [s.id for s in students]
    clubs = (
        db.query(Club)
        .filter(Club.school_name == school_name)
        .order_by(Club.created_at.desc())
        .limit(12)
        .all()
    )
    events = (
        db.query(ClubEvent)
        .join(Club, Club.id == ClubEvent.club_id)
        .filter(Club.school_name == school_name)
        .order_by(ClubEvent.starts_at.desc())
        .limit(10)
        .all()
    )
    achievements = (
        db.query(Achievement)
        .join(User, User.id == Achievement.user_id)
        .filter(User.school_name == school_name, User.is_active == True)
        .order_by(Achievement.date_achieved.desc())
        .limit(12)
        .all()
        if student_ids
        else []
    )
    return {
        "name": school_name,
        "slug": slug,
        "city": verified.city if verified else (students[0].city if students else None),
        "is_verified": verified.is_verified if verified else False,
        "student_count": db.query(User).filter(User.school_name == school_name, User.is_active == True).count(),
        "students": [UserPublic.model_validate(s).model_dump() for s in students],
        "clubs": [
            {
                "id": str(c.id),
                "name": c.name,
                "emoji": c.emoji,
                "category": c.category,
                "member_count": club_member_count(db, c.id),
                "is_verified": creator_has_pro(db, c),
            }
            for c in clubs
        ],
        "events": [
            {
                "id": str(e.id),
                "title": e.title,
                "starts_at": e.starts_at.isoformat(),
                "location": e.location,
                "club_id": str(e.club_id),
            }
            for e in events
        ],
        "achievements": [
            {
                "id": str(a.id),
                "title": a.title,
                "level": a.level,
                "category": a.category,
                "user_id": str(a.user_id),
            }
            for a in achievements
        ],
    }
