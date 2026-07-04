import hashlib
import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import PasswordResetToken, User

logger = logging.getLogger(__name__)

RESET_MESSAGE = "If an account exists for this email, a password reset link has been sent."


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _reset_url(token: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}/reset-password?token={token}"


def invalidate_user_reset_tokens(db: Session, user_id) -> None:
    now = datetime.now(timezone.utc)
    tokens = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user_id, PasswordResetToken.used_at.is_(None))
        .all()
    )
    for row in tokens:
        row.used_at = now


def create_password_reset_token(db: Session, user: User) -> str:
    invalidate_user_reset_tokens(db, user.id)
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
    )
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=expires_at,
        )
    )
    db.commit()
    return raw_token


def verify_reset_token(db: Session, raw_token: str) -> User | None:
    token_hash = _hash_token(raw_token)
    now = datetime.now(timezone.utc)
    row = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .first()
    )
    if not row:
        return None
    user = db.query(User).filter(User.id == row.user_id, User.is_active == True).first()
    if not user:
        return None
    return user


def consume_reset_token(db: Session, raw_token: str, user: User) -> None:
    token_hash = _hash_token(raw_token)
    now = datetime.now(timezone.utc)
    row = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash, PasswordResetToken.user_id == user.id)
        .first()
    )
    if row:
        row.used_at = now
    invalidate_user_reset_tokens(db, user.id)
    user.reset_token = None
    db.commit()


def build_password_reset_email(*, reset_url: str, user_name: str) -> tuple[str, str, str]:
    subject = "Reset your ScholarNet password"
    plain = f"""Hi {user_name},

We received a request to reset your ScholarNet password.

Reset your password (expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes):
{reset_url}

If you did not request this, you can safely ignore this email. Your password will not change.

— ScholarNet Team
"""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Segoe UI,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg,#4f46e5,#06b6d4);">
          <div style="font-size:28px;line-height:1;">🎓</div>
          <h1 style="margin:12px 0 0;color:#ffffff;font-size:22px;font-weight:700;">ScholarNet</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#e2e8f0;font-size:16px;">Hi {user_name},</p>
          <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <p style="margin:0 0 24px;text-align:center;">
            <a href="{reset_url}" style="display:inline-block;background:linear-gradient(90deg,#6366f1,#22d3ee);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:10px;">
              Reset password
            </a>
          </p>
          <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.6;">
            This link expires in <strong style="color:#cbd5e1;">{settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes</strong> and can only be used once.
          </p>
          <p style="margin:0 0 16px;color:#64748b;font-size:12px;line-height:1.6;word-break:break-all;">
            If the button does not work, copy and paste this link into your browser:<br>
            <a href="{reset_url}" style="color:#818cf8;">{reset_url}</a>
          </p>
          <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #334155;color:#64748b;font-size:12px;line-height:1.6;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    return subject, plain, html


def send_password_reset_email(*, to_email: str, user_name: str, raw_token: str) -> bool:
    reset_url = _reset_url(raw_token)
    subject, plain, html = build_password_reset_email(reset_url=reset_url, user_name=user_name)

    if not settings.smtp_configured:
        logger.warning(
            "SMTP not configured — password reset link for %s: %s",
            to_email,
            reset_url,
        )
        return False

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
        logger.info("Password reset email sent to %s", to_email)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
        return False


def request_password_reset(db: Session, email: str) -> dict[str, str | None]:
    dev_reset_url: str | None = None
    user = db.query(User).filter(User.email == email.lower(), User.is_active == True).first()
    if user:
        raw_token = create_password_reset_token(db, user)
        reset_url = _reset_url(raw_token)
        email_sent = send_password_reset_email(
            to_email=user.email,
            user_name=user.full_name,
            raw_token=raw_token,
        )
        if not email_sent:
            dev_reset_url = reset_url
    return {"message": RESET_MESSAGE, "dev_reset_url": dev_reset_url}
