from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, ClubMember, ClubPost, User
from app.services.clubs import get_membership

router = APIRouter(prefix="/clubs", tags=["club-posts"])


class ClubPostOut(BaseModel):
    id: UUID
    club_id: UUID
    author_id: UUID
    author_name: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClubPostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


def _serialize(db: Session, post: ClubPost) -> ClubPostOut:
    author = db.query(User).filter(User.id == post.author_id).first()
    return ClubPostOut(
        id=post.id,
        club_id=post.club_id,
        author_id=post.author_id,
        author_name=author.full_name if author else "Unknown",
        content=post.content,
        created_at=post.created_at,
    )


@router.get("/{club_id}/posts", response_model=list[ClubPostOut])
def list_club_posts(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if not get_membership(db, club_id, user.id):
        raise HTTPException(status_code=403, detail="Join the club to view the feed")
    posts = (
        db.query(ClubPost)
        .filter(ClubPost.club_id == club_id)
        .order_by(ClubPost.created_at.desc())
        .limit(50)
        .all()
    )
    return [_serialize(db, p) for p in posts]


@router.post("/{club_id}/posts", response_model=ClubPostOut, status_code=201)
def create_club_post(
    club_id: UUID,
    body: ClubPostCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if not get_membership(db, club_id, user.id):
        raise HTTPException(status_code=403, detail="Join the club to post")
    post = ClubPost(club_id=club_id, author_id=user.id, content=body.content)
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize(db, post)
