export interface SubscriptionStatus {
  is_pro: boolean;
  plan_name?: string | null;
  status?: string | null;
  amount?: number | null;
  start_date?: string | null;
  expiry_date?: string | null;
  renewal_date?: string | null;
  subscription_id?: string | null;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan_name: string;
  subscription_id: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  payment_method: string | null;
  transaction_id: string | null;
  status: string;
  created_at: string;
  plan_name?: string | null;
}

export interface SubscriptionHistoryItem {
  id: string;
  plan_name: string;
  amount: number;
  status: string;
  start_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface SubscriptionHistory {
  subscriptions: SubscriptionHistoryItem[];
  payments: PaymentHistoryItem[];
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
