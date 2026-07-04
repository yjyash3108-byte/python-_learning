from datetime import datetime, timedelta, timezone
from uuid import UUID

import razorpay
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Payment, Subscription, User

ACTIVE_STATUSES = {"active"}


def get_razorpay_client() -> razorpay.Client:
    if not settings.razorpay_configured:
        raise RuntimeError("Razorpay is not configured")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def verify_checkout_signature(*, order_id: str, payment_id: str, signature: str) -> None:
    client = get_razorpay_client()
    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
    )


def verify_webhook_signature(body: bytes, signature: str) -> None:
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise RuntimeError("Razorpay webhook secret is not configured")
    client = get_razorpay_client()
    client.utility.verify_webhook_signature(body.decode("utf-8"), signature, settings.RAZORPAY_WEBHOOK_SECRET)


def get_active_subscription(db: Session, user_id: UUID) -> Subscription | None:
    now = datetime.now(timezone.utc)
    return (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.expiry_date.isnot(None),
            Subscription.expiry_date > now,
        )
        .order_by(Subscription.expiry_date.desc())
        .first()
    )


def user_has_pro(db: Session, user_id: UUID) -> bool:
    return get_active_subscription(db, user_id) is not None


def create_pro_order(db: Session, user: User) -> tuple[Subscription, dict]:
    client = get_razorpay_client()
    receipt = f"pro_{user.id.hex[:12]}_{int(datetime.now(timezone.utc).timestamp())}"
    order = client.order.create(
        {
            "amount": settings.pro_plan_amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "notes": {
                "user_id": str(user.id),
                "plan_name": settings.PRO_PLAN_NAME,
            },
        }
    )

    subscription = Subscription(
        user_id=user.id,
        plan_name=settings.PRO_PLAN_NAME,
        amount=settings.PRO_PLAN_AMOUNT_INR,
        status="pending",
        razorpay_order_id=order["id"],
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription, order


def activate_subscription(
    db: Session,
    *,
    user: User,
    order_id: str,
    payment_id: str,
    payment_method: str | None = None,
) -> Subscription:
    existing_payment = db.query(Payment).filter(Payment.transaction_id == payment_id).first()
    if existing_payment and existing_payment.status == "captured":
        subscription = (
            db.query(Subscription)
            .filter(Subscription.id == existing_payment.subscription_id)
            .first()
        )
        if subscription:
            return subscription

    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id, Subscription.razorpay_order_id == order_id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    if not subscription:
        raise ValueError("Subscription order not found")

    now = datetime.now(timezone.utc)
    start = now
    expiry = now + timedelta(days=settings.PRO_PLAN_DURATION_DAYS)

    active = get_active_subscription(db, user.id)
    if active and active.expiry_date and active.expiry_date > now:
        start = active.expiry_date
        expiry = active.expiry_date + timedelta(days=settings.PRO_PLAN_DURATION_DAYS)
        active.status = "expired"

    subscription.plan_name = settings.PRO_PLAN_NAME
    subscription.amount = settings.PRO_PLAN_AMOUNT_INR
    subscription.status = "active"
    subscription.start_date = start
    subscription.expiry_date = expiry
    subscription.razorpay_payment_id = payment_id

    payment = Payment(
        user_id=user.id,
        subscription_id=subscription.id,
        amount=settings.PRO_PLAN_AMOUNT_INR,
        payment_method=payment_method,
        transaction_id=payment_id,
        status="captured",
    )
    db.add(payment)
    db.commit()
    db.refresh(subscription)
    return subscription


def mark_payment_failed(
    db: Session,
    *,
    user_id: UUID | None,
    order_id: str | None,
    payment_id: str | None,
    payment_method: str | None = None,
) -> None:
    if order_id:
        subscription = (
            db.query(Subscription)
            .filter(Subscription.razorpay_order_id == order_id)
            .order_by(Subscription.created_at.desc())
            .first()
        )
        if subscription and subscription.status == "pending":
            subscription.status = "failed"
    if payment_id:
        payment = db.query(Payment).filter(Payment.transaction_id == payment_id).first()
        if payment:
            payment.status = "failed"
            if payment_method:
                payment.payment_method = payment_method
        elif user_id:
            db.add(
                Payment(
                    user_id=user_id,
                    amount=settings.PRO_PLAN_AMOUNT_INR,
                    payment_method=payment_method,
                    transaction_id=payment_id,
                    status="failed",
                )
            )
    db.commit()


def cancel_subscription(db: Session, user: User) -> Subscription | None:
    subscription = get_active_subscription(db, user.id)
    if not subscription:
        return None
    subscription.status = "cancelled"
    db.commit()
    db.refresh(subscription)
    return subscription
