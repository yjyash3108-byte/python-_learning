"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { VerifyEmailBanner } from "@/components/profile/profile-analytics-panel";

type EmailStatusPanelProps = {
  smtpConfigured: boolean;
  email?: string;
  emailVerified?: boolean;
};

export function EmailStatusPanel({
  smtpConfigured,
  email,
  emailVerified = false,
}: EmailStatusPanelProps) {
  return (
    <div className="space-y-4">
      {!emailVerified && <VerifyEmailBanner verified={false} />}
      <GlassPanel depth="sm" className="p-6">
        <div className="flex items-start gap-3">
          {emailVerified ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
          ) : (
            <Mail className="mt-0.5 h-5 w-5 text-amber-400" />
          )}
          <div className="flex-1">
            <p className="font-medium">Email verification</p>
            {email && (
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            )}
            {emailVerified ? (
              <p className="mt-2 text-sm text-emerald-400">
                Your email is verified. You can post, message, and use all ScholarNet features.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Verify your email to unlock posting and messaging. Check your inbox or resend above.
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              emailVerified
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
            }`}
          >
            {emailVerified ? "Verified" : "Pending"}
          </span>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs text-muted-foreground">
            SMTP delivery: {smtpConfigured ? "configured" : "dev mode (links logged to API console)"}
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
