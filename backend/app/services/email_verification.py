import hashlib
import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import EmailVerificationToken, User

logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _verify_url(token: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}/verify-email?token={token}"


def invalidate_user_verification_tokens(db: Session, user_id) -> None:
    now = datetime.now(timezone.utc)
    rows = (
        db.query(EmailVerificationToken)
        .filter(EmailVerificationToken.user_id == user_id, EmailVerificationToken.used_at.is_(None))
        .all()
    )
    for row in rows:
        row.used_at = now


def create_verification_token(db: Session, user: User) -> str:
    invalidate_user_verification_tokens(db, user.id)
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=48)
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=expires_at,
        )
    )
    db.commit()
    return raw_token


def verify_email_token(db: Session, raw_token: str) -> User | None:
    token_hash = _hash_token(raw_token)
    now = datetime.now(timezone.utc)
    row = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > now,
        )
        .first()
    )
    if not row:
        return None
    user = db.query(User).filter(User.id == row.user_id, User.is_active == True).first()
    if not user:
        return None
    row.used_at = now
    user.email_verified = True
    db.commit()
    return user


def send_verification_email(*, to_email: str, user_name: str, raw_token: str) -> tuple[bool, str | None]:
    verify_url = _verify_url(raw_token)
    subject = "Verify your ScholarNet email"
    plain = f"""Hi {user_name},

Welcome to ScholarNet! Please verify your email address:

{verify_url}

This link expires in 48 hours.

— ScholarNet Team
"""
    html = f"""<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:32px;">
<h1 style="color:#818cf8;">Verify your email</h1>
<p>Hi {user_name}, welcome to ScholarNet!</p>
<p><a href="{verify_url}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify email</a></p>
<p style="color:#94a3b8;font-size:13px;">Or copy: {verify_url}</p>
</body></html>"""

    if not settings.smtp_configured:
        logger.warning("SMTP not configured — verification link for %s: %s", to_email, verify_url)
        return False, verify_url

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [to_email], msg.as_string())
        return True, None
    except Exception:
        logger.exception("Failed to send verification email to %s", to_email)
        return False, verify_url


def send_verification_for_user(db: Session, user: User) -> dict:
    raw_token = create_verification_token(db, user)
    sent, dev_url = send_verification_email(
        to_email=user.email, user_name=user.full_name, raw_token=raw_token
    )
    return {"message": "Verification email sent", "dev_verify_url": dev_url if not sent else None}
