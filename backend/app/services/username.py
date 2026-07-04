import re
import unicodedata

from sqlalchemy.orm import Session

from app.models import User


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug or "school"


def slugify_username(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-z0-9_]", "", ascii_text.lower().replace(" ", ""))
    return (base[:24] or "student")


def unique_username(db: Session, full_name: str, email: str) -> str:
    candidates = [slugify_username(full_name)]
    if "@" in email:
        candidates.append(slugify_username(email.split("@")[0]))

    for base in candidates:
        if not base:
            continue
        if not db.query(User).filter(User.username == base).first():
            return base
        for i in range(2, 1000):
            candidate = f"{base}{i}"[:30]
            if not db.query(User).filter(User.username == candidate).first():
                return candidate

    return f"student{db.query(User).count() + 1}"
