from pydantic import BaseModel

from app.schemas.auth import UserPublic


class FollowCounts(BaseModel):
    followers: int
    following: int


class FollowStatusResponse(FollowCounts):
    is_following: bool
    is_self: bool


class FollowActionResponse(FollowCounts):
    message: str
    is_following: bool
