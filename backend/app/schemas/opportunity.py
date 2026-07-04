from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OpportunityOut(BaseModel):
    id: UUID
    title: str
    organization: str
    opportunity_type: str
    description: str
    skills_required: list[str]
    link_url: str | None
    deadline: date | None
    match_score: int = 0
    matched_skills: list[str] = Field(default_factory=list)
    has_applied: bool = False
    is_saved: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class OpportunityApplyResponse(BaseModel):
    message: str
    has_applied: bool
    link_url: str | None = None


class OpportunityCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    organization: str = Field(min_length=2, max_length=200)
    opportunity_type: str = Field(default="internship", max_length=50)
    description: str = Field(default="", max_length=2000)
    skills_required: list[str] = Field(default_factory=list)
    link_url: str | None = Field(default=None, max_length=500)
    deadline: date | None = None


class OpportunityUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    organization: str | None = Field(default=None, min_length=2, max_length=200)
    opportunity_type: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=2000)
    skills_required: list[str] | None = None
    link_url: str | None = Field(default=None, max_length=500)
    deadline: date | None = None
    is_active: bool | None = None


class AssistantMessage(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AssistantResponse(BaseModel):
    reply: str
    powered_by: str
