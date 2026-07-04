"use client";

import { useActionState } from "react";
import { changePassword, changeEmail, deleteAccount, type SettingsActionState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";

const initial: SettingsActionState = {};

export function SettingsForms() {
  const [pwState, pwAction, pwPending] = useActionState(changePassword, initial);
  const [emailState, emailAction, emailPending] = useActionState(changeEmail, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, initial);

  return (
    <div className="space-y-6">
      <GlassPanel depth="sm" className="space-y-4 p-6">
        <h2 className="font-semibold">Change password</h2>
        {pwState.error && <p className="text-sm text-destructive">{pwState.error}</p>}
        {pwState.success && <p className="text-sm text-primary">{pwState.success}</p>}
        <form action={pwAction} className="space-y-3">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" required minLength={8} className="mt-1" />
          </div>
          <Button type="submit" disabled={pwPending} className="btn-3d">Update password</Button>
        </form>
      </GlassPanel>

      <GlassPanel depth="sm" className="space-y-4 p-6">
        <h2 className="font-semibold">Change email</h2>
        {emailState.error && <p className="text-sm text-destructive">{emailState.error}</p>}
        {emailState.success && <p className="text-sm text-primary">{emailState.success}</p>}
        <form action={emailAction} className="space-y-3">
          <div>
            <Label htmlFor="newEmail">New email</Label>
            <Input id="newEmail" name="newEmail" type="email" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Confirm password</Label>
            <Input id="password" name="password" type="password" required className="mt-1" />
          </div>
          <Button type="submit" disabled={emailPending} className="btn-3d">Update email</Button>
        </form>
      </GlassPanel>

      <GlassPanel depth="sm" className="space-y-4 p-6">
        <h2 className="font-semibold text-destructive">Delete account</h2>
        <p className="text-sm text-muted-foreground">This deactivates your account permanently.</p>
        {deleteState.error && <p className="text-sm text-destructive">{deleteState.error}</p>}
        <form action={deleteAction}>
          <Button type="submit" variant="destructive" disabled={deletePending}>
            {deletePending ? "Deleting…" : "Delete account"}
          </Button>
        </form>
      </GlassPanel>
    </div>
  );
}
