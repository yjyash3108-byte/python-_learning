import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Follow, Notification, User
from app.schemas.auth import UserPublic
from app.schemas.follow import FollowActionResponse, FollowStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["follows"])


def _follower_count(db: Session, user_id: UUID) -> int:
    return db.query(func.count(Follow.id)).filter(Follow.following_id == user_id).scalar() or 0


def _following_count(db: Session, user_id: UUID) -> int:
    return db.query(func.count(Follow.id)).filter(Follow.follower_id == user_id).scalar() or 0


def _is_following(db: Session, follower_id: UUID, following_id: UUID) -> bool:
    return (
        db.query(Follow.id)
        .filter(Follow.follower_id == follower_id, Follow.following_id == following_id)
        .first()
        is not None
    )


def _get_active_user(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


@router.post("/follow/{user_id}", response_model=FollowActionResponse)
def follow_user(
    user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.services.privacy import is_blocked

    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    if is_blocked(db, user.id, user_id):
        raise HTTPException(status_code=403, detail="Cannot follow this user")
    target = _get_active_user(db, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(Follow)
        .filter(Follow.follower_id == user.id, Follow.following_id == user_id)
        .first()
    )
    if not existing:
        db.add(Follow(follower_id=user.id, following_id=user_id))
        db.add(
            Notification(
                user_id=user_id,
                actor_id=user.id,
                type="follow",
                message=f"{user.full_name} started following you",
                reference_id=str(user.id),
            )
        )
        db.commit()
        logger.info("User %s followed %s", user.id, user_id)
    else:
        logger.info("User %s already follows %s", user.id, user_id)

    return FollowActionResponse(
        message="Followed" if not existing else "Already following",
        is_following=True,
        followers=_follower_count(db, user_id),
        following=_following_count(db, user_id),
    )


@router.delete("/follow/{user_id}", response_model=FollowActionResponse)
def unfollow_user(
    user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")

    follow = (
        db.query(Follow)
        .filter(Follow.follower_id == user.id, Follow.following_id == user_id)
        .first()
    )
    if follow:
        db.delete(follow)
        db.commit()
        logger.info("User %s unfollowed %s", user.id, user_id)

    return FollowActionResponse(
        message="Unfollowed",
        is_following=False,
        followers=_follower_count(db, user_id),
        following=_following_count(db, user_id),
    )


@router.get("/followers/{user_id}", response_model=list[UserPublic])
def get_followers(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    if not _get_active_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    ids = db.query(Follow.follower_id).filter(Follow.following_id == user_id).all()
    user_ids = [row[0] for row in ids]
    if not user_ids:
        return []
    return db.query(User).filter(User.id.in_(user_ids), User.is_active == True).all()


@router.get("/following/{user_id}", response_model=list[UserPublic])
def get_following(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    if not _get_active_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    ids = db.query(Follow.following_id).filter(Follow.follower_id == user_id).all()
    user_ids = [row[0] for row in ids]
    if not user_ids:
        return []
    return db.query(User).filter(User.id.in_(user_ids), User.is_active == True).all()


@router.get("/follow/status/{user_id}", response_model=FollowStatusResponse)
def follow_status(
    user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not _get_active_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return FollowStatusResponse(
        followers=_follower_count(db, user_id),
        following=_following_count(db, user_id),
        is_following=_is_following(db, user.id, user_id),
        is_self=user.id == user_id,
    )
