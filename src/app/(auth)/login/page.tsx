import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300/80">
          Enter the campus
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white text-3d-glow sm:text-4xl">
          Welcome back
        </h1>
        <p className="text-slate-400">Sign in to {APP_NAME}</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-slate-400">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-indigo-300 transition hover:text-cyan-300"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
