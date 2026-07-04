from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Comment, Follow, Notification, Post, PostLike, PostView, User
from app.schemas.post import (
    CommentCreate,
    CommentOut,
    PaginatedPosts,
    PostCreate,
    PostOut,
    PostUpdate,
    AuthorSummary,
)
from app.services.moderation import require_allowed_content
from app.services.privacy import get_blocked_user_ids, is_blocked, require_not_blocked, require_verified_email

router = APIRouter(prefix="/posts", tags=["posts"])


def _serialize_post(post: Post, current_user_id: UUID | None = None) -> PostOut:
    like_count = len(post.likes) if post.likes else 0
    comment_count = len(post.comments) if post.comments else 0
    liked = any(l.user_id == current_user_id for l in (post.likes or [])) if current_user_id else False
    author = None
    if post.author:
        author = AuthorSummary.model_validate(post.author)
    return PostOut(
        id=post.id,
        author_id=post.author_id,
        content=post.content,
        category=post.category,
        image_urls=post.image_urls or [],
        link_url=post.link_url,
        hashtags=post.hashtags or [],
        share_count=post.share_count,
        like_count=like_count,
        comment_count=comment_count,
        liked_by_me=liked,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author=author,
    )


@router.get("", response_model=PaginatedPosts)
def list_posts(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    offset = (page - 1) * page_size
    blocked = get_blocked_user_ids(db, user.id)
    base = db.query(Post).options(
        joinedload(Post.author), joinedload(Post.likes), joinedload(Post.comments)
    )
    if blocked:
        base = base.filter(~Post.author_id.in_(blocked))
    total = base.count()
    posts = base.order_by(Post.created_at.desc()).offset(offset).limit(page_size).all()
    for p in posts:
        db.add(PostView(post_id=p.id, viewer_id=user.id))
    if posts:
        db.commit()
    return PaginatedPosts(
        items=[_serialize_post(p, user.id) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
        has_more=offset + len(posts) < total,
    )


@router.post("", response_model=PostOut, status_code=201)
def create_post(
    body: PostCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_verified_email(user)
    require_allowed_content(body.content)
    post = Post(
        author_id=user.id,
        content=body.content,
        category=body.category,
        image_urls=body.image_urls,
        link_url=body.link_url,
        hashtags=body.hashtags,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post.author = user
    post.likes = []
    post.comments = []
    return _serialize_post(post, user.id)


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: UUID,
    body: PostUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).options(joinedload(Post.author), joinedload(Post.likes), joinedload(Post.comments)).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    data = body.model_dump(exclude_unset=True)
    if "content" in data and data["content"]:
        require_allowed_content(data["content"])
    for key, value in data.items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return _serialize_post(post, user.id)


@router.delete("/{post_id}")
def delete_post(
    post_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}


@router.post("/{post_id}/like")
def like_post(
    post_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user.id).first()
    if existing:
        return {"message": "Already liked"}
    db.add(PostLike(post_id=post_id, user_id=user.id))
    db.add(Notification(
        user_id=post.author_id,
        actor_id=user.id,
        type="like",
        message=f"{user.full_name} liked your post",
        reference_id=str(post_id),
    ))
    db.commit()
    return {"message": "Post liked"}


@router.delete("/{post_id}/like")
def unlike_post(
    post_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    like = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user.id).first()
    if like:
        db.delete(like)
        db.commit()
    return {"message": "Like removed"}


@router.get("/{post_id}/comments", response_model=list[CommentOut])
def list_comments(post_id: UUID, db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(get_current_user)]):
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    result = []
    for c in comments:
        author_user = db.query(User).filter(User.id == c.user_id).first()
        out = CommentOut.model_validate(c)
        if author_user:
            out.author = AuthorSummary.model_validate(author_user)
        result.append(out)
    return result


@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    post_id: UUID,
    body: CommentCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if is_blocked(db, user.id, post.author_id):
        raise HTTPException(status_code=404, detail="Post not found")
    require_verified_email(user)
    require_allowed_content(body.content)
    comment = Comment(post_id=post_id, user_id=user.id, content=body.content)
    db.add(comment)
    if post.author_id != user.id:
        db.add(Notification(
            user_id=post.author_id,
            actor_id=user.id,
            type="comment",
            message=f"{user.full_name} commented on your post",
            reference_id=str(post_id),
        ))
    db.commit()
    db.refresh(comment)
    out = CommentOut.model_validate(comment)
    out.author = AuthorSummary.model_validate(user)
    return out


@router.post("/{post_id}/share")
def share_post(
    post_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.share_count += 1
    db.commit()
    return {"message": "Post shared", "share_count": post.share_count}
