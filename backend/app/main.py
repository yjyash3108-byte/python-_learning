from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.core.local_storage import MEDIA_ROOT
from app.db.base import Base
from app.db.migrate import run_migrations
from app.db.session import engine

# Import models so metadata is registered
import app.models  # noqa: F401

app = FastAPI(
    title="ScholarNet API",
    description="Production backend for ScholarNet student professional network",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")


@app.on_event("startup")
def on_startup():
    import logging

    log = logging.getLogger("uvicorn.error")
    Base.metadata.create_all(bind=engine)
    run_migrations()

    from app.db.session import SessionLocal
    from app.services.opportunities import seed_opportunities

    db = SessionLocal()
    try:
        seed_opportunities(db)
        from app.models import User
        from app.services.username import unique_username

        for user in db.query(User).filter(User.username.is_(None)).all():
            user.username = unique_username(db, user.full_name, user.email)
        db.commit()
    finally:
        db.close()

    if not settings.smtp_configured:
        log.warning(
            "SMTP is not configured — password reset and Pro emails use dev fallback."
        )
    if not settings.razorpay_configured:
        log.warning("Razorpay is not configured — Pro checkout will fail.")
    if not settings.cloudinary_configured:
        log.warning("Cloudinary is not configured — uploads use local /media storage.")
    if not settings.production_ready:
        log.warning("SECRET_KEY is still a placeholder — change it before production.")


@app.get("/health")
@limiter.limit("60/minute")
def health(request: Request):
    return {
        "status": "ok",
        "service": "scholarnet-api",
        "config": {
            "smtp": settings.smtp_configured,
            "razorpay": settings.razorpay_configured,
            "cloudinary": settings.cloudinary_configured,
            "openai": settings.openai_configured,
            "production_secret": settings.production_ready,
        },
    }
