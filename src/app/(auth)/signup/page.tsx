import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400/80">
          Join the galaxy
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white text-3d-glow sm:text-4xl">
          Join {APP_NAME}
        </h1>
        <p className="text-slate-400">A parent or guardian should help you sign up.</p>
      </div>
      <SignUpForm />
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-300 transition hover:text-cyan-300"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
