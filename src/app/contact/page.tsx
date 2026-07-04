"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { apiPost } from "@/lib/api/client";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiPost("/contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-xl px-4 py-24">
        <div className="mb-8 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">Contact us</h1>
        </div>
        <p className="mb-6 text-muted-foreground">
          Questions about accounts, schools, or partnerships? We&apos;d love to hear from you.
        </p>
        <GlassPanel depth="sm" className="p-6">
          {sent ? (
            <div className="space-y-2 text-emerald-400">
              <p>Thanks for reaching out! We&apos;ll respond within 2 business days.</p>
              <p className="text-sm text-muted-foreground">
                You can also email{" "}
                <a href="mailto:hello@scholarnet.app" className="text-indigo-400 underline">
                  hello@scholarnet.app
                </a>{" "}
                directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="btn-3d w-full" disabled={loading}>
                {loading ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </GlassPanel>
        <p className="mt-6 text-sm text-muted-foreground">
          Or email directly:{" "}
          <a href="mailto:hello@scholarnet.app" className="text-indigo-400 hover:underline">
            hello@scholarnet.app
          </a>
          {" · "}
          <Link href="/faq" className="text-indigo-400 hover:underline">
            Browse FAQ
          </Link>
        </p>
      </main>
      <MarketingFooter />
    </>
  );
}
