import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.models import Subscription, User

logger = logging.getLogger(__name__)


def send_pro_confirmation_email(*, user: User, subscription: Subscription) -> None:
    expiry = subscription.expiry_date.strftime("%d %B %Y") if subscription.expiry_date else "—"
    subject = "Welcome to ScholarNet Pro!"
    plain = f"""Hi {user.full_name},

Your ScholarNet Pro subscription is now active.

Plan: {subscription.plan_name}
Amount: ₹{subscription.amount}/month
Renewal date: {expiry}

Thank you for supporting ScholarNet!

— ScholarNet Team
"""
    html = f"""<!DOCTYPE html>
<html><body style="font-family:Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;">
    <h1 style="color:#fff;margin:0 0 16px;">Welcome to ScholarNet Pro!</h1>
    <p>Hi {user.full_name},</p>
    <p>Your payment was successful and your Pro subscription is now active.</p>
    <ul style="color:#94a3b8;line-height:1.8;">
      <li><strong style="color:#cbd5e1;">Plan:</strong> {subscription.plan_name}</li>
      <li><strong style="color:#cbd5e1;">Amount:</strong> ₹{subscription.amount}/month</li>
      <li><strong style="color:#cbd5e1;">Renewal date:</strong> {expiry}</li>
    </ul>
    <p style="margin-top:24px;color:#64748b;font-size:13px;">Enjoy unlimited clubs, events, analytics, and more.</p>
  </div>
</body></html>"""

    if not settings.smtp_configured:
        logger.info("SMTP not configured — Pro confirmation for %s (renewal %s)", user.email, expiry)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = user.email
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [user.email], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [user.email], msg.as_string())
        logger.info("Pro confirmation email sent to %s", user.email)
    except Exception:
        logger.exception("Failed to send Pro confirmation email to %s", user.email)
