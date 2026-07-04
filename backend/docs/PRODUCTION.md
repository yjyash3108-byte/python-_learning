# Production Setup

Copy `backend/.env.example` to `backend/.env` and fill in values below.

## Checklist

| Service | Env vars | Get keys |
|---------|----------|----------|
| **Database** | `DATABASE_URL` | PostgreSQL connection string |
| **JWT** | `SECRET_KEY` | Random 32+ char string (required for production) |
| **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) |
| **Cloudinary** | `CLOUDINARY_*` | [Cloudinary Console](https://cloudinary.com/console) |
| **Email** | `SMTP_*`, `EMAIL_FROM` | Gmail, SendGrid, etc. |
| **AI Assistant** | `OPENAI_API_KEY` (optional) | [OpenAI API](https://platform.openai.com/api-keys) |

## Verify config

After starting the backend, check:

```
GET http://localhost:8000/health
```

Response includes `config.smtp`, `config.razorpay`, `config.cloudinary`, `config.openai`, `config.production_secret`.

Startup logs warn about any missing services.

## Frontend

Copy `.env.example` to `.env.local`:

```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production: use HTTPS URLs for `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`, and Razorpay webhook URL.

See also: [SUBSCRIPTION.md](./SUBSCRIPTION.md)
