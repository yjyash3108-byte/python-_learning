"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  resetPassword,
  type PasswordResetActionState,
} from "@/actions/password-reset";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: PasswordResetActionState = {};

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);
  const [password, setPassword] = useState("");

  const passwordError = state.fieldErrors?.password;
  const confirmError = state.fieldErrors?.confirmPassword;
  const tokenError = state.fieldErrors?.token;

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          This reset link is invalid or has expired. Request a new one below.
        </p>
        <Button asChild className="btn-3d w-full">
          <Link href="/forgot-password">Request new reset link</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />

      {tokenError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {tokenError}
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "password-error" : "password-strength"}
          required
        />
        {passwordError && (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        )}
        <div id="password-strength">
          <PasswordStrengthIndicator password={password} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(confirmError)}
          aria-describedby={confirmError ? "confirm-error" : undefined}
          required
        />
        {confirmError && (
          <p id="confirm-error" className="text-sm text-destructive">
            {confirmError}
          </p>
        )}
      </div>

      <Button type="submit" className="btn-3d w-full" disabled={pending}>
        {pending ? "Updating…" : "Reset password"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
          Back to login
        </Link>
      </p>
    </form>
  );
}
