import re
from dataclasses import dataclass


@dataclass
class ModerationResult:
    allowed: bool
    reason: str = ""
    flagged_patterns: list[str] | None = None


PROFANITY_PATTERNS = [
    re.compile(r"\b(damn|hell|shit|fuck|bitch|asshole)\b", re.IGNORECASE),
]

PII_PATTERNS = [
    ("phone", re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")),
    ("email", re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")),
    (
        "whatsapp",
        re.compile(r"\b(whatsapp|wa\.me|telegram|snapchat|insta\s*gram|dm\s+me)\b", re.IGNORECASE),
    ),
    ("address", re.compile(r"\b(street|st\.|avenue|ave\.|road|rd\.)\s+\d+", re.IGNORECASE)),
]


def moderate_content(text: str) -> ModerationResult:
    trimmed = (text or "").strip()
    if not trimmed:
        return ModerationResult(
            allowed=False,
            reason="Content cannot be empty.",
            flagged_patterns=["empty"],
        )

    flagged: list[str] = []
    for pattern in PROFANITY_PATTERNS:
        if pattern.search(trimmed):
            flagged.append("profanity")

    for name, pattern in PII_PATTERNS:
        if pattern.search(trimmed):
            flagged.append(name)

    if flagged:
        return ModerationResult(
            allowed=False,
            reason=(
                "Your content may contain language or personal contact details that are not allowed. "
                "Please remove them and try again."
            ),
            flagged_patterns=flagged,
        )

    return ModerationResult(allowed=True)


def require_allowed_content(text: str) -> None:
    from fastapi import HTTPException

    result = moderate_content(text)
    if not result.allowed:
        raise HTTPException(status_code=400, detail=result.reason)
