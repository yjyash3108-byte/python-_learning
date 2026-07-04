import { apiPost } from "@/lib/api/client";
import type { CreateOrderResponse, VerifyPaymentPayload } from "@/types/subscription";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export async function startProCheckout(input: {
  userName: string;
  userEmail: string;
  onSuccess: () => void;
  onFailure: (message: string) => void;
  onDismiss?: () => void;
}) {
  await loadRazorpayScript();

  const order = await apiPost<CreateOrderResponse>("/subscription/create-order");

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  return new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "ScholarNet",
      description: `${order.plan_name} — Monthly`,
      order_id: order.order_id,
      prefill: {
        name: input.userName,
        email: input.userEmail,
      },
      theme: { color: "#6366f1" },
      handler: async (response) => {
        try {
          const payload: VerifyPaymentPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          await apiPost("/subscription/verify-payment", payload);
          input.onSuccess();
          resolve();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Payment verification failed";
          input.onFailure(message);
          reject(new Error(message));
        }
      },
      modal: {
        ondismiss: () => {
          input.onDismiss?.();
          reject(new Error("Payment cancelled"));
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      const message = response.error?.description ?? "Payment failed";
      input.onFailure(message);
      reject(new Error(message));
    });

    rzp.open();
  });
}
