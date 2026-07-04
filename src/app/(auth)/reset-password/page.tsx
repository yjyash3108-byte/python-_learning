import { Suspense } from "react";
import { ResetPasswordFormWrapper } from "@/components/auth/reset-password-form-wrapper";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          Account recovery
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Choose a new password</h1>
        <p className="text-slate-400">
          Set a strong password for your {APP_NAME} account. This link expires in 15 minutes.
        </p>
      </div>
      <Suspense fallback={null}>
        <ResetPasswordFormWrapper />
      </Suspense>
    </div>
  );
}
