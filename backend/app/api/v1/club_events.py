from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, ClubEvent, ClubEventRsvp, User
from app.schemas.club_activity import ClubEventCreate, ClubEventOut, ClubEventUpdate
from app.services.clubs import (
    can_create_event,
    get_membership,
    is_club_admin,
)

router = APIRouter(prefix="/clubs", tags=["club-events"])


def _get_club_or_404(db: Session, club_id: UUID) -> Club:
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


def _get_event_or_404(db: Session, club_id: UUID, event_id: UUID) -> ClubEvent:
    event = (
        db.query(ClubEvent)
        .filter(ClubEvent.id == event_id, ClubEvent.club_id == club_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def _rsvp_count(db: Session, event_id: UUID) -> int:
    return (
        db.query(func.count(ClubEventRsvp.id))
        .filter(ClubEventRsvp.event_id == event_id)
        .scalar()
        or 0
    )


def _is_rsvped(db: Session, event_id: UUID, user_id: UUID) -> bool:
    return (
        db.query(ClubEventRsvp.id)
        .filter(ClubEventRsvp.event_id == event_id, ClubEventRsvp.user_id == user_id)
        .first()
        is not None
    )


def _serialize_event(db: Session, event: ClubEvent, viewer: User) -> ClubEventOut:
    return ClubEventOut(
        id=event.id,
        club_id=event.club_id,
        creator_id=event.creator_id,
        title=event.title,
        description=event.description,
        location=event.location,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
        rsvp_count=_rsvp_count(db, event.id),
        is_rsvped=_is_rsvped(db, event.id, viewer.id),
        created_at=event.created_at,
    )


@router.get("/{club_id}/events", response_model=list[ClubEventOut])
def list_events(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    _get_club_or_404(db, club_id)
    events = (
        db.query(ClubEvent)
        .filter(ClubEvent.club_id == club_id)
        .order_by(ClubEvent.starts_at.asc())
        .all()
    )
    return [_serialize_event(db, event, user) for event in events]


@router.post("/{club_id}/events", response_model=ClubEventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    club_id: UUID,
    payload: ClubEventCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can create events")

    allowed, reason = can_create_event(db, club)
    if not allowed:
        raise HTTPException(status_code=403, detail=reason)

    event = ClubEvent(
        club_id=club.id,
        creator_id=user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        location=payload.location.strip() if payload.location else None,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _serialize_event(db, event, user)


@router.patch("/{club_id}/events/{event_id}", response_model=ClubEventOut)
def update_event(
    club_id: UUID,
    event_id: UUID,
    payload: ClubEventUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can update events")

    event = _get_event_or_404(db, club_id, event_id)
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"]:
        data["title"] = data["title"].strip()
    if "description" in data and data["description"] is not None:
        data["description"] = data["description"].strip()
    if "location" in data and data["location"]:
        data["location"] = data["location"].strip()
    for key, value in data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return _serialize_event(db, event, user)


@router.delete("/{club_id}/events/{event_id}")
def delete_event(
    club_id: UUID,
    event_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can delete events")

    event = _get_event_or_404(db, club_id, event_id)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}


@router.post("/{club_id}/events/{event_id}/rsvp", response_model=ClubEventOut)
def rsvp_event(
    club_id: UUID,
    event_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    _get_club_or_404(db, club_id)
    event = _get_event_or_404(db, club_id, event_id)
    membership = get_membership(db, club_id, user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Join the club to RSVP to events")

    existing = (
        db.query(ClubEventRsvp)
        .filter(ClubEventRsvp.event_id == event.id, ClubEventRsvp.user_id == user.id)
        .first()
    )
    if not existing:
        db.add(ClubEventRsvp(event_id=event.id, user_id=user.id))
        db.commit()

    return _serialize_event(db, event, user)


@router.delete("/{club_id}/events/{event_id}/rsvp", response_model=ClubEventOut)
def cancel_rsvp(
    club_id: UUID,
    event_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    _get_club_or_404(db, club_id)
    event = _get_event_or_404(db, club_id, event_id)
    rsvp = (
        db.query(ClubEventRsvp)
        .filter(ClubEventRsvp.event_id == event.id, ClubEventRsvp.user_id == user.id)
        .first()
    )
    if rsvp:
        db.delete(rsvp)
        db.commit()
    return _serialize_event(db, event, user)
