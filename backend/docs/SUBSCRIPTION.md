# ScholarNet Pro — Razorpay Subscription Setup

## Overview

ScholarNet Pro is a **₹299/month** subscription powered by [Razorpay](https://razorpay.com/). Payments support **UPI**, cards, net banking, and wallets.

## Environment variables

Add to `backend/.env`:

```env
# Razorpay (Test keys from Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Plan settings (optional overrides)
PRO_PLAN_NAME=ScholarNet Pro
PRO_PLAN_AMOUNT_INR=299
PRO_PLAN_DURATION_DAYS=30

FRONTEND_URL=http://localhost:3000
```

## Test mode

1. Create a [Razorpay account](https://dashboard.razorpay.com/signup).
2. Enable **Test Mode** in the dashboard.
3. Copy **Key ID** and **Key Secret** into `.env`.
4. Install backend deps: `pip install -r requirements.txt`
5. Restart the FastAPI server.
6. Log in to ScholarNet and open **Pro → Upgrade Now**.
7. Use Razorpay test UPI/card details from [Razorpay docs](https://razorpay.com/docs/payments/payments/test-card-upi-details/).

## Production mode

1. Complete Razorpay KYC and activate **Live Mode**.
2. Replace test keys with live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Set `FRONTEND_URL` to your HTTPS production domain.
4. Configure webhooks (below).
5. Enable SMTP for confirmation emails.

## Webhooks

In Razorpay Dashboard → **Settings → Webhooks**:

- **URL:** `https://your-api-domain.com/api/v1/subscription/webhook`
- **Events:**
  - `payment.captured`
  - `payment.failed`
  - `subscription.cancelled`
- Copy the **Webhook Secret** to `RAZORPAY_WEBHOOK_SECRET`.

Webhooks are verified with HMAC SHA256. Never skip signature verification.

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/subscription/create-order` | Create Razorpay order |
| POST | `/api/v1/subscription/verify-payment` | Verify checkout signature & activate Pro |
| GET | `/api/v1/subscription/status` | Current plan & renewal date |
| POST | `/api/v1/subscription/cancel` | Cancel (access until expiry) |
| GET | `/api/v1/subscription/history` | Subscriptions & payments |
| POST | `/api/v1/subscription/webhook` | Razorpay webhook handler |

## Payment flow

1. User clicks **Upgrade Now** on `/upgrade`.
2. Backend creates a Razorpay order and pending `subscriptions` row.
3. Razorpay Checkout opens (UPI, cards, net banking, wallets).
4. On success, frontend sends payment IDs to `/verify-payment`.
5. Backend verifies HMAC signature, activates subscription, records `payments` row.
6. Confirmation email sent (if SMTP configured).
7. User redirected to `/subscription/success`.

**Security:** Never trust frontend success alone. All activations require backend signature verification.

## Protecting Pro features

Use the FastAPI dependency:

```python
from app.core.subscription import require_pro_subscription

@router.post("/clubs")
def create_club(user: Annotated[User, Depends(require_pro_subscription)]):
    ...
```

Check status in frontend via `GET /api/v1/subscription/status`.

## Database tables

- **subscriptions** — plan, status, dates, Razorpay order/payment IDs
- **payments** — amount, method, transaction ID, status

Tables are created automatically on backend startup.

## Frontend pages

- `/upgrade` — pricing, comparison, FAQ
- `/subscription/success` — activation confirmation
- `/subscription/failure` — retry & support
- **Settings** — plan status, payment history, cancel/upgrade

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Payment gateway is not configured" | Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` |
| Verification failed | Ensure live/test keys match mode; check server logs |
| Webhook 400 | Verify `RAZORPAY_WEBHOOK_SECRET` and public webhook URL |
| No confirmation email | Configure SMTP in `.env` |
