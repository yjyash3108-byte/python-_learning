from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, ClubAnnouncement, User
from app.schemas.club_activity import (
    ClubAnnouncementCreate,
    ClubAnnouncementOut,
    ClubAnnouncementUpdate,
)
from app.services.clubs import (
    can_create_announcement,
    get_membership,
    is_club_admin,
)

router = APIRouter(prefix="/clubs", tags=["club-announcements"])


def _get_club_or_404(db: Session, club_id: UUID) -> Club:
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


def _get_announcement_or_404(db: Session, club_id: UUID, announcement_id: UUID) -> ClubAnnouncement:
    item = (
        db.query(ClubAnnouncement)
        .filter(ClubAnnouncement.id == announcement_id, ClubAnnouncement.club_id == club_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return item


def _serialize_announcement(db: Session, item: ClubAnnouncement) -> ClubAnnouncementOut:
    author = db.query(User).filter(User.id == item.author_id).first()
    return ClubAnnouncementOut(
        id=item.id,
        club_id=item.club_id,
        author_id=item.author_id,
        author_name=author.full_name if author else "Unknown",
        title=item.title,
        content=item.content,
        is_pinned=item.is_pinned,
        created_at=item.created_at,
    )


@router.get("/{club_id}/announcements", response_model=list[ClubAnnouncementOut])
def list_announcements(
    club_id: UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    _get_club_or_404(db, club_id)
    items = (
        db.query(ClubAnnouncement)
        .filter(ClubAnnouncement.club_id == club_id)
        .order_by(ClubAnnouncement.is_pinned.desc(), ClubAnnouncement.created_at.desc())
        .all()
    )
    return [_serialize_announcement(db, item) for item in items]


@router.post(
    "/{club_id}/announcements",
    response_model=ClubAnnouncementOut,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    club_id: UUID,
    payload: ClubAnnouncementCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can post announcements")

    allowed, reason = can_create_announcement(db, club)
    if not allowed:
        raise HTTPException(status_code=403, detail=reason)

    item = ClubAnnouncement(
        club_id=club.id,
        author_id=user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        is_pinned=payload.is_pinned,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_announcement(db, item)


@router.patch("/{club_id}/announcements/{announcement_id}", response_model=ClubAnnouncementOut)
def update_announcement(
    club_id: UUID,
    announcement_id: UUID,
    payload: ClubAnnouncementUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can update announcements")

    item = _get_announcement_or_404(db, club_id, announcement_id)
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"]:
        data["title"] = data["title"].strip()
    if "content" in data and data["content"]:
        data["content"] = data["content"].strip()
    for key, value in data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return _serialize_announcement(db, item)


@router.delete("/{club_id}/announcements/{announcement_id}")
def delete_announcement(
    club_id: UUID,
    announcement_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can delete announcements")

    item = _get_announcement_or_404(db, club_id, announcement_id)
    db.delete(item)
    db.commit()
    return {"message": "Announcement deleted"}
