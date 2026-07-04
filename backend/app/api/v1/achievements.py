from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Achievement, User
from app.schemas.achievement import AchievementCreate, AchievementOut, AchievementUpdate, LeaderboardEntry

router = APIRouter(prefix="/achievements", tags=["achievements"])

SortOption = Literal["newest", "oldest", "category"]


def _get_owned_achievement(db: Session, achievement_id: UUID, user_id: UUID) -> Achievement:
    item = (
        db.query(Achievement)
        .filter(Achievement.id == achievement_id, Achievement.user_id == user_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return item


def _apply_sort(query, sort: SortOption):
    if sort == "oldest":
        return query.order_by(Achievement.date_achieved.asc(), Achievement.created_at.asc())
    if sort == "category":
        return query.order_by(Achievement.category.asc(), Achievement.date_achieved.desc())
    return query.order_by(Achievement.date_achieved.desc(), Achievement.created_at.desc())


@router.get("", response_model=list[AchievementOut])
def list_my_achievements(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    category: str | None = Query(None),
    level: str | None = Query(None),
    q: str | None = Query(None),
    sort: SortOption = Query("newest"),
):
    query = db.query(Achievement).filter(Achievement.user_id == user.id)
    if category:
        query = query.filter(Achievement.category == category.lower())
    if level:
        query = query.filter(Achievement.level == level.lower())
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            Achievement.title.ilike(like)
            | Achievement.description.ilike(like)
            | Achievement.organization.ilike(like)
        )
    return _apply_sort(query, sort).all()


LEVEL_SCORE = {"school": 1, "district": 2, "state": 4, "national": 8, "international": 12}


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def achievement_leaderboard(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    limit: int = Query(50, ge=1, le=100),
):
    achievements = db.query(Achievement).join(User, User.id == Achievement.user_id).filter(User.is_active == True).all()
    scores: dict[UUID, dict] = {}
    for ach in achievements:
        uid = ach.user_id
        if uid not in scores:
            user = db.query(User).filter(User.id == uid).first()
            if not user:
                continue
            scores[uid] = {
                "user": user,
                "achievement_count": 0,
                "score": 0,
            }
        scores[uid]["achievement_count"] += 1
        scores[uid]["score"] += LEVEL_SCORE.get(ach.level, 1)

    ranked = sorted(scores.values(), key=lambda x: (x["score"], x["achievement_count"]), reverse=True)[:limit]
    return [
        LeaderboardEntry(
            user_id=row["user"].id,
            full_name=row["user"].full_name,
            grade=row["user"].grade,
            school_name=row["user"].school_name,
            is_verified=row["user"].is_verified,
            achievement_count=row["achievement_count"],
            score=row["score"],
        )
        for row in ranked
    ]


@router.get("/user/{user_id}", response_model=list[AchievementOut])
def list_user_achievements(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    category: str | None = Query(None),
    level: str | None = Query(None),
    q: str | None = Query(None),
    sort: SortOption = Query("newest"),
):
    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Achievement).filter(Achievement.user_id == user_id)
    if category:
        query = query.filter(Achievement.category == category.lower())
    if level:
        query = query.filter(Achievement.level == level.lower())
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            Achievement.title.ilike(like)
            | Achievement.description.ilike(like)
            | Achievement.organization.ilike(like)
        )
    return _apply_sort(query, sort).all()


@router.post("", response_model=AchievementOut, status_code=201)
def create_achievement(
    body: AchievementCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = Achievement(user_id=user.id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{achievement_id}", response_model=AchievementOut)
def update_achievement(
    achievement_id: UUID,
    body: AchievementUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = _get_owned_achievement(db, achievement_id, user.id)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{achievement_id}")
def delete_achievement(
    achievement_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = _get_owned_achievement(db, achievement_id, user.id)
    db.delete(item)
    db.commit()
    return {"message": "Achievement deleted"}
