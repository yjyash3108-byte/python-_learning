from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    other_user_id: UUID


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class MessageOut(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    created_at: datetime
    read_at: datetime | None
    is_mine: bool

    model_config = {"from_attributes": True}


class ConversationParticipant(BaseModel):
    id: UUID
    full_name: str
    profile_picture_url: str | None

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: UUID
    other_user: ConversationParticipant
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int


class CanMessageOut(BaseModel):
    can_message: bool
    reason: str | None = None
