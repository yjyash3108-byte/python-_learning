from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Conversation, DirectMessage, User
from app.schemas.messages import (
    CanMessageOut,
    ConversationCreate,
    ConversationOut,
    ConversationParticipant,
    MessageCreate,
    MessageOut,
)
from app.services.messages import ordered_participant_ids, users_mutually_follow
from app.services.moderation import require_allowed_content
from app.services.privacy import get_blocked_user_ids, is_blocked, require_not_blocked, require_verified_email

router = APIRouter(prefix="/messages", tags=["messages"])


def _get_conversation_for_user(db: Session, conversation_id: UUID, user_id: UUID) -> Conversation:
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            or_(
                Conversation.participant_a_id == user_id,
                Conversation.participant_b_id == user_id,
            ),
        )
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


def _other_user_id(conv: Conversation, viewer_id: UUID) -> UUID:
    return conv.participant_b_id if conv.participant_a_id == viewer_id else conv.participant_a_id


def _serialize_conversation(db: Session, conv: Conversation, viewer: User) -> ConversationOut:
    other_id = _other_user_id(conv, viewer.id)
    other = db.query(User).filter(User.id == other_id, User.is_active == True).first()
    last_msg = (
        db.query(DirectMessage)
        .filter(DirectMessage.conversation_id == conv.id)
        .order_by(DirectMessage.created_at.desc())
        .first()
    )
    unread = (
        db.query(DirectMessage)
        .filter(
            DirectMessage.conversation_id == conv.id,
            DirectMessage.sender_id != viewer.id,
            DirectMessage.read_at.is_(None),
        )
        .count()
    )
    return ConversationOut(
        id=conv.id,
        other_user=ConversationParticipant(
            id=other.id,
            full_name=other.full_name,
            profile_picture_url=other.profile_picture_url,
        )
        if other
        else ConversationParticipant(id=other_id, full_name="Unknown", profile_picture_url=None),
        last_message=last_msg.content if last_msg else None,
        last_message_at=last_msg.created_at if last_msg else conv.updated_at,
        unread_count=unread,
    )


@router.get("/can-message/{other_user_id}", response_model=CanMessageOut)
def can_message_user(
    other_user_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if other_user_id == user.id:
        return CanMessageOut(can_message=False, reason="Cannot message yourself")
    other = db.query(User).filter(User.id == other_user_id, User.is_active == True).first()
    if not other:
        return CanMessageOut(can_message=False, reason="User not found")
    if not users_mutually_follow(db, user.id, other_user_id):
        return CanMessageOut(
            can_message=False,
            reason="Both students must follow each other to message",
        )
    if is_blocked(db, user.id, other_user_id):
        return CanMessageOut(can_message=False, reason="Messaging is not available")
    if not user.is_verified:
        return CanMessageOut(can_message=False, reason="Verify your email to send messages")
    return CanMessageOut(can_message=True)


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    convs = (
        db.query(Conversation)
        .filter(
            or_(
                Conversation.participant_a_id == user.id,
                Conversation.participant_b_id == user.id,
            )
        )
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    blocked = get_blocked_user_ids(db, user.id)
    filtered = [
        conv
        for conv in convs
        if _other_user_id(conv, user.id) not in blocked
    ]
    return [_serialize_conversation(db, conv, user) for conv in filtered]


@router.post("/conversations", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
def get_or_create_conversation(
    payload: ConversationCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    other_id = payload.other_user_id
    if other_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    other = db.query(User).filter(User.id == other_id, User.is_active == True).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")
    if not users_mutually_follow(db, user.id, other_id):
        raise HTTPException(
            status_code=403,
            detail="Both students must follow each other to start messaging",
        )
    require_not_blocked(db, user.id, other_id)
    require_verified_email(user)

    a_id, b_id = ordered_participant_ids(user.id, other_id)
    conv = (
        db.query(Conversation)
        .filter(Conversation.participant_a_id == a_id, Conversation.participant_b_id == b_id)
        .first()
    )
    if not conv:
        conv = Conversation(participant_a_id=a_id, participant_b_id=b_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return _serialize_conversation(db, conv, user)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(
    conversation_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(50, le=100),
):
    conv = _get_conversation_for_user(db, conversation_id, user.id)
    rows = (
        db.query(DirectMessage)
        .filter(DirectMessage.conversation_id == conv.id)
        .order_by(DirectMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    return [
        MessageOut(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_id=msg.sender_id,
            content=msg.content,
            created_at=msg.created_at,
            read_at=msg.read_at,
            is_mine=msg.sender_id == user.id,
        )
        for msg in rows
    ]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conv = _get_conversation_for_user(db, conversation_id, user.id)
    other_id = _other_user_id(conv, user.id)
    if not users_mutually_follow(db, user.id, other_id):
        raise HTTPException(status_code=403, detail="Messaging requires mutual follow")
    require_not_blocked(db, user.id, other_id)
    require_verified_email(user)

    require_allowed_content(payload.content)

    from datetime import datetime, timezone

    msg = DirectMessage(
        conversation_id=conv.id,
        sender_id=user.id,
        content=payload.content.strip(),
    )
    db.add(msg)
    db.flush()
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        content=msg.content,
        created_at=msg.created_at,
        read_at=msg.read_at,
        is_mine=True,
    )


@router.post("/conversations/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from datetime import datetime, timezone

    conv = _get_conversation_for_user(db, conversation_id, user.id)
    now = datetime.now(timezone.utc)
    (
        db.query(DirectMessage)
        .filter(
            DirectMessage.conversation_id == conv.id,
            DirectMessage.sender_id != user.id,
            DirectMessage.read_at.is_(None),
        )
        .update({DirectMessage.read_at: now}, synchronize_session=False)
    )
    db.commit()
    return {"message": "Marked as read"}


@router.get("/conversations/{conversation_id}/poll", response_model=list[MessageOut])
def poll_messages(
    conversation_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    after: str | None = Query(None),
):
    from datetime import datetime

    conv = _get_conversation_for_user(db, conversation_id, user.id)
    query = db.query(DirectMessage).filter(DirectMessage.conversation_id == conv.id)
    if after:
        try:
            since = datetime.fromisoformat(after.replace("Z", "+00:00"))
            query = query.filter(DirectMessage.created_at > since)
        except ValueError:
            pass
    messages = query.order_by(DirectMessage.created_at.asc()).all()
    return [
        MessageOut(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            content=m.content,
            created_at=m.created_at,
            read_at=m.read_at,
            is_mine=m.sender_id == user.id,
        )
        for m in messages
    ]
