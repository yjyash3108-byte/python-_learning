import json
import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Payment, Subscription, User
from app.schemas.subscription import (
    CreateOrderResponse,
    PaymentHistoryItem,
    SubscriptionHistoryItem,
    SubscriptionHistoryResponse,
    SubscriptionStatusResponse,
    VerifyPaymentRequest,
)
from app.services.subscription import (
    activate_subscription,
    cancel_subscription,
    create_pro_order,
    get_active_subscription,
    mark_payment_failed,
    user_has_pro,
    verify_checkout_signature,
    verify_webhook_signature,
)
from app.services.subscription_email import send_pro_confirmation_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscription", tags=["subscription"])


def _status_response(db: Session, user: User) -> SubscriptionStatusResponse:
    active = get_active_subscription(db, user.id)
    if not active:
        return SubscriptionStatusResponse(is_pro=False)
    return SubscriptionStatusResponse(
        is_pro=True,
        plan_name=active.plan_name,
        status=active.status,
        amount=active.amount,
        start_date=active.start_date,
        expiry_date=active.expiry_date,
        renewal_date=active.expiry_date,
        subscription_id=active.id,
    )


@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not settings.razorpay_configured:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway is not configured. Add Razorpay keys to the server environment.",
        )
    try:
        subscription, order = create_pro_order(db, user)
    except Exception as exc:
        logger.exception("Failed to create Razorpay order for user %s", user.id)
        raise HTTPException(status_code=502, detail="Could not create payment order") from exc

    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order.get("currency", "INR"),
        key_id=settings.RAZORPAY_KEY_ID,
        plan_name=settings.PRO_PLAN_NAME,
        subscription_id=subscription.id,
    )


@router.post("/verify-payment", response_model=SubscriptionStatusResponse)
def verify_payment(
    body: VerifyPaymentRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not settings.razorpay_configured:
        raise HTTPException(status_code=503, detail="Payment gateway is not configured")

    try:
        verify_checkout_signature(
            order_id=body.razorpay_order_id,
            payment_id=body.razorpay_payment_id,
            signature=body.razorpay_signature,
        )
    except Exception as exc:
        logger.warning("Payment verification failed for user %s: %s", user.id, exc)
        mark_payment_failed(
            db,
            user_id=user.id,
            order_id=body.razorpay_order_id,
            payment_id=body.razorpay_payment_id,
        )
        raise HTTPException(status_code=400, detail="Payment verification failed") from exc

    try:
        subscription = activate_subscription(
            db,
            user=user,
            order_id=body.razorpay_order_id,
            payment_id=body.razorpay_payment_id,
        )
        send_pro_confirmation_email(user=user, subscription=subscription)
    except Exception as exc:
        logger.exception("Failed to activate subscription for user %s", user.id)
        raise HTTPException(status_code=500, detail="Could not activate subscription") from exc

    return _status_response(db, user)


@router.get("/status", response_model=SubscriptionStatusResponse)
def subscription_status(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _status_response(db, user)


@router.post("/cancel", response_model=SubscriptionStatusResponse)
def cancel_pro_subscription(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    subscription = cancel_subscription(db, user)
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription to cancel")
    return _status_response(db, user)


@router.get("/history", response_model=SubscriptionHistoryResponse)
def subscription_history(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    subscriptions = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
        .limit(50)
        .all()
    )
    payments = (
        db.query(Payment)
        .filter(Payment.user_id == user.id)
        .order_by(Payment.created_at.desc())
        .limit(50)
        .all()
    )

    payment_items: list[PaymentHistoryItem] = []
    for payment in payments:
        plan_name = None
        if payment.subscription_id:
            sub = db.query(Subscription).filter(Subscription.id == payment.subscription_id).first()
            plan_name = sub.plan_name if sub else None
        payment_items.append(
            PaymentHistoryItem(
                id=payment.id,
                amount=payment.amount,
                payment_method=payment.payment_method,
                transaction_id=payment.transaction_id,
                status=payment.status,
                created_at=payment.created_at,
                plan_name=plan_name,
            )
        )

    return SubscriptionHistoryResponse(
        subscriptions=[SubscriptionHistoryItem.model_validate(s) for s in subscriptions],
        payments=payment_items,
    )


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Annotated[Session, Depends(get_db)]):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing webhook signature")

    try:
        verify_webhook_signature(body, signature)
    except Exception as exc:
        logger.warning("Invalid Razorpay webhook signature")
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc

    payload = json.loads(body.decode("utf-8"))
    event = payload.get("event", "")
    entity = payload.get("payload", {})

    logger.info("Razorpay webhook received: %s", event)

    if event == "payment.captured":
        payment_entity = entity.get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        method = payment_entity.get("method")
        notes = payment_entity.get("notes") or {}
        user_id_raw = notes.get("user_id")
        if order_id and payment_id and user_id_raw:
            user = db.query(User).filter(User.id == UUID(str(user_id_raw))).first()
            if user:
                try:
                    subscription = activate_subscription(
                        db,
                        user=user,
                        order_id=order_id,
                        payment_id=payment_id,
                        payment_method=method,
                    )
                    send_pro_confirmation_email(user=user, subscription=subscription)
                except Exception:
                    logger.exception("Webhook activation failed for payment %s", payment_id)

    elif event == "payment.failed":
        payment_entity = entity.get("payment", {}).get("entity", {})
        mark_payment_failed(
            db,
            user_id=None,
            order_id=payment_entity.get("order_id"),
            payment_id=payment_entity.get("id"),
            payment_method=payment_entity.get("method"),
        )

    elif event == "subscription.cancelled":
        sub_entity = entity.get("subscription", {}).get("entity", {})
        notes = sub_entity.get("notes") or {}
        user_id_raw = notes.get("user_id")
        if user_id_raw:
            user = db.query(User).filter(User.id == UUID(str(user_id_raw))).first()
            if user:
                cancel_subscription(db, user)

    return {"status": "ok"}
