import { BlockedUsersPanel } from "@/components/settings/blocked-users-panel";
import { ParentControlsPanel } from "@/components/settings/parent-controls-panel";

import { Settings } from "lucide-react";



import { GlassPanel } from "@/components/ui/glass-panel";

import { ThemeToggle } from "@/components/ui/theme-toggle";

import { SettingsForms } from "@/components/settings/settings-forms";

import { EmailStatusPanel } from "@/components/settings/email-status-panel";

import { SubscriptionPanel } from "@/components/subscription/subscription-panel";

import { getCurrentProfile } from "@/lib/data/profile";

import { getEmailConfigStatus } from "@/lib/data/health";

import { getSubscriptionHistory, getSubscriptionStatus } from "@/lib/data/subscription";



export const metadata = { title: "Settings" };



export default async function SettingsPage() {

  const [profile, status, history, emailConfig] = await Promise.all([

    getCurrentProfile(),

    getSubscriptionStatus(),

    getSubscriptionHistory(),

    getEmailConfigStatus(),

  ]);



  return (

    <div className="space-y-8">

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Account</p>

        <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">Settings</h1>

      </div>



      {profile && (

        <SubscriptionPanel

          status={status}

          history={history}

          userName={profile.full_name}

          userEmail={profile.email}

        />

      )}



      <EmailStatusPanel
        smtpConfigured={emailConfig.smtpConfigured}
        email={profile?.email}
        emailVerified={profile?.email_verified}
      />

      {profile && <BlockedUsersPanel />}



      <GlassPanel depth="sm" className="flex items-center justify-between p-6">

        <div>

          <p className="font-medium">Appearance</p>

          <p className="text-sm text-muted-foreground">Toggle dark and light mode</p>

        </div>

        <ThemeToggle />

      </GlassPanel>



      {profile && <ParentControlsPanel profile={profile} />}



      <SettingsForms />



      <GlassPanel depth="sm" className="flex items-center gap-3 p-6 text-sm text-muted-foreground">

        <Settings className="h-5 w-5 shrink-0" />

        <p>

          Need help? Review our{" "}

          <a href="/privacy" className="text-indigo-400 hover:underline">

            Privacy Policy

          </a>{" "}

          or contact support.

        </p>

      </GlassPanel>

    </div>

  );

}

