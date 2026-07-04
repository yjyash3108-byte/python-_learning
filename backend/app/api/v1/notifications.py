from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Notification, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: UUID
    type: str
    message: str
    is_read: bool
    reference_id: str | None
    actor_id: UUID | None = None
    actor_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


def _serialize(db: Session, n: Notification) -> NotificationOut:
    actor_name = None
    if n.actor_id:
        actor = db.query(User).filter(User.id == n.actor_id).first()
        actor_name = actor.full_name if actor else None
    return NotificationOut(
        id=n.id,
        type=n.type,
        message=n.message,
        is_read=n.is_read,
        reference_id=n.reference_id,
        actor_id=n.actor_id,
        actor_name=actor_name,
        created_at=n.created_at,
    )


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    unread_only: bool = False,
    limit: int = 50,
):
    q = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    rows = q.order_by(Notification.created_at.desc()).limit(min(limit, 100)).all()
    return [_serialize(db, n) for n in rows]


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.post("/read-all")
def mark_all_read(user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}
