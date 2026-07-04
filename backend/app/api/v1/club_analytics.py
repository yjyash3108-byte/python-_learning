from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, User
from app.schemas.club import ClubAnalyticsOut, MemberGrowthPoint
from app.services.clubs import creator_has_pro, get_club_analytics, get_membership, is_club_admin

router = APIRouter(prefix="/clubs", tags=["club-analytics"])


def _get_club_or_404(db: Session, club_id: UUID) -> Club:
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.get("/{club_id}/analytics", response_model=ClubAnalyticsOut)
def club_analytics(
    club_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = _get_club_or_404(db, club_id)
    membership = get_membership(db, club.id, user.id)
    if not is_club_admin(membership):
        raise HTTPException(status_code=403, detail="Only club admins can view analytics")

    stats = get_club_analytics(db, club.id)
    is_pro = creator_has_pro(db, club)

    return ClubAnalyticsOut(
        member_count=stats["member_count"],
        event_count=stats["event_count"],
        announcement_count=stats["announcement_count"],
        upcoming_events=stats["upcoming_events"],
        new_members_7d=stats["new_members_7d"] if is_pro else 0,
        total_rsvps=stats["total_rsvps"] if is_pro else 0,
        member_growth=(
            [MemberGrowthPoint(**p) for p in stats["member_growth"]] if is_pro else []
        ),
        is_pro=is_pro,
        can_view_advanced=is_pro,
    )
