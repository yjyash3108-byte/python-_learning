"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const expired = searchParams.get("expired") === "1";
  const offline = searchParams.get("offline") === "1";
  const resetSuccess = searchParams.get("reset") === "success";
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
      {resetSuccess && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">
          Your password has been reset. Sign in with your new password.
        </p>
      )}
      {offline && (
        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Cannot reach the API. Start the backend on port 8000, then sign in again.
        </p>
      )}
      {expired && !offline && (
        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Your session expired. Please sign in again.
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="btn-3d w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
