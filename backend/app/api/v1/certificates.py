from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Certificate, User
from app.schemas.certificate import CertificateCreate, CertificateOut, CertificateUpdate

router = APIRouter(prefix="/certificates", tags=["certificates"])

SortOption = Literal["newest", "oldest", "title"]


def _get_owned_certificate(db: Session, certificate_id: UUID, user_id: UUID) -> Certificate:
    item = (
        db.query(Certificate)
        .filter(Certificate.id == certificate_id, Certificate.user_id == user_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return item


def _apply_sort(query, sort: SortOption):
    if sort == "oldest":
        return query.order_by(Certificate.issue_date.asc(), Certificate.created_at.asc())
    if sort == "title":
        return query.order_by(Certificate.title.asc())
    return query.order_by(Certificate.issue_date.desc(), Certificate.created_at.desc())


@router.get("", response_model=list[CertificateOut])
def list_my_certificates(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    q: str | None = Query(None),
    sort: SortOption = Query("newest"),
):
    query = db.query(Certificate).filter(Certificate.user_id == user.id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            Certificate.title.ilike(like)
            | Certificate.issuer.ilike(like)
            | Certificate.certificate_number.ilike(like)
        )
    return _apply_sort(query, sort).all()


@router.get("/user/{user_id}", response_model=list[CertificateOut])
def list_user_certificates(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    q: str | None = Query(None),
    sort: SortOption = Query("newest"),
):
    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Certificate).filter(Certificate.user_id == user_id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            Certificate.title.ilike(like)
            | Certificate.issuer.ilike(like)
            | Certificate.certificate_number.ilike(like)
        )
    return _apply_sort(query, sort).all()


@router.post("", response_model=CertificateOut, status_code=201)
def create_certificate(
    body: CertificateCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = Certificate(user_id=user.id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{certificate_id}", response_model=CertificateOut)
def update_certificate(
    certificate_id: UUID,
    body: CertificateUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = _get_owned_certificate(db, certificate_id, user.id)
    updates = body.model_dump(exclude_unset=True)
    if "issue_date" in updates or "expiry_date" in updates:
        issue_date = updates.get("issue_date", item.issue_date)
        expiry_date = updates.get("expiry_date", item.expiry_date)
        if expiry_date and expiry_date < issue_date:
            raise HTTPException(status_code=400, detail="Expiry date cannot be before issue date")
    for key, value in updates.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{certificate_id}")
def delete_certificate(
    certificate_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = _get_owned_certificate(db, certificate_id, user.id)
    db.delete(item)
    db.commit()
    return {"message": "Certificate deleted"}
