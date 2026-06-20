import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          Enter the campus
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Welcome back</h1>
        <p className="text-slate-400">Sign in to {APP_NAME}</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-slate-400">
        New here?{" "}
        <Link href="/signup" className="font-medium text-indigo-300 hover:text-indigo-200">
          Create an account
        </Link>
      </p>
    </div>
  );
}
