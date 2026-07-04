from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_admin, get_current_user
from app.core.local_storage import ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES, save_document, save_image
from app.db.session import get_db
from app.models import Opportunity, User, VerifiedSchool
from app.schemas.opportunity import OpportunityCreate, OpportunityOut, OpportunityUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/system-status")
def system_status(_: Annotated[User, Depends(get_current_admin)]):
    return {
        "smtp_configured": settings.smtp_configured,
        "razorpay_configured": settings.razorpay_configured,
        "cloudinary_configured": settings.cloudinary_configured,
        "openai_configured": settings.openai_configured,
        "production_secret": settings.production_ready,
        "email_from": settings.EMAIL_FROM,
    }


@router.get("/users")
def list_users(
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
    skip: int = 0,
    limit: int = 50,
):
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "username": u.username,
            "school_name": u.school_name,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "is_verified": u.is_verified,
            "email_verified": u.email_verified,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id: str,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User activated"}


@router.get("/opportunities", response_model=list[OpportunityOut])
def admin_list_opportunities(
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opps = db.query(Opportunity).order_by(Opportunity.created_at.desc()).all()
    return [
        OpportunityOut(
            id=o.id,
            title=o.title,
            organization=o.organization,
            opportunity_type=o.opportunity_type,
            description=o.description,
            skills_required=o.skills_required or [],
            link_url=o.link_url,
            deadline=o.deadline,
            match_score=0,
            has_applied=False,
            created_at=o.created_at,
        )
        for o in opps
    ]


@router.post("/opportunities", response_model=OpportunityOut, status_code=201)
def admin_create_opportunity(
    body: OpportunityCreate,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = Opportunity(
        title=body.title.strip(),
        organization=body.organization.strip(),
        opportunity_type=body.opportunity_type.lower(),
        description=body.description.strip(),
        skills_required=body.skills_required,
        link_url=body.link_url,
        deadline=body.deadline,
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return OpportunityOut(
        id=opp.id,
        title=opp.title,
        organization=opp.organization,
        opportunity_type=opp.opportunity_type,
        description=opp.description,
        skills_required=opp.skills_required or [],
        link_url=opp.link_url,
        deadline=opp.deadline,
        match_score=0,
        has_applied=False,
        created_at=opp.created_at,
    )


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityOut)
def admin_update_opportunity(
    opportunity_id: UUID,
    body: OpportunityUpdate,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data and data["title"]:
        data["title"] = data["title"].strip()
    if "organization" in data and data["organization"]:
        data["organization"] = data["organization"].strip()
    if "opportunity_type" in data and data["opportunity_type"]:
        data["opportunity_type"] = data["opportunity_type"].lower()
    for key, value in data.items():
        setattr(opp, key, value)
    db.commit()
    db.refresh(opp)
    return OpportunityOut(
        id=opp.id,
        title=opp.title,
        organization=opp.organization,
        opportunity_type=opp.opportunity_type,
        description=opp.description,
        skills_required=opp.skills_required or [],
        link_url=opp.link_url,
        deadline=opp.deadline,
        match_score=0,
        has_applied=False,
        created_at=opp.created_at,
    )


@router.delete("/opportunities/{opportunity_id}")
def admin_delete_opportunity(
    opportunity_id: UUID,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(opp)
    db.commit()
    return {"message": "Opportunity deleted"}


@router.patch("/users/{user_id}/verify")
def admin_verify_user(
    user_id: UUID,
    verified: bool,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = verified
    db.commit()
    return {"message": "User verification updated", "is_verified": user.is_verified}


@router.post("/schools/verify")
def admin_verify_school(
    body: dict,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.services.username import slugify

    name = str(body.get("school_name", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="school_name required")
    slug = slugify(name)
    row = db.query(VerifiedSchool).filter(VerifiedSchool.slug == slug).first()
    is_verified = bool(body.get("is_verified", True))
    city = body.get("city")
    if row:
        row.is_verified = is_verified
        if city:
            row.city = city
    else:
        row = VerifiedSchool(school_name=name, slug=slug, city=city, is_verified=is_verified)
        db.add(row)
    db.commit()
    return {"message": "School verification updated", "school_name": name, "is_verified": is_verified}


uploads_router = APIRouter(prefix="/uploads", tags=["uploads"])

@uploads_router.post("/image")
async def upload_image(
    request: Request,
    _: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        result = cloudinary.uploader.upload(contents, folder="scholarnet/uploads")
        return {"url": result.get("secure_url")}
    url = save_image(
        contents,
        "uploads",
        file.content_type,
        str(request.base_url).rstrip("/"),
    )
    return {"url": url}


@uploads_router.post("/document")
async def upload_document(
    request: Request,
    _: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG, and PNG files are allowed")
    contents = await file.read()
    if len(contents) > MAX_DOCUMENT_BYTES:
        raise HTTPException(status_code=400, detail="File must be under 10MB")
    try:
        url = save_document(
            contents,
            "documents",
            content_type,
            str(request.base_url).rstrip("/"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"url": url}
