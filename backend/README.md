# ScholarNet Backend

FastAPI + PostgreSQL backend for ScholarNet.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

## API docs

- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Key routes

| Module | Prefix |
|--------|--------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Posts | `/api/v1/posts` |
| Portfolio | `/api/v1/portfolio` |
| Follows | `/api/v1/follow`, `/api/v1/followers`, `/api/v1/following` |
| Clubs | `/api/v1/clubs` |
| Messages | `/api/v1/messages` |
| Opportunities | `/api/v1/opportunities` |
| Achievements | `/api/v1/achievements` |
| Certificates | `/api/v1/certificates` |
| Subscription | `/api/v1/subscription` |

See [docs/SUBSCRIPTION.md](docs/SUBSCRIPTION.md) for Razorpay setup.
See [docs/PRODUCTION.md](docs/PRODUCTION.md) for full production checklist.
| Search | `/api/v1/search` |
| Notifications | `/api/v1/notifications` |
| Dashboard | `/api/v1/dashboard` |
| Uploads | `/api/v1/uploads` |
| Admin | `/api/v1/admin` |

### Password reset

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/forgot-password` | Request reset email (always returns generic success) |
| POST | `/api/v1/auth/reset-password` | Set new password with one-time token |

**Environment**

- `FRONTEND_URL` — base URL for reset links (use `https://` in production)
- `PASSWORD_RESET_EXPIRE_MINUTES` — token lifetime (default: 15)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` — optional SMTP delivery

When SMTP is not configured, reset links are returned in the forgot-password API response and shown on the page (local development). Configure SMTP for production email delivery.

**Security**

- Reset tokens are stored as SHA-256 hashes (never plain text in the database)
- Tokens expire after 15 minutes and are single-use
- All outstanding reset tokens for a user are invalidated after a successful reset
- Endpoints are rate-limited (`5/min` forgot, `10/min` reset)

## Database

Tables are auto-created on startup. For production use Alembic migrations.

## Frontend connection

The Next.js app proxies authenticated requests through `/api/backend/v1/*` and stores JWT in httpOnly `access_token` cookie.
