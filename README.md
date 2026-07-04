# ScholarNet

A professional networking platform for students — marketing landing page plus a full dashboard connected to a FastAPI + PostgreSQL backend.

## Features

- **Marketing landing** — 3D globe hero, animated sections, dark/light theme
- **Authentication** — Signup, login, JWT in httpOnly cookies, logout, protected routes
- **Feed** — Posts with like, comment, share, delete; pagination; dashboard stats
- **Profile** — Edit bio, city, skills; upload avatar via Cloudinary
- **Portfolio** — Projects, certificates, achievements (create & delete)
- **Connections** — Search students, schools, skills, clubs; follow/unfollow
- **Notifications** — Live list with mark-as-read
- **Settings** — Change password, email, delete account

## Tech stack

**Frontend:** Next.js 15 · TypeScript · Tailwind · shadcn/ui · Axios · React Three Fiber · Framer Motion

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · JWT · Cloudinary · Alembic-ready structure

## Quick start

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, optional Cloudinary keys
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

```powershell
cd C:\Users\user\Desktop\yash.cursor
copy .env.example .env.local
# Set API_URL=http://localhost:8000
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Create an account

Use **Sign up** at `/signup` — no demo credentials required. The backend stores users in PostgreSQL.

## Architecture

```
Browser
  → Next.js middleware (access_token cookie)
  → Server Components: serverFetch → FastAPI :8000
  → Client Components: axios → /api/backend/v1/* → BFF proxy → FastAPI
```

| Layer | Path |
|-------|------|
| API client (browser) | `src/lib/api/client.ts` |
| Server fetch | `src/lib/api/server-client.ts` |
| BFF proxy | `src/app/api/backend/[...path]/route.ts` |
| Auth actions | `src/actions/auth.ts` |
| Backend | `backend/app/` |

## Environment variables

**Frontend (`.env.local`):**

```
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (`backend/.env`):** see `backend/.env.example`

## Pages

| Route | API |
|-------|-----|
| `/signup`, `/login` | `/api/v1/auth/*` |
| `/feed` | posts, dashboard stats, notifications |
| `/profile` | `/api/v1/users/me` |
| `/@username` | `/api/v1/users/public/{username}` |
| `/search` | `/api/v1/search/global`, trending schools |
| `/projects`, `/achievements` | `/api/v1/portfolio` |
| `/connections` | `/api/v1/search/*`, `/api/v1/follows/*` |
| `/clubs` | `/api/v1/search/clubs` |
| `/settings` | `/api/v1/auth/change-password`, etc. |

## Production deploy

1. **PostgreSQL** — set `DATABASE_URL` on the API (use SSL in production).
2. **Backend** — deploy FastAPI (Railway, Render, Fly.io, or VPS). Set `FRONTEND_URL` and `SECRET_KEY` to production values. Configure SMTP for email verification and password reset.
3. **Frontend** — deploy Next.js (Vercel recommended). Set `API_URL` to your API origin (server-only). Set `NEXT_PUBLIC_SITE_URL` to your public domain for OG metadata and portfolio links.
4. **Cloudinary** — required for avatar and post image uploads in production.
5. **Razorpay** — optional; enables ScholarNet Pro subscriptions and profile viewer analytics.
6. **Parent digest** — schedule weekly: `cd backend && python scripts/parent_digest.py` (users opt in via `social_links.parent_email` + `weekly_digest` on profile).
7. **Migrations** — on deploy, the API runs `migrate.py` on startup; confirm `email_verified` and other columns exist.

See `backend/README.md` for full API reference.
