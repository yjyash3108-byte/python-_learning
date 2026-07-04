from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Follow


def users_mutually_follow(db: Session, user_a: UUID, user_b: UUID) -> bool:
    if user_a == user_b:
        return False
    a_follows_b = (
        db.query(Follow.id)
        .filter(Follow.follower_id == user_a, Follow.following_id == user_b)
        .first()
        is not None
    )
    b_follows_a = (
        db.query(Follow.id)
        .filter(Follow.follower_id == user_b, Follow.following_id == user_a)
        .first()
        is not None
    )
    return a_follows_b and b_follows_a


def ordered_participant_ids(user_a: UUID, user_b: UUID) -> tuple[UUID, UUID]:
    if str(user_a) < str(user_b):
        return user_a, user_b
    return user_b, user_a
