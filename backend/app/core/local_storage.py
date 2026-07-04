import uuid
from pathlib import Path

MEDIA_ROOT = Path(__file__).resolve().parents[2] / "media"

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
}

MAX_DOCUMENT_BYTES = 10 * 1024 * 1024


def save_image(contents: bytes, folder: str, content_type: str | None, base_url: str) -> str:
    ext = "jpg"
    if content_type == "image/png":
        ext = "png"
    elif content_type == "image/webp":
        ext = "webp"
    elif content_type == "image/gif":
        ext = "gif"

    dest_dir = MEDIA_ROOT / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    (dest_dir / name).write_bytes(contents)
    return f"{base_url.rstrip('/')}/media/{folder}/{name}"


def save_document(contents: bytes, folder: str, content_type: str | None, base_url: str) -> str:
    if not content_type or content_type not in ALLOWED_DOCUMENT_TYPES:
        raise ValueError("Unsupported file type")
    if len(contents) > MAX_DOCUMENT_BYTES:
        raise ValueError("File must be under 10MB")

    ext = ALLOWED_DOCUMENT_TYPES[content_type]
    dest_dir = MEDIA_ROOT / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    (dest_dir / name).write_bytes(contents)
    return f"{base_url.rstrip('/')}/media/{folder}/{name}"
