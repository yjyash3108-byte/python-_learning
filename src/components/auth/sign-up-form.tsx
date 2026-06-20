"use client";

import { useActionState } from "react";
import { signUp, type AuthActionState } from "@/actions/auth";
import { MAX_GRADE, MIN_GRADE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.success}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Class / Grade (required)</Label>
        <select id="grade" name="grade" required className={cn(selectClassName)}>
          <option value="">Select your class</option>
          {Array.from(
            { length: MAX_GRADE - MIN_GRADE + 1 },
            (_, i) => MIN_GRADE + i
          ).map((g) => (
            <option key={g} value={g}>
              Class {g}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Only students in Classes {MIN_GRADE}–{MAX_GRADE} can join.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolName">School name</Label>
        <Input
          id="schoolName"
          name="schoolName"
          required
          placeholder="Your school"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="student@school.edu"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        By signing up, a parent or guardian confirms they allow this account.
        We do not collect phone numbers or home addresses.
      </p>

      <Button type="submit" className="btn-3d w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
