from typing import Annotated
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_optional_user
from app.core.local_storage import save_image
from app.db.session import get_db
from app.models import Achievement, Certificate, Follow, PortfolioItem, Post, PostView, ProfileView, User
from app.schemas.auth import (
    PublicProfileFullOut,
    PublicProfileOut,
    UserMe,
    UserPublic,
    UserUpdate,
)
from app.services.privacy import can_view_profile, get_profile_visibility, is_blocked, require_can_view_profile
from app.services.subscription import user_has_pro

router = APIRouter(prefix="/users", tags=["users"])


def _cover_theme_from_user(user: User) -> tuple[str | None, str | None]:
    links = user.social_links or {}
    primary = links.get("profile_cover_primary")
    accent = links.get("profile_cover_accent")
    if isinstance(primary, str) and isinstance(accent, str):
        return primary, accent
    return None, None


def _public_profile_payload(db: Session, user: User) -> PublicProfileFullOut:
    achievements = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id)
        .order_by(Achievement.date_achieved.desc())
        .limit(8)
        .all()
    )
    projects = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.user_id == user.id)
        .order_by(PortfolioItem.created_at.desc())
        .limit(6)
        .all()
    )
    posts = (
        db.query(Post)
        .filter(Post.author_id == user.id)
        .order_by(Post.created_at.desc())
        .limit(5)
        .all()
    )
    certificates = (
        db.query(Certificate)
        .filter(Certificate.user_id == user.id)
        .order_by(Certificate.issue_date.desc())
        .limit(6)
        .all()
    )
    base = PublicProfileOut.model_validate(user)
    cover_primary, cover_accent = _cover_theme_from_user(user)
    return PublicProfileFullOut(
        **base.model_dump(),
        cover_primary=cover_primary,
        cover_accent=cover_accent,
        achievements=achievements,
        projects=projects,
        posts=posts,
        certificates=certificates,
    )


@router.get("/me", response_model=UserMe)
def get_profile(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.put("/me", response_model=UserMe)
def update_profile(
    body: UserUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    data = body.model_dump(exclude_unset=True)
    if "username" in data and data["username"]:
        data["username"] = data["username"].lower().strip()
        taken = (
            db.query(User)
            .filter(User.username == data["username"], User.id != user.id)
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Username already taken")
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/avatar", response_model=UserMe)
async def upload_avatar(
    request: Request,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
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
        result = cloudinary.uploader.upload(contents, folder="scholarnet/avatars")
        url = result.get("secure_url")
    else:
        url = save_image(contents, "avatars", file.content_type, str(request.base_url).rstrip("/"))
    user.profile_picture_url = url
    db.commit()
    db.refresh(user)
    return user


@router.get("/public/{username}", response_model=PublicProfileFullOut)
def get_public_profile(
    username: str,
    db: Annotated[Session, Depends(get_db)],
    viewer: Annotated[User | None, Depends(get_optional_user)] = None,
):
    user = db.query(User).filter(User.username == username.lower(), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    if get_profile_visibility(user) != "public":
        if not viewer or not can_view_profile(db, viewer, user):
            raise HTTPException(status_code=404, detail="Profile not found")
    db.add(ProfileView(profile_user_id=user.id, viewer_id=viewer.id if viewer else None))
    db.commit()
    return _public_profile_payload(db, user)


@router.post("/public/{username}/view")
def record_profile_view(
    username: str,
    db: Annotated[Session, Depends(get_db)],
    viewer: Annotated[User | None, Depends(get_optional_user)] = None,
):
    user = db.query(User).filter(User.username == username.lower(), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.add(ProfileView(profile_user_id=user.id, viewer_id=viewer.id if viewer else None))
    db.commit()
    return {"message": "ok"}


@router.get("/analytics/me")
def my_analytics(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    profile_views = db.query(ProfileView).filter(ProfileView.profile_user_id == user.id).count()
    profile_views_7d = (
        db.query(ProfileView)
        .filter(ProfileView.profile_user_id == user.id, ProfileView.created_at >= week_ago)
        .count()
    )
    post_ids = [p.id for p in db.query(Post.id).filter(Post.author_id == user.id).all()]
    post_views = 0
    post_views_7d = 0
    if post_ids:
        post_views = db.query(PostView).filter(PostView.post_id.in_(post_ids)).count()
        post_views_7d = (
            db.query(PostView)
            .filter(PostView.post_id.in_(post_ids), PostView.created_at >= week_ago)
            .count()
        )
    followers = db.query(Follow).filter(Follow.following_id == user.id).count()
    followers_7d = (
        db.query(Follow)
        .filter(Follow.following_id == user.id, Follow.created_at >= week_ago)
        .count()
    )
    return {
        "profile_views": profile_views,
        "profile_views_7d": profile_views_7d,
        "post_views": post_views,
        "post_views_7d": post_views_7d,
        "followers": followers,
        "followers_7d": followers_7d,
    }


@router.get("/analytics/me/viewers")
def my_profile_viewers(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = 20,
):
    if not user_has_pro(db, user.id):
        raise HTTPException(status_code=403, detail="Pro subscription required for viewer insights")
    rows = (
        db.query(ProfileView, User)
        .outerjoin(User, User.id == ProfileView.viewer_id)
        .filter(ProfileView.profile_user_id == user.id, ProfileView.viewer_id.isnot(None))
        .order_by(ProfileView.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "viewer_id": str(view.viewer_id),
            "full_name": viewer.full_name if viewer else "Anonymous",
            "school_name": viewer.school_name if viewer else None,
            "viewed_at": view.created_at.isoformat(),
        }
        for view, viewer in rows
    ]


@router.get("/{user_id}", response_model=UserPublic)
def get_user(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    viewer: Annotated[User, Depends(get_current_user)],
):
    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if is_blocked(db, viewer.id, target.id):
        raise HTTPException(status_code=404, detail="User not found")
    require_can_view_profile(db, viewer, target)
    return target
