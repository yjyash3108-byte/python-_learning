from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Club, User
from app.schemas.opportunity import AssistantMessage, AssistantResponse
from app.services.club_assistant import generate_club_assistant_reply
from app.services.clubs import creator_has_pro, get_membership

router = APIRouter(prefix="/clubs", tags=["club-assistant"])


@router.post("/{club_id}/assistant", response_model=AssistantResponse)
def club_assistant_chat(
    club_id: UUID,
    payload: AssistantMessage,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    if not get_membership(db, club.id, user.id):
        raise HTTPException(status_code=403, detail="Join the club to use the assistant")

    if not creator_has_pro(db, club):
        raise HTTPException(
            status_code=403,
            detail="ScholarNet Pro is required for the AI Club Assistant",
        )

    reply, powered_by = generate_club_assistant_reply(db, club, payload.message)
    return AssistantResponse(reply=reply, powered_by=powered_by)
