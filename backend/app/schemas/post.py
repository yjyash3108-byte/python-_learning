from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


def _validate_http_url(v: str | None) -> str | None:
    if v is None or not str(v).strip():
        return None
    url = str(v).strip()
    if not url.startswith(("http://", "https://")):
        raise ValueError("Link must start with http:// or https://")
    return url


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    category: str = "other"
    image_urls: list[str] = Field(default_factory=list, max_length=4)
    link_url: str | None = Field(default=None, max_length=500)
    hashtags: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("link_url")
    @classmethod
    def validate_link_url(cls, v: str | None) -> str | None:
        return _validate_http_url(v)


class PostUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1, max_length=2000)
    category: str | None = None
    image_urls: list[str] | None = None
    link_url: str | None = Field(default=None, max_length=500)
    hashtags: list[str] | None = None

    @field_validator("link_url")
    @classmethod
    def validate_link_url(cls, v: str | None) -> str | None:
        return _validate_http_url(v)


class AuthorSummary(BaseModel):
    id: UUID
    full_name: str
    grade: int
    school_name: str
    profile_picture_url: str | None

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentOut(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    author: AuthorSummary | None = None

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: UUID
    author_id: UUID
    content: str
    category: str
    image_urls: list[str]
    link_url: str | None = None
    hashtags: list[str] = Field(default_factory=list)
    share_count: int
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    created_at: datetime
    updated_at: datetime
    author: AuthorSummary | None = None

    model_config = {"from_attributes": True}


class PaginatedPosts(BaseModel):
    items: list[PostOut]
    total: int
    page: int
    page_size: int
    has_more: bool
