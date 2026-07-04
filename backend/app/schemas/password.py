import re

from pydantic import field_validator


PASSWORD_RULES_MESSAGE = (
    "Password must be at least 8 characters and include uppercase, lowercase, "
    "a number, and a special character"
)

_SPECIAL = re.compile(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]')


def validate_password_strength(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters")
    if len(value) > 72:
        raise ValueError("Password is too long (max 72 characters)")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must include at least one uppercase letter")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must include at least one lowercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must include at least one number")
    if not _SPECIAL.search(value):
        raise ValueError("Password must include at least one special character")
    return value


def password_field_validator():
    @field_validator("new_password", "password", check_fields=False)
    @classmethod
    def _validate(cls, v: str) -> str:
        return validate_password_strength(v)

    return _validate
