import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import (
    ChangeEmailRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    ResetPasswordRequest,
    SignUpRequest,
    TokenResponse,
    UserMe,
    UserPublic,
)
from app.services.email_verification import send_verification_for_user, verify_email_token
from app.services.password_reset import (
    RESET_MESSAGE,
    consume_reset_token,
    request_password_reset,
    verify_reset_token,
)
from app.services.username import unique_username

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignUpRequest, db: Annotated[Session, Depends(get_db)]):
    if db.query(User).filter(User.email == body.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        full_name=body.full_name.strip(),
        school_name=body.school_name.strip(),
        grade=body.grade,
        city=body.city,
        username=unique_username(db, body.full_name.strip(), body.email.lower()),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    send_verification_for_user(db, user)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/logout")
def logout(_: Annotated[User, Depends(get_current_user)]):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserMe)
def me(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.post("/verify-email")
def verify_email(body: dict, db: Annotated[Session, Depends(get_db)]):
    token = str(body.get("token", "")).strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    user = verify_email_token(db, token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if user.email_verified:
        return {"message": "Email already verified"}
    return send_verification_for_user(db, user)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
):
    email_domain = body.email.split("@")[-1] if "@" in body.email else "unknown"
    logger.info("Password reset requested (domain=%s, ip=%s)", email_domain, request.client.host if request.client else "unknown")
    try:
        result = request_password_reset(db, body.email)
    except Exception:
        logger.exception("Password reset request failed")
        result = {"message": RESET_MESSAGE, "dev_reset_url": None}
    return ForgotPasswordResponse(**result)


@router.post("/reset-password")
@limiter.limit("10/minute")
def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
):
    token = body.token.strip()
    user = verify_reset_token(db, token)
    if not user:
        logger.warning(
            "Invalid password reset token attempt (ip=%s)",
            request.client.host if request.client else "unknown",
        )
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.hashed_password = hash_password(body.new_password)
    consume_reset_token(db, token, user)
    logger.info("Password reset successful for user_id=%s", user.id)
    return {"message": "Password reset successfully"}


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.post("/change-email")
def change_email(
    body: ChangeEmailRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Password is incorrect")
    if db.query(User).filter(User.email == body.new_email.lower(), User.id != user.id).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    user.email = body.new_email.lower()
    user.email_verified = False
    db.commit()
    send_verification_for_user(db, user)
    return {"message": "Email updated. Please verify your new email."}


@router.delete("/account")
def delete_account(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user.is_active = False
    db.commit()
    return {"message": "Account deactivated"}
