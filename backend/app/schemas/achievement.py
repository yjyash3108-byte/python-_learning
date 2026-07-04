from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator

ACHIEVEMENT_CATEGORIES = (
    "academic",
    "coding",
    "hackathon",
    "olympiad",
    "sports",
    "debate",
    "music",
    "art",
    "entrepreneurship",
    "leadership",
    "volunteering",
    "other",
)

ACHIEVEMENT_LEVELS = ("school", "district", "state", "national", "international")


class AchievementBase(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    category: str
    description: str = Field(default="", max_length=2000)
    organization: str = Field(default="", max_length=200)
    level: str
    rank: str | None = Field(default=None, max_length=120)
    date_achieved: date
    image_url: str | None = Field(default=None, max_length=500)
    certificate_file_url: str | None = Field(default=None, max_length=500)
    verification_link: str | None = Field(default=None, max_length=500)
    skills_gained: list[str] = Field(default_factory=list)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in ACHIEVEMENT_CATEGORIES:
            raise ValueError("Invalid achievement category")
        return normalized

    @field_validator("level")
    @classmethod
    def validate_level(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in ACHIEVEMENT_LEVELS:
            raise ValueError("Invalid achievement level")
        return normalized

    @field_validator("skills_gained")
    @classmethod
    def validate_skills(cls, value: list[str]) -> list[str]:
        cleaned = [skill.strip() for skill in value if skill.strip()]
        if len(cleaned) > 20:
            raise ValueError("Maximum 20 skills allowed")
        return cleaned[:20]


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    category: str | None = None
    description: str | None = Field(default=None, max_length=2000)
    organization: str | None = Field(default=None, max_length=200)
    level: str | None = None
    rank: str | None = Field(default=None, max_length=120)
    date_achieved: date | None = None
    image_url: str | None = Field(default=None, max_length=500)
    certificate_file_url: str | None = Field(default=None, max_length=500)
    verification_link: str | None = Field(default=None, max_length=500)
    skills_gained: list[str] | None = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.lower().strip()
        if normalized not in ACHIEVEMENT_CATEGORIES:
            raise ValueError("Invalid achievement category")
        return normalized

    @field_validator("level")
    @classmethod
    def validate_level(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.lower().strip()
        if normalized not in ACHIEVEMENT_LEVELS:
            raise ValueError("Invalid achievement level")
        return normalized


class AchievementOut(AchievementBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    user_id: UUID
    full_name: str
    grade: int
    school_name: str
    is_verified: bool
    achievement_count: int
    score: int = 0
