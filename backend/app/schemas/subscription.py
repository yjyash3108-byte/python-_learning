from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str = "INR"
    key_id: str
    plan_name: str
    subscription_id: UUID


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=3)
    razorpay_payment_id: str = Field(min_length=3)
    razorpay_signature: str = Field(min_length=3)


class SubscriptionStatusResponse(BaseModel):
    is_pro: bool
    plan_name: str | None = None
    status: str | None = None
    amount: int | None = None
    start_date: datetime | None = None
    expiry_date: datetime | None = None
    renewal_date: datetime | None = None
    subscription_id: UUID | None = None


class PaymentHistoryItem(BaseModel):
    id: UUID
    amount: int
    payment_method: str | None
    transaction_id: str | None
    status: str
    created_at: datetime
    plan_name: str | None = None

    model_config = {"from_attributes": True}


class SubscriptionHistoryItem(BaseModel):
    id: UUID
    plan_name: str
    amount: int
    status: str
    start_date: datetime | None
    expiry_date: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SubscriptionHistoryResponse(BaseModel):
    subscriptions: list[SubscriptionHistoryItem]
    payments: list[PaymentHistoryItem]
