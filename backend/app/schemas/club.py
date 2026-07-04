from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

CLUB_CATEGORIES = (
    "coding",
    "robotics",
    "debate",
    "science",
    "art",
    "music",
    "entrepreneurship",
    "fintech",
    "sports",
    "other",
)

CLUB_ROLES = (
    "owner",
    "president",
    "vice_president",
    "secretary",
    "treasurer",
    "moderator",
    "admin",
    "member",
)


class ClubCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="", max_length=2000)
    category: str = Field(default="other")
    emoji: str = Field(default="🌐", max_length=10)
    color: str = Field(default="#6366f1", max_length=20)
    school_name: str | None = Field(default=None, max_length=120)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in CLUB_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(CLUB_CATEGORIES)}")
        return normalized


class ClubUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    category: str | None = None
    emoji: str | None = Field(default=None, max_length=10)
    color: str | None = Field(default=None, max_length=20)
    school_name: str | None = Field(default=None, max_length=120)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.lower().strip()
        if normalized not in CLUB_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(CLUB_CATEGORIES)}")
        return normalized


class ClubCreatorOut(BaseModel):
    id: UUID
    full_name: str
    profile_picture_url: str | None = None

    model_config = {"from_attributes": True}


class ClubOut(BaseModel):
    id: UUID
    name: str
    description: str
    category: str
    emoji: str
    color: str
    creator_id: UUID
    school_name: str | None
    member_count: int
    is_verified: bool
    is_member: bool
    my_role: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ClubDetailOut(ClubOut):
    creator: ClubCreatorOut
    admin_count: int


class ClubMemberOut(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    profile_picture_url: str | None
    school_name: str
    grade: int
    role: str
    joined_at: datetime


class ClubActionResponse(BaseModel):
    message: str
    club: ClubOut


class ClubLimitsOut(BaseModel):
    is_pro: bool
    clubs_created: int
    max_clubs_created: int | None
    can_create_club: bool
    upgrade_required: bool


class MemberGrowthPoint(BaseModel):
    date: date
    joins: int


class ClubAnalyticsOut(BaseModel):
    member_count: int
    event_count: int
    announcement_count: int
    upcoming_events: int
    new_members_7d: int
    total_rsvps: int
    member_growth: list[MemberGrowthPoint]
    is_pro: bool
    can_view_advanced: bool
