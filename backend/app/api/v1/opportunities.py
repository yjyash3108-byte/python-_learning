from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Opportunity, OpportunityApplication, OpportunityBookmark, User
from app.schemas.opportunity import OpportunityApplyResponse, OpportunityOut
from app.services.opportunities import compute_match_score, get_matched_skills

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


def _is_applied(db: Session, opp_id: UUID, user_id: UUID) -> bool:
    return (
        db.query(OpportunityApplication.id)
        .filter(
            OpportunityApplication.opportunity_id == opp_id,
            OpportunityApplication.user_id == user_id,
        )
        .first()
        is not None
    )


def _is_saved(db: Session, opp_id: UUID, user_id: UUID) -> bool:
    return (
        db.query(OpportunityBookmark.id)
        .filter(
            OpportunityBookmark.opportunity_id == opp_id,
            OpportunityBookmark.user_id == user_id,
        )
        .first()
        is not None
    )


def _serialize(db: Session, opp: Opportunity, user: User) -> OpportunityOut:
    user_skills = list(user.skills or []) + list(user.interests or [])
    required = opp.skills_required or []
    return OpportunityOut(
        id=opp.id,
        title=opp.title,
        organization=opp.organization,
        opportunity_type=opp.opportunity_type,
        description=opp.description,
        skills_required=required,
        link_url=opp.link_url,
        deadline=opp.deadline,
        match_score=compute_match_score(user_skills, required),
        matched_skills=get_matched_skills(user_skills, required),
        has_applied=_is_applied(db, opp.id, user.id),
        is_saved=_is_saved(db, opp.id, user.id),
        created_at=opp.created_at,
    )


@router.get("", response_model=list[OpportunityOut])
def list_opportunities(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    q: str = Query("", min_length=0),
    skill: str | None = Query(None),
    opp_type: str | None = Query(None),
    saved_only: bool = Query(False),
):
    query = db.query(Opportunity).filter(Opportunity.is_active == True)
    if saved_only:
        saved_ids = [
            row[0]
            for row in db.query(OpportunityBookmark.opportunity_id)
            .filter(OpportunityBookmark.user_id == user.id)
            .all()
        ]
        if not saved_ids:
            return []
        query = query.filter(Opportunity.id.in_(saved_ids))
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            Opportunity.title.ilike(like)
            | Opportunity.organization.ilike(like)
            | Opportunity.description.ilike(like)
        )
    if opp_type:
        query = query.filter(Opportunity.opportunity_type == opp_type.lower())
    if skill:
        query = query.filter(Opportunity.skills_required.any(skill))
    opps = query.order_by(Opportunity.created_at.desc()).all()
    results = [_serialize(db, o, user) for o in opps]
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results


@router.get("/my-applications", response_model=list[OpportunityOut])
def my_applications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    applied_ids = [
        row[0]
        for row in db.query(OpportunityApplication.opportunity_id)
        .filter(OpportunityApplication.user_id == user.id)
        .all()
    ]
    if not applied_ids:
        return []
    opps = (
        db.query(Opportunity)
        .filter(Opportunity.id.in_(applied_ids), Opportunity.is_active == True)
        .order_by(Opportunity.created_at.desc())
        .all()
    )
    return [_serialize(db, o, user) for o in opps]


@router.get("/recommended", response_model=list[OpportunityOut])
def recommended_opportunities(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(10, le=20),
):
    opps = db.query(Opportunity).filter(Opportunity.is_active == True).all()
    results = [_serialize(db, o, user) for o in opps]
    results.sort(key=lambda x: x.match_score, reverse=True)
    return [r for r in results if r.match_score > 0][:limit] or results[:limit]


@router.get("/{opportunity_id}", response_model=OpportunityOut)
def get_opportunity(
    opportunity_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _serialize(db, opp, user)


@router.get("/{opportunity_id}/similar", response_model=list[OpportunityOut])
def similar_opportunities(
    opportunity_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(5, le=10),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    others = (
        db.query(Opportunity)
        .filter(Opportunity.is_active == True, Opportunity.id != opportunity_id)
        .all()
    )
    required = set(opp.skills_required or [])
    scored = []
    for o in others:
        overlap = len(required & set(o.skills_required or []))
        type_bonus = 2 if o.opportunity_type == opp.opportunity_type else 0
        scored.append((overlap + type_bonus, o))
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [o for _, o in scored[:limit]]
    return [_serialize(db, o, user) for o in top]


@router.post("/{opportunity_id}/apply", response_model=OpportunityApplyResponse)
def apply_opportunity(
    opportunity_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = (
        db.query(OpportunityApplication)
        .filter(
            OpportunityApplication.opportunity_id == opp.id,
            OpportunityApplication.user_id == user.id,
        )
        .first()
    )
    if existing:
        return OpportunityApplyResponse(
            message="Already applied",
            has_applied=True,
            link_url=opp.link_url,
        )

    db.add(OpportunityApplication(opportunity_id=opp.id, user_id=user.id, status="applied"))
    db.commit()
    return OpportunityApplyResponse(
        message="Application recorded",
        has_applied=True,
        link_url=opp.link_url,
    )


@router.post("/{opportunity_id}/save")
def save_opportunity(
    opportunity_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    existing = (
        db.query(OpportunityBookmark)
        .filter(
            OpportunityBookmark.opportunity_id == opp.id,
            OpportunityBookmark.user_id == user.id,
        )
        .first()
    )
    if existing:
        return {"message": "Already saved", "is_saved": True}
    db.add(OpportunityBookmark(opportunity_id=opp.id, user_id=user.id))
    db.commit()
    return {"message": "Saved", "is_saved": True}


@router.delete("/{opportunity_id}/save")
def unsave_opportunity(
    opportunity_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    bookmark = (
        db.query(OpportunityBookmark)
        .filter(
            OpportunityBookmark.opportunity_id == opportunity_id,
            OpportunityBookmark.user_id == user.id,
        )
        .first()
    )
    if bookmark:
        db.delete(bookmark)
        db.commit()
    return {"message": "Removed", "is_saved": False}
