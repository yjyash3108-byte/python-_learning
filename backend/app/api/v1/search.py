from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, Follow, Opportunity, User
from app.schemas.auth import UserPublic
from app.services.clubs import club_member_count, creator_has_pro
from app.services.privacy import can_view_profile, get_blocked_user_ids

router = APIRouter(prefix="/search", tags=["search"])


class SuggestedUserOut(UserPublic):
    reason: str = ""
    mutual_count: int = 0


@router.get("/suggested-users", response_model=list[SuggestedUserOut])
def suggested_users(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(10, le=20),
):
    following_ids = {
        row[0]
        for row in db.query(Follow.following_id).filter(Follow.follower_id == user.id).all()
    }
    following_ids.add(user.id)

    my_skills = set(user.skills or []) | set(user.interests or [])

    candidates: dict[UUID, tuple[User, int, str]] = {}

    def add_candidate(u: User, score: int, reason: str) -> None:
        if u.id in following_ids:
            return
        if u.id in get_blocked_user_ids(db, user.id):
            return
        if not can_view_profile(db, user, u):
            return
        existing = candidates.get(u.id)
        if existing is None or score > existing[1]:
            candidates[u.id] = (u, score, reason)

    same_school = (
        db.query(User)
        .filter(User.is_active == True, User.school_name == user.school_name, User.id.notin_(following_ids))
        .limit(30)
        .all()
    )
    for u in same_school:
        add_candidate(u, 3, f"Goes to {user.school_name}")

    if my_skills:
        skill_users = (
            db.query(User)
            .filter(User.is_active == True, User.id.notin_(following_ids))
            .limit(50)
            .all()
        )
        for u in skill_users:
            overlap = len(my_skills & (set(u.skills or []) | set(u.interests or [])))
            if overlap > 0:
                add_candidate(u, 2 + overlap, f"{overlap} shared skill{'s' if overlap > 1 else ''}")

    if following_ids:
        friends_of_friends = (
            db.query(Follow.following_id, Follow.follower_id)
            .filter(Follow.follower_id.in_(following_ids - {user.id}))
            .limit(100)
            .all()
        )
        mutual_map: dict[UUID, int] = {}
        for following_id, follower_id in friends_of_friends:
            if following_id in following_ids:
                continue
            mutual_map[following_id] = mutual_map.get(following_id, 0) + 1
        for uid, count in mutual_map.items():
            u = db.query(User).filter(User.id == uid, User.is_active == True).first()
            if u:
                add_candidate(u, 4 + count, f"{count} mutual connection{'s' if count > 1 else ''}")

    ranked = sorted(candidates.values(), key=lambda x: x[1], reverse=True)[:limit]
    out: list[SuggestedUserOut] = []
    for u, _, reason in ranked:
        mutual = (
            db.query(Follow.id)
            .filter(
                Follow.follower_id.in_(following_ids - {user.id}),
                Follow.following_id == u.id,
            )
            .count()
        )
        base = UserPublic.model_validate(u)
        out.append(SuggestedUserOut(**base.model_dump(), reason=reason, mutual_count=mutual))
    return out


@router.get("/students", response_model=list[UserPublic])
def search_students(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=0),
    grade: int | None = None,
    skill: str | None = None,
    school: str | None = None,
    city: str | None = None,
    interest: str | None = None,
    limit: int = Query(20, le=50),
):
    query = db.query(User).filter(User.is_active == True)
    blocked = get_blocked_user_ids(db, _.id)
    if blocked:
        query = query.filter(~User.id.in_(blocked))
    if q:
        query = query.filter(
            or_(User.full_name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%"), User.username.ilike(f"%{q}%"))
        )
    if grade:
        query = query.filter(User.grade == grade)
    if skill:
        query = query.filter(User.skills.any(skill))
    if school:
        query = query.filter(User.school_name.ilike(f"%{school}%"))
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))
    if interest:
        query = query.filter(User.interests.any(interest))
    results = query.limit(limit * 2).all()
    return [u for u in results if can_view_profile(db, _, u)][:limit]


