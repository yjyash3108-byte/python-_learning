from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PortfolioCreate(BaseModel):
    item_type: str = Field(pattern="^(project|certificate|achievement|competition|hackathon|olympiad)$")
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    image_url: str | None = None
    link_url: str | None = None
    tags: list[str] = Field(default_factory=list)


class PortfolioUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    tags: list[str] | None = None


class PortfolioOut(BaseModel):
    id: UUID
    user_id: UUID
    item_type: str
    title: str
    description: str
    image_url: str | None
    link_url: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
