"""Weekly parent digest — run via cron: python -m scripts.parent_digest"""

from __future__ import annotations

import logging
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import Achievement, Post, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _parent_email(user: User) -> str | None:
    links = user.social_links or {}
    if not links.get("weekly_digest", True):
        return None
    email = links.get("parent_email")
    return str(email).strip() if email else None


def send_parent_digest() -> int:
    if not settings.smtp_configured:
        logger.warning("SMTP not configured — skipping parent digest")
        return 0

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    sent = 0

    with SessionLocal() as db:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            parent = _parent_email(user)
            if not parent:
                continue

            new_posts = (
                db.query(Post).filter(Post.author_id == user.id, Post.created_at >= week_ago).count()
            )
            new_achievements = (
                db.query(Achievement)
                .filter(Achievement.user_id == user.id, Achievement.created_at >= week_ago)
                .count()
            )
            if new_posts == 0 and new_achievements == 0:
                continue

            subject = f"{user.full_name}'s ScholarNet week in review"
            plain = f"""Hi,

Here's what {user.full_name} (Class {user.grade}, {user.school_name}) did on ScholarNet this week:

• {new_posts} new post(s)
• {new_achievements} new achievement(s)

Log in to ScholarNet to see their full portfolio.

— ScholarNet
"""
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = parent
            msg.attach(MIMEText(plain, "plain", "utf-8"))

            try:
                if settings.SMTP_PORT == 465:
                    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                        if settings.SMTP_USER and settings.SMTP_PASSWORD:
                            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                        server.sendmail(settings.EMAIL_FROM, [parent], msg.as_string())
                else:
                    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                        if settings.SMTP_USE_TLS:
                            server.starttls()
                        if settings.SMTP_USER and settings.SMTP_PASSWORD:
                            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                        server.sendmail(settings.EMAIL_FROM, [parent], msg.as_string())
                sent += 1
                logger.info("Digest sent to %s for student %s", parent, user.full_name)
            except Exception:
                logger.exception("Failed digest to %s", parent)

    logger.info("Parent digest complete: %d emails sent", sent)
    return sent


if __name__ == "__main__":
    send_parent_digest()
