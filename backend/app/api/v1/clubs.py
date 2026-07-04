from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, ClubMember, User
from app.schemas.club import (
    ClubActionResponse,
    ClubCreate,
    ClubDetailOut,
    ClubLimitsOut,
    ClubMemberOut,
    ClubOut,
    ClubUpdate,
)
from app.services.clubs import (
    ADMIN_ROLES,
    can_add_admin,
    can_create_club,
    can_join_club,
    club_admin_count,
    club_member_count,
    clubs_created_count,
    creator_has_pro,
    get_membership,
    is_club_admin,
    is_club_owner,
)
from app.services.subscription import user_has_pro

router = APIRouter(prefix="/clubs", tags=["clubs"])


def _serialize_club(db: Session, club: Club, viewer: User) -> ClubOut:
    membership = get_membership(db, club.id, viewer.id)
    return ClubOut(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        emoji=club.emoji,
        color=club.color,
        creator_id=club.creator_id,
        school_name=club.school_name,
        member_count=club_member_count(db, club.id),
        is_verified=creator_has_pro(db, club),
        is_member=membership is not None,
        my_role=membership.role if membership else None,
        created_at=club.created_at,
    )


def _get_club_or_404(db: Session, club_id: UUID) -> Club:
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.get("/limits", response_model=ClubLimitsOut)
def get_club_limits(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    is_pro = user_has_pro(db, user.id)
    created = clubs_created_count(db, user.id)
    max_created = None if is_pro else settings.FREE_MAX_CLUBS_CREATED
    can_create, _ = can_create_club(db, user)
    return ClubLimitsOut(
        is_pro=is_pro,
        clubs_created=created,
        max_clubs_created=max_created,
        can_create_club=can_create,
        upgrade_required=not is_pro and created >= settings.FREE_MAX_CLUBS_CREATED,
    )


@router.get("/my", response_model=list[ClubOut])
def list_my_clubs(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club_ids = (
        db.query(ClubMember.club_id).filter(ClubMember.user_id == user.id).all()
    )
    ids = [row[0] for row in club_ids]
    if not ids:
        return []
    clubs = db.query(Club).filter(Club.id.in_(ids)).order_by(Club.created_at.desc()).all()
    return [_serialize_club(db, club, user) for club in clubs]


@router.get("", response_model=list[ClubOut])
def list_clubs(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    q: str = Query("", min_length=0),
    category: str | None = Query(None),
    limit: int = Query(50, le=100),
):
    query = db.query(Club)
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(or_(Club.name.ilike(like), Club.description.ilike(like)))
    if category:
        query = query.filter(Club.category == category.lower())
    clubs = query.order_by(Club.created_at.desc()).limit(limit).all()
    return [_serialize_club(db, club, user) for club in clubs]


@router.get("/trending", response_model=list[ClubOut])
def trending_clubs(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(6, le=20),
):
    clubs = db.query(Club).order_by(Club.created_at.desc()).limit(100).all()
    ranked = sorted(clubs, key=lambda c: club_member_count(db, c.id), reverse=True)
    return [_serialize_club(db, club, user) for club in ranked[:limit]]


@router.post("", response_model=ClubOut, status_code=status.HTTP_201_CREATED)
def create_club(
    payload: ClubCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    allowed, reason = can_create_club(db, user)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=reason,
        )

    existing = db.query(Club).filter(Club.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="A club with this name already exists")

    club = Club(
        name=payload.name.strip(),
        description=payload.description.strip(),
        category=payload.category,
        emoji=payload.emoji,
        color=payload.color,
        creator_id=user.id,
        school_name=payload.school_name or user.school_name,
    )
    db.add(club)
    db.flush()
    db.add(ClubMember(club_id=club.id, user_id=user.id, role="owner"))
    db.commit()
    db.refresh(club)
    return _serialize_club(db, club, user)


@router.get("/{club_id}", response_model=ClubDetailOut)
def get_club(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    base = _serialize_club(db, club, user)
    creator = db.query(User).filter(User.id == club.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Club creator not found")
    return ClubDetailOut(
        **base.model_dump(),
        creator={
            "id": creator.id,
            "full_name": creator.full_name,
            "profile_picture_url": creator.profile_picture_url,
        },
        admin_count=club_admin_count(db, club.id),
    )


@router.patch("/{club_id}", response_model=ClubOut)
def update_club(
    club_id: UUID,
    payload: ClubUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can update this club")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"]:
        data["name"] = data["name"].strip()
        taken = (
            db.query(Club)
            .filter(Club.name.ilike(data["name"]), Club.id != club.id)
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="A club with this name already exists")
    for key, value in data.items():
        setattr(club, key, value)
    db.commit()
    db.refresh(club)
    return _serialize_club(db, club, user)


@router.delete("/{club_id}")
def delete_club(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_owner(membership):
        raise HTTPException(status_code=403, detail="Only the club owner can delete this club")
    db.delete(club)
    db.commit()
    return {"message": "Club deleted"}


@router.post("/{club_id}/join", response_model=ClubActionResponse)
def join_club(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    if get_membership(db, club.id, user.id):
        return ClubActionResponse(
            message="Already a member",
            club=_serialize_club(db, club, user),
        )

    allowed, reason = can_join_club(db, club)
    if not allowed:
        raise HTTPException(status_code=403, detail=reason)

    db.add(ClubMember(club_id=club.id, user_id=user.id, role="member"))
    db.commit()
    db.refresh(club)
    return ClubActionResponse(
        message="Joined club",
        club=_serialize_club(db, club, user),
    )


@router.delete("/{club_id}/leave", response_model=ClubActionResponse)
def leave_club(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not membership:
        raise HTTPException(status_code=400, detail="You are not a member of this club")
    if is_club_owner(membership):
        raise HTTPException(
            status_code=400,
            detail="Club owner cannot leave. Transfer ownership or delete the club.",
        )
    db.delete(membership)
    db.commit()
    return ClubActionResponse(
        message="Left club",
        club=_serialize_club(db, club, user),
    )


@router.get("/{club_id}/members", response_model=list[ClubMemberOut])
def list_club_members(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    rows = (
        db.query(ClubMember, User)
        .join(User, User.id == ClubMember.user_id)
        .filter(ClubMember.club_id == club.id, User.is_active == True)
        .order_by(ClubMember.joined_at.asc())
        .all()
    )
    return [
        ClubMemberOut(
            id=member.id,
            user_id=user_row.id,
            full_name=user_row.full_name,
            profile_picture_url=user_row.profile_picture_url,
            school_name=user_row.school_name,
            grade=user_row.grade,
            role=member.role,
            joined_at=member.joined_at,
        )
        for member, user_row in rows
    ]


@router.post("/{club_id}/admins/{target_user_id}", response_model=ClubActionResponse)
def add_club_admin(
    club_id: UUID,
    target_user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    actor = get_membership(db, club.id, user.id)
    if not is_club_owner(actor):
        raise HTTPException(status_code=403, detail="Only the club owner can add admins")

    allowed, reason = can_add_admin(db, club)
    if not allowed:
        raise HTTPException(status_code=403, detail=reason)

    target = get_membership(db, club.id, target_user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User is not a member of this club")
    if target.role in ADMIN_ROLES:
        return ClubActionResponse(
            message="User is already an admin",
            club=_serialize_club(db, club, user),
        )

    target.role = "admin"
    db.commit()
    return ClubActionResponse(
        message="Admin added",
        club=_serialize_club(db, club, user),
    )


@router.delete("/{club_id}/admins/{target_user_id}", response_model=ClubActionResponse)
def remove_club_admin(
    club_id: UUID,
    target_user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    actor = get_membership(db, club.id, user.id)
    if not is_club_owner(actor):
        raise HTTPException(status_code=403, detail="Only the club owner can remove admins")

    target = get_membership(db, club.id, target_user_id)
    if not target or target.role != "admin":
        raise HTTPException(status_code=404, detail="User is not an admin of this club")

    target.role = "member"
    db.commit()
    return ClubActionResponse(
        message="Admin removed",
        club=_serialize_club(db, club, user),
    )


@router.patch("/{club_id}/members/{target_user_id}/role", response_model=ClubActionResponse)
def set_member_role(
    club_id: UUID,
    target_user_id: UUID,
    role: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.schemas.club import CLUB_ROLES

    if role not in CLUB_ROLES or role == "owner":
        raise HTTPException(status_code=400, detail="Invalid role")
    club = _get_club_or_404(db, club_id)
    actor = get_membership(db, club.id, user.id)
    if not is_club_owner(actor) and (not actor or actor.role not in ADMIN_ROLES):
        raise HTTPException(status_code=403, detail="Not authorized to change roles")
    target = get_membership(db, club.id, target_user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot change owner role")
    target.role = role
    db.commit()
    return ClubActionResponse(message="Role updated", club=_serialize_club(db, club, user))
