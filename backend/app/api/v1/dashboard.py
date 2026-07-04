from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Achievement, Certificate, Follow, Notification, PortfolioItem, Post, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    posts_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar() or 0
    projects_count = db.query(func.count(PortfolioItem.id)).filter(
        PortfolioItem.user_id == user.id, PortfolioItem.item_type == "project"
    ).scalar() or 0
    followers = db.query(func.count(Follow.id)).filter(Follow.following_id == user.id).scalar() or 0
    following = db.query(func.count(Follow.id)).filter(Follow.follower_id == user.id).scalar() or 0
    unread = db.query(func.count(Notification.id)).filter(
        Notification.user_id == user.id, Notification.is_read == False
    ).scalar() or 0
    achievements = (
        db.query(func.count(Achievement.id)).filter(Achievement.user_id == user.id).scalar() or 0
    )
    certificates = (
        db.query(func.count(Certificate.id)).filter(Certificate.user_id == user.id).scalar() or 0
    )
    legacy_achievements = db.query(func.count(PortfolioItem.id)).filter(
        PortfolioItem.user_id == user.id,
        PortfolioItem.item_type.in_(["achievement", "certificate", "olympiad", "hackathon", "competition"]),
    ).scalar() or 0

    return {
        "posts_count": posts_count,
        "projects_count": projects_count,
        "followers_count": followers,
        "following_count": following,
        "unread_notifications": unread,
        "achievements_count": achievements + certificates + legacy_achievements,
        "skills_count": len(user.skills or []),
    }
