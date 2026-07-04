from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Club, ClubAnnouncement, ClubEvent, ClubMember, User
from app.services.subscription import user_has_pro

ADMIN_ROLES = {"owner", "president", "admin", "moderator"}
LEADERSHIP_ROLES = {"owner", "president", "vice_president", "secretary", "treasurer", "moderator", "admin"}


def clubs_created_count(db: Session, user_id: UUID) -> int:
    return db.query(func.count(Club.id)).filter(Club.creator_id == user_id).scalar() or 0


def club_member_count(db: Session, club_id: UUID) -> int:
    return db.query(func.count(ClubMember.id)).filter(ClubMember.club_id == club_id).scalar() or 0


def club_admin_count(db: Session, club_id: UUID) -> int:
    return (
        db.query(func.count(ClubMember.id))
        .filter(ClubMember.club_id == club_id, ClubMember.role.in_(ADMIN_ROLES))
        .scalar()
        or 0
    )


def get_membership(db: Session, club_id: UUID, user_id: UUID) -> ClubMember | None:
    return (
        db.query(ClubMember)
        .filter(ClubMember.club_id == club_id, ClubMember.user_id == user_id)
        .first()
    )


def creator_has_pro(db: Session, club: Club) -> bool:
    return user_has_pro(db, club.creator_id)


def can_create_club(db: Session, user: User) -> tuple[bool, str | None]:
    if user_has_pro(db, user.id):
        return True, None
    created = clubs_created_count(db, user.id)
    if created >= settings.FREE_MAX_CLUBS_CREATED:
        return False, (
            f"Free plan allows {settings.FREE_MAX_CLUBS_CREATED} club. "
            "Upgrade to ScholarNet Pro for unlimited clubs."
        )
    return True, None


def can_join_club(db: Session, club: Club) -> tuple[bool, str | None]:
    if creator_has_pro(db, club):
        return True, None
    count = club_member_count(db, club.id)
    if count >= settings.FREE_MAX_CLUB_MEMBERS:
        return False, (
            f"This club has reached the free limit of {settings.FREE_MAX_CLUB_MEMBERS} members. "
            "The club owner needs ScholarNet Pro for unlimited members."
        )
    return True, None


def can_add_admin(db: Session, club: Club) -> tuple[bool, str | None]:
    if not creator_has_pro(db, club):
        return False, "ScholarNet Pro is required to add multiple club admins."
    return True, None


def is_club_admin(membership: ClubMember | None) -> bool:
    return membership is not None and membership.role in ADMIN_ROLES


def is_club_owner(membership: ClubMember | None) -> bool:
    return membership is not None and membership.role == "owner"


def get_club_analytics(db: Session, club_id: UUID) -> dict:
    from datetime import datetime, timedelta, timezone

    from app.models import ClubAnnouncement, ClubEvent, ClubEventRsvp

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    member_count = club_member_count(db, club_id)
    new_members_7d = (
        db.query(func.count(ClubMember.id))
        .filter(ClubMember.club_id == club_id, ClubMember.joined_at >= week_ago)
        .scalar()
        or 0
    )
    event_count = (
        db.query(func.count(ClubEvent.id)).filter(ClubEvent.club_id == club_id).scalar() or 0
    )
    upcoming_events = (
        db.query(func.count(ClubEvent.id))
        .filter(ClubEvent.club_id == club_id, ClubEvent.starts_at >= now)
        .scalar()
        or 0
    )
    announcement_count = (
        db.query(func.count(ClubAnnouncement.id))
        .filter(ClubAnnouncement.club_id == club_id)
        .scalar()
        or 0
    )
    event_ids = [
        row[0] for row in db.query(ClubEvent.id).filter(ClubEvent.club_id == club_id).all()
    ]
    total_rsvps = 0
    if event_ids:
        total_rsvps = (
            db.query(func.count(ClubEventRsvp.id))
            .filter(ClubEventRsvp.event_id.in_(event_ids))
            .scalar()
            or 0
        )

    member_growth = []
    for days_back in range(6, -1, -1):
        day_start = (now - timedelta(days=days_back)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        day_end = day_start + timedelta(days=1)
        joins = (
            db.query(func.count(ClubMember.id))
            .filter(
                ClubMember.club_id == club_id,
                ClubMember.joined_at >= day_start,
                ClubMember.joined_at < day_end,
            )
            .scalar()
            or 0
        )
        member_growth.append({"date": day_start.date(), "joins": joins})

    return {
        "member_count": member_count,
        "new_members_7d": new_members_7d,
        "event_count": event_count,
        "upcoming_events": upcoming_events,
        "announcement_count": announcement_count,
        "total_rsvps": total_rsvps,
        "member_growth": member_growth,
    }


def club_event_count(db: Session, club_id: UUID) -> int:
    return db.query(func.count(ClubEvent.id)).filter(ClubEvent.club_id == club_id).scalar() or 0


def club_announcement_count(db: Session, club_id: UUID) -> int:
    return (
        db.query(func.count(ClubAnnouncement.id))
        .filter(ClubAnnouncement.club_id == club_id)
        .scalar()
        or 0
    )


def can_create_event(db: Session, club: Club) -> tuple[bool, str | None]:
    if creator_has_pro(db, club):
        return True, None
    count = club_event_count(db, club.id)
    if count >= settings.FREE_MAX_CLUB_EVENTS:
        return False, (
            f"Free plan allows {settings.FREE_MAX_CLUB_EVENTS} events per club. "
            "Upgrade to ScholarNet Pro for unlimited events."
        )
    return True, None


def can_create_announcement(db: Session, club: Club) -> tuple[bool, str | None]:
    if creator_has_pro(db, club):
        return True, None
    count = club_announcement_count(db, club.id)
    if count >= settings.FREE_MAX_CLUB_ANNOUNCEMENTS:
        return False, (
            f"Free plan allows {settings.FREE_MAX_CLUB_ANNOUNCEMENTS} announcements per club. "
            "Upgrade to ScholarNet Pro for unlimited announcements."
        )
    return True, None
