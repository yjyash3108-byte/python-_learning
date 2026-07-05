from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.password import validate_password_strength


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=80)
    school_name: str = Field(min_length=2, max_length=120)
    grade: int = Field(ge=4, le=12)
    city: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    dev_reset_url: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_strength(v)


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr | None = None
    username: str | None = None
    full_name: str
    school_name: str
    grade: int
    city: str | None
    bio: str
    skills: list[str]
    interests: list[str]
    career_goals: str
    profile_picture_url: str | None
    social_links: dict | None
    is_verified: bool
    email_verified: bool = False
    onboarding_completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(UserPublic):
    email: EmailStr
    is_admin: bool = False


class PublicProfileOut(BaseModel):
    id: UUID
    username: str | None = None
    full_name: str
    school_name: str
    grade: int
    city: str | None
    bio: str
    skills: list[str]
    interests: list[str]
    career_goals: str
    profile_picture_url: str | None
    is_verified: bool
    created_at: datetime
    cover_primary: str | None = None
    cover_accent: str | None = None

    model_config = {"from_attributes": True}


class PublicAchievementBrief(BaseModel):
    id: UUID
    title: str
    category: str
    level: str
    organization: str
    date_achieved: date

    model_config = {"from_attributes": True}


class PublicProjectBrief(BaseModel):
    id: UUID
    title: str
    description: str
    item_type: str
    tags: list[str]
    link_url: str | None

    model_config = {"from_attributes": True}


class PublicPostBrief(BaseModel):
    id: UUID
    content: str
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicCertificateBrief(BaseModel):
    id: UUID
    title: str
    issuer: str
    issue_date: date
    credential_url: str | None

    model_config = {"from_attributes": True}


class PublicProfileFullOut(PublicProfileOut):
    achievements: list[PublicAchievementBrief] = []
    projects: list[PublicProjectBrief] = []
    posts: list[PublicPostBrief] = []
    certificates: list[PublicCertificateBrief] = []


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=80)
    username: str | None = Field(default=None, min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    school_name: str | None = Field(default=None, min_length=2, max_length=120)
    grade: int | None = Field(default=None, ge=4, le=12)
    city: str | None = None
    bio: str | None = Field(default=None, max_length=500)
    skills: list[str] | None = None
    interests: list[str] | None = None
    career_goals: str | None = Field(default=None, max_length=500)
    social_links: dict | None = None
    onboarding_completed: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
    password: str
