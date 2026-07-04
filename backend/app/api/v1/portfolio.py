from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import PortfolioComment, PortfolioItem, PortfolioLike, User
from app.schemas.portfolio import PortfolioCreate, PortfolioOut, PortfolioUpdate

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


class PortfolioDetailOut(PortfolioOut):
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    author_name: str | None = None
    author_grade: int | None = None
    author_school: str | None = None


class PortfolioCommentOut(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    created_at: str
    author_name: str | None = None

    model_config = {"from_attributes": True}


class PortfolioCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


def _serialize_detail(db: Session, item: PortfolioItem, viewer: User) -> PortfolioDetailOut:
    like_count = len(item.likes) if item.likes else 0
    comment_count = len(item.comments) if item.comments else 0
    liked = any(l.user_id == viewer.id for l in (item.likes or []))
    author = db.query(User).filter(User.id == item.user_id).first()
    return PortfolioDetailOut(
        id=item.id,
        user_id=item.user_id,
        item_type=item.item_type,
        title=item.title,
        description=item.description,
        image_url=item.image_url,
        link_url=item.link_url,
        tags=item.tags or [],
        created_at=item.created_at,
        updated_at=item.updated_at,
        like_count=like_count,
        comment_count=comment_count,
        liked_by_me=liked,
        author_name=author.full_name if author else None,
        author_grade=author.grade if author else None,
        author_school=author.school_name if author else None,
    )


@router.get("", response_model=list[PortfolioOut])
def list_portfolio(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    item_type: str | None = Query(None),
):
    q = db.query(PortfolioItem).filter(PortfolioItem.user_id == user.id)
    if item_type:
        q = q.filter(PortfolioItem.item_type == item_type)
    return q.order_by(PortfolioItem.created_at.desc()).all()


@router.get("/user/{user_id}", response_model=list[PortfolioOut])
def list_user_portfolio(
    user_id: UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    item_type: str | None = Query(None),
):
    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    q = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id)
    if item_type:
        q = q.filter(PortfolioItem.item_type == item_type)
    return q.order_by(PortfolioItem.created_at.desc()).all()


@router.get("/{item_id}", response_model=PortfolioDetailOut)
def get_item(
    item_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = (
        db.query(PortfolioItem)
        .options(joinedload(PortfolioItem.likes), joinedload(PortfolioItem.comments))
        .filter(PortfolioItem.id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return _serialize_detail(db, item, user)


@router.post("", response_model=PortfolioOut, status_code=201)
def create_item(
    body: PortfolioCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = PortfolioItem(user_id=user.id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=PortfolioOut)
def update_item(
    item_id: UUID,
    body: PortfolioUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id, PortfolioItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id, PortfolioItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{item_id}/like")
def like_item(
    item_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    existing = (
        db.query(PortfolioLike)
        .filter(PortfolioLike.item_id == item_id, PortfolioLike.user_id == user.id)
        .first()
    )
    if existing:
        return {"message": "Already liked"}
    db.add(PortfolioLike(item_id=item_id, user_id=user.id))
    db.commit()
    return {"message": "Liked"}


@router.delete("/{item_id}/like")
def unlike_item(
    item_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    like = (
        db.query(PortfolioLike)
        .filter(PortfolioLike.item_id == item_id, PortfolioLike.user_id == user.id)
        .first()
    )
    if like:
        db.delete(like)
        db.commit()
    return {"message": "Unliked"}


@router.get("/{item_id}/comments", response_model=list[PortfolioCommentOut])
def list_comments(
    item_id: UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    comments = (
        db.query(PortfolioComment)
        .filter(PortfolioComment.item_id == item_id)
        .order_by(PortfolioComment.created_at.asc())
        .all()
    )
    out: list[PortfolioCommentOut] = []
    for c in comments:
        author = db.query(User).filter(User.id == c.user_id).first()
        out.append(
            PortfolioCommentOut(
                id=c.id,
                user_id=c.user_id,
                content=c.content,
                created_at=c.created_at.isoformat(),
                author_name=author.full_name if author else None,
            )
        )
    return out


@router.post("/{item_id}/comments", response_model=PortfolioCommentOut, status_code=201)
def add_comment(
    item_id: UUID,
    body: PortfolioCommentCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    comment = PortfolioComment(item_id=item_id, user_id=user.id, content=body.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return PortfolioCommentOut(
        id=comment.id,
        user_id=comment.user_id,
        content=comment.content,
        created_at=comment.created_at.isoformat(),
        author_name=user.full_name,
    )
