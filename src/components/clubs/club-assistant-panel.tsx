"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Crown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ClubAssistantPanelProps = {
  clubId: string;
  clubName: string;
  isProClub: boolean;
  isMember: boolean;
};

export function ClubAssistantPanel({
  clubId,
  clubName,
  isProClub,
  isMember,
}: ClubAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm the ${clubName} assistant. Ask about events, members, or announcements.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isMember) {
    return (
      <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
        Join this club to use the AI assistant.
      </GlassPanel>
    );
  }

  if (!isProClub) {
    return (
      <GlassPanel depth="sm" className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bot className="h-8 w-8 shrink-0 text-cyan-400" />
          <div>
            <p className="font-medium">AI Club Assistant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pro clubs get an AI assistant for events, growth tips, and member engagement.
            </p>
          </div>
        </div>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white btn-3d"
        >
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </Link>
      </GlassPanel>
    );
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || loading) return;
    const text = draft.trim();
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ reply: string }>(`/clubs/${clubId}/assistant`, {
        message: text,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assistant unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold">AI Club Assistant</h2>
      </div>
      <GlassPanel depth="sm" className="flex h-80 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about events, members, growth…"
            maxLength={2000}
            disabled={loading}
          />
          <Button type="submit" size="icon" className="btn-3d shrink-0" disabled={loading || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </GlassPanel>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
