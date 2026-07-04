import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          Account recovery
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Forgot password?</h1>
        <p className="text-slate-400">
          Enter your email and we&apos;ll send you a link to reset your {APP_NAME} password.
        </p>
      </div>
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
      <p className="text-center text-sm text-slate-400">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
