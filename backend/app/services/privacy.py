from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import BlockedUser, Follow, User


def get_profile_visibility(user: User) -> str:
    links = user.social_links or {}
    value = links.get("profile_visibility", "public")
    return value if value in {"public", "school", "connections"} else "public"


def is_blocked(db: Session, user_a: UUID, user_b: UUID) -> bool:
    if user_a == user_b:
        return False
    return (
        db.query(BlockedUser)
        .filter(
            or_(
                (BlockedUser.blocker_id == user_a) & (BlockedUser.blocked_id == user_b),
                (BlockedUser.blocker_id == user_b) & (BlockedUser.blocked_id == user_a),
            )
        )
        .first()
        is not None
    )


def get_blocked_user_ids(db: Session, user_id: UUID) -> set[UUID]:
    rows = (
        db.query(BlockedUser)
        .filter(or_(BlockedUser.blocker_id == user_id, BlockedUser.blocked_id == user_id))
        .all()
    )
    blocked: set[UUID] = set()
    for row in rows:
        other = row.blocked_id if row.blocker_id == user_id else row.blocker_id
        blocked.add(other)
    return blocked


def can_view_profile(db: Session, viewer: User | None, target: User) -> bool:
    if not target.is_active:
        return False
    if viewer and viewer.id == target.id:
        return True
    if viewer and is_blocked(db, viewer.id, target.id):
        return False
    visibility = get_profile_visibility(target)
    if visibility == "public":
        return True
    if not viewer:
        return False
    if visibility == "school":
        return viewer.school_name == target.school_name
    if visibility == "connections":
        following = (
            db.query(Follow.id)
            .filter(Follow.follower_id == viewer.id, Follow.following_id == target.id)
            .first()
        )
        return following is not None
    return True


def require_can_view_profile(db: Session, viewer: User | None, target: User) -> None:
    if not can_view_profile(db, viewer, target):
        raise HTTPException(status_code=404, detail="Profile not found")


def require_not_blocked(db: Session, user_a: UUID, user_b: UUID) -> None:
    if is_blocked(db, user_a, user_b):
        raise HTTPException(status_code=403, detail="Action not allowed due to block")


def require_verified_email(user: User) -> None:
    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before posting or messaging. Check your inbox or resend from Settings.",
        )
