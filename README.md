# ScholarNet

A safety-first social network for school students (Classes 4–12) to share achievements and connect with classmates.

**No database required** — uses in-memory storage and cookie sessions for local development and demos.

## Tech stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui
- **Data:** In-memory store (`src/lib/store`) — resets when the dev server restarts

## Quick start

```powershell
cd c:\Users\user\Desktop\yash.cursor
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo account

| Email | Password |
|-------|----------|
| `demo@school.edu` | `demo1234` |

Or create a new account on the signup page (stored in memory until restart).

## Project structure

| Path | Purpose |
|------|---------|
| `src/lib/store/` | Users, posts, feed logic (no DB) |
| `src/lib/auth/` | Session cookies + password hashing |
| `src/lib/moderation/` | `moderateContent` safety filter |
| `src/app/(auth)/` | Login & signup |
| `src/app/(dashboard)/` | Feed, profile, connections, messages |

## Notes

- Data does **not** persist across server restarts.
- For production, plug in a real database or auth provider later.
- Content moderation runs server-side before posts are saved.
