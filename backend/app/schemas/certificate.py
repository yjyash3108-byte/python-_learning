from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CertificateBase(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    issuer: str = Field(min_length=2, max_length=200)
    certificate_number: str | None = Field(default=None, max_length=120)
    issue_date: date
    expiry_date: date | None = None
    credential_url: str | None = Field(default=None, max_length=500)
    file_url: str | None = Field(default=None, max_length=500)

    @field_validator("expiry_date")
    @classmethod
    def validate_expiry(cls, expiry: date | None, info):
        issue_date = info.data.get("issue_date")
        if expiry and issue_date and expiry < issue_date:
            raise ValueError("Expiry date cannot be before issue date")
        return expiry


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    issuer: str | None = Field(default=None, min_length=2, max_length=200)
    certificate_number: str | None = Field(default=None, max_length=120)
    issue_date: date | None = None
    expiry_date: date | None = None
    credential_url: str | None = Field(default=None, max_length=500)
    file_url: str | None = Field(default=None, max_length=500)


class CertificateOut(CertificateBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
