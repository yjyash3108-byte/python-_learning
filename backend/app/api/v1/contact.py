import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings
from app.core.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])

CONTACT_TO = "hello@scholarnet.app"


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)


def _send_contact_email(name: str, email: str, message: str) -> bool:
    subject = f"[ScholarNet Contact] Message from {name}"
    plain = f"""New contact form submission

From: {name} <{email}>

{message}
"""
    html = f"""<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:32px;">
<h2 style="color:#818cf8;">Contact form</h2>
<p><strong>From:</strong> {name} &lt;{email}&gt;</p>
<p style="white-space:pre-wrap;">{message}</p>
</body></html>"""

    if not settings.smtp_configured:
        logger.info("Contact form (SMTP off) from %s <%s>: %s", name, email, message[:200])
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = CONTACT_TO
    msg["Reply-To"] = email
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [CONTACT_TO], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [CONTACT_TO], msg.as_string())
        return True
    except Exception:
        logger.exception("Failed to send contact email from %s", email)
        return False


@router.post("")
@limiter.limit("5/hour")
def submit_contact(request: Request, body: ContactRequest):
    sent = _send_contact_email(body.name.strip(), str(body.email), body.message.strip())
    if not sent and settings.smtp_configured:
        raise HTTPException(status_code=503, detail="Could not send message. Try again later.")
    return {
        "message": "Thanks for reaching out! We'll respond within 2 business days.",
        "delivered": sent,
    }
