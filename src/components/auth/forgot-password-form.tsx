"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  type PasswordResetActionState,
} from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PasswordResetActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const [copied, setCopied] = useState(false);
  const emailError = state.fieldErrors?.email;

  async function copyDevLink() {
    if (!state.devResetUrl) return;
    try {
      await navigator.clipboard.writeText(state.devResetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">
          {state.success}
        </p>
      )}
      {state.success && state.devResetUrl && (
        <div className="space-y-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">
          <p>
            <strong className="font-medium">Development mode:</strong> email is not configured, so
            use this reset link instead:
          </p>
          <a
            href={state.devResetUrl}
            className="block break-all font-medium text-indigo-300 underline hover:text-indigo-200"
          >
            {state.devResetUrl}
          </a>
          <Button type="button" variant="outline" size="sm" onClick={copyDevLink}>
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
          required
        />
        {emailError && (
          <p id="email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        )}
      </div>

      <Button type="submit" className="btn-3d w-full" disabled={pending || Boolean(state.success)}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
          Back to login
        </Link>
      </p>
    </form>
  );
}
