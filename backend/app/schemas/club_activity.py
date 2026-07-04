from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ClubEventCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    location: str | None = Field(default=None, max_length=300)
    starts_at: datetime
    ends_at: datetime | None = None

    @field_validator("ends_at")
    @classmethod
    def validate_ends_at(cls, ends_at: datetime | None, info) -> datetime | None:
        starts_at = info.data.get("starts_at")
        if ends_at and starts_at and ends_at < starts_at:
            raise ValueError("ends_at must be after starts_at")
        return ends_at


class ClubEventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    location: str | None = Field(default=None, max_length=300)
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class ClubEventOut(BaseModel):
    id: UUID
    club_id: UUID
    creator_id: UUID
    title: str
    description: str
    location: str | None
    starts_at: datetime
    ends_at: datetime | None
    rsvp_count: int
    is_rsvped: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ClubAnnouncementCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1, max_length=5000)
    is_pinned: bool = False


class ClubAnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    content: str | None = Field(default=None, min_length=1, max_length=5000)
    is_pinned: bool | None = None


class ClubAnnouncementOut(BaseModel):
    id: UUID
    club_id: UUID
    author_id: UUID
    author_name: str
    title: str
    content: str
    is_pinned: bool
    created_at: datetime

    model_config = {"from_attributes": True}
