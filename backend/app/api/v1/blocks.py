from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import User

router = APIRouter(prefix="/blocks", tags=["blocks"])


@router.get("")
def list_blocked(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.services.privacy import get_blocked_user_ids

    blocked_ids = get_blocked_user_ids(db, user.id)
    users = db.query(User).filter(User.id.in_(blocked_ids)).all() if blocked_ids else []
    return [{"id": str(u.id), "full_name": u.full_name, "username": u.username} for u in users]


@router.post("/{user_id}")
def block_user(
    user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.models import BlockedUser

    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = (
        db.query(BlockedUser)
        .filter(BlockedUser.blocker_id == user.id, BlockedUser.blocked_id == user_id)
        .first()
    )
    if not existing:
        db.add(BlockedUser(blocker_id=user.id, blocked_id=user_id))
        db.commit()
    return {"message": "User blocked"}


@router.delete("/{user_id}")
def unblock_user(
    user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.models import BlockedUser

    row = (
        db.query(BlockedUser)
        .filter(BlockedUser.blocker_id == user.id, BlockedUser.blocked_id == user_id)
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return {"message": "User unblocked"}
