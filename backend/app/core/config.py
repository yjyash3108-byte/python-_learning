from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/scholarnet"
    SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    FRONTEND_URL: str = "http://localhost:3000"
    PASSWORD_RESET_EXPIRE_MINUTES: int = 15

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "noreply@scholarnet.app"

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    PRO_PLAN_NAME: str = "ScholarNet Pro"
    PRO_PLAN_AMOUNT_INR: int = 299
    PRO_PLAN_DURATION_DAYS: int = 30

    FREE_MAX_CLUBS_CREATED: int = 1
    FREE_MAX_CLUB_MEMBERS: int = 50
    FREE_MAX_CLUB_ADMINS: int = 1
    FREE_MAX_CLUB_EVENTS: int = 3
    FREE_MAX_CLUB_ANNOUNCEMENTS: int = 5

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    @property
    def openai_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY.strip())

    @property
    def cloudinary_configured(self) -> bool:
        return bool(
            self.CLOUDINARY_CLOUD_NAME.strip()
            and self.CLOUDINARY_API_KEY.strip()
            and self.CLOUDINARY_API_SECRET.strip()
        )

    @property
    def production_ready(self) -> bool:
        return (
            self.SECRET_KEY != "dev-secret-change-in-production-min-32-chars"
            and "change-me" not in self.SECRET_KEY.lower()
        )

    @property
    def smtp_configured(self) -> bool:
        return bool(self.SMTP_HOST.strip())

    @property
    def razorpay_configured(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID.strip() and self.RAZORPAY_KEY_SECRET.strip())

    @property
    def pro_plan_amount_paise(self) -> int:
        return self.PRO_PLAN_AMOUNT_INR * 100


settings = Settings()
