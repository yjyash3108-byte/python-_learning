"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    apiPost("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified! You can now use all ScholarNet features.");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-300">
        <GraduationCap className="h-6 w-6" />
        ScholarNet
      </Link>
      <GlassPanel depth="md" className="max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">Email verification</h1>
        <p className={`mt-4 text-sm ${status === "error" ? "text-destructive" : status === "success" ? "text-emerald-400" : "text-muted-foreground"}`}>
          {message}
        </p>
        {status !== "loading" && (
          <Button asChild className="btn-3d mt-6">
            <Link href={status === "success" ? "/feed" : "/login"}>
              {status === "success" ? "Go to feed" : "Back to login"}
            </Link>
          </Button>
        )}
      </GlassPanel>
    </div>
  );
}