@router.get("/global")
def global_search(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=1),
    limit: int = Query(8, le=20),
):
    term = q.strip()
    if not term:
        return {"students": [], "schools": [], "clubs": [], "opportunities": []}
    blocked = get_blocked_user_ids(db, user.id)
    students_q = db.query(User).filter(User.is_active == True)
    if blocked:
        students_q = students_q.filter(~User.id.in_(blocked))
    students_q = students_q.filter(
        or_(User.full_name.ilike(f"%{term}%"), User.username.ilike(f"%{term}%"))
    )
    students = [u for u in students_q.limit(limit * 2).all() if can_view_profile(db, user, u)][:limit]

    schools_rows = (
        db.query(User.school_name)
        .filter(User.is_active == True, User.school_name.ilike(f"%{term}%"))
        .distinct()
        .limit(limit)
        .all()
    )
    schools = [{"name": r[0], "count": db.query(User).filter(User.school_name == r[0]).count()} for r in schools_rows]

    like = f"%{term}%"
    club_rows = (
        db.query(Club)
        .filter(or_(Club.name.ilike(like), Club.description.ilike(like)))
        .order_by(Club.created_at.desc())
        .limit(limit)
        .all()
    )
    clubs = [
        {
            "id": str(club.id),
            "name": club.name,
            "emoji": club.emoji,
            "member_count": club_member_count(db, club.id),
        }
        for club in club_rows
    ]

    opp_rows = (
        db.query(Opportunity)
        .filter(Opportunity.is_active == True)
        .filter(
            or_(
                Opportunity.title.ilike(like),
                Opportunity.organization.ilike(like),
                Opportunity.description.ilike(like),
            )
        )
        .limit(limit)
        .all()
    )
    opportunities = [
        {"id": str(o.id), "title": o.title, "organization": o.organization, "opportunity_type": o.opportunity_type}
        for o in opp_rows
    ]

    return {
        "students": [UserPublic.model_validate(u).model_dump() for u in students],
        "schools": schools,
        "clubs": clubs,
        "opportunities": opportunities,
    }


@router.get("/trending/schools")
def trending_schools(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    limit: int = Query(8, le=15),
):
    from sqlalchemy import func

    rows = (
        db.query(User.school_name, func.count(User.id).label("count"))
        .filter(User.is_active == True, User.school_name.isnot(None), User.school_name != "")
        .group_by(User.school_name)
        .order_by(func.count(User.id).desc())
        .limit(limit)
        .all()
    )
    return [{"name": r[0], "count": r[1]} for r in rows]


@router.get("/schools")
def search_schools(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=0),
    limit: int = Query(20, le=50),
):
    query = db.query(User.school_name).filter(User.is_active == True).distinct()
    if q:
        query = query.filter(User.school_name.ilike(f"%{q}%"))
    rows = query.limit(limit).all()
    return [{"name": r[0], "count": db.query(User).filter(User.school_name == r[0]).count()} for r in rows]


@router.get("/skills")
def search_skills(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=0),
):
    users = db.query(User.skills).filter(User.is_active == True).all()
    skills: set[str] = set()
    for (user_skills,) in users:
        if user_skills:
            for s in user_skills:
                if not q or q.lower() in s.lower():
                    skills.add(s)
    return sorted(skills)[:30]


@router.get("/clubs")
def search_clubs(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str = Query("", min_length=0),
    limit: int = Query(20, le=50),
):
    query = db.query(Club)
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(or_(Club.name.ilike(like), Club.description.ilike(like)))
    clubs = query.order_by(Club.created_at.desc()).limit(limit).all()
    return [
        {
            "id": str(club.id),
            "name": club.name,
            "emoji": club.emoji,
            "color": club.color,
            "category": club.category,
            "member_count": club_member_count(db, club.id),
            "is_verified": creator_has_pro(db, club),
        }
        for club in clubs
    ]
