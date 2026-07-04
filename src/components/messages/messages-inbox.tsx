"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Conversation, DirectMessage } from "@/types/messages";

type MessagesInboxProps = {
  initialConversations: Conversation[];
  initialMessages: DirectMessage[];
  selectedConversationId: string | null;
};

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesInbox({
  initialConversations,
  initialMessages,
  selectedConversationId,
}: MessagesInboxProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(selectedConversationId);
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageAtRef = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].created_at : null
  );

  const activeConversation = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    setError(null);
    apiGet<DirectMessage[]>(`/messages/conversations/${activeId}/messages`)
      .then((data) => {
        setMessages(data);
        lastMessageAtRef.current =
          data.length > 0 ? data[data.length - 1].created_at : null;
        return apiPost(`/messages/conversations/${activeId}/read`);
      })
      .then(() => {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, unread_count: 0 } : c))
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [activeId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      apiGet<Conversation[]>("/messages/conversations")
        .then(setConversations)
        .catch(() => {});
    }, 12000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const interval = window.setInterval(() => {
      const after = lastMessageAtRef.current;
      const path = after
        ? `/messages/conversations/${activeId}/poll?after=${encodeURIComponent(after)}`
        : `/messages/conversations/${activeId}/poll`;
      apiGet<DirectMessage[]>(path)
        .then((incoming) => {
          if (incoming.length === 0) return;
          lastMessageAtRef.current = incoming[incoming.length - 1].created_at;
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of incoming) {
              if (!ids.has(m.id)) merged.push(m);
            }
            return merged;
          });
        })
        .catch(() => {});
    }, 4000);
    return () => window.clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!activeId || !draft.trim()) return;
    setLoading(true);
    setError(null);
    const content = draft.trim();
    setDraft("");
    try {
      const msg = await apiPost<DirectMessage>(
        `/messages/conversations/${activeId}/messages`,
        { content }
      );
      setMessages((prev) => [...prev, msg]);
      lastMessageAtRef.current = msg.created_at;
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeId
              ? { ...c, last_message: content, last_message_at: msg.created_at }
              : c
          )
          .sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return tb - ta;
          })
      );
    } catch (e) {
      setDraft(content);
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[280px_1fr]">
      <GlassPanel depth="sm" className="flex flex-col overflow-hidden p-0">
        <div className="border-b border-white/10 p-4">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations yet. Message students you mutually follow from their profile.
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-white/5 p-4 text-left transition hover:bg-white/5",
                  activeId === conv.id && "bg-emerald-500/10"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={conv.other_user.profile_picture_url ?? undefined} />
                  <AvatarFallback>
                    {conv.other_user.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{conv.other_user.full_name}</span>
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.last_message ?? "No messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel depth="sm" className="flex flex-col overflow-hidden p-0">
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activeConversation.other_user.profile_picture_url ?? undefined} />
                <AvatarFallback>
                  {activeConversation.other_user.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/profile/${activeConversation.other_user.id}`}
                className="font-semibold hover:text-emerald-400"
              >
                {activeConversation.other_user.full_name}
              </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading && messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Loading…</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.is_mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      msg.is_mine
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        msg.is_mine ? "text-indigo-200" : "text-muted-foreground"
                      )}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-4">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                maxLength={2000}
                disabled={loading}
              />
              <Button type="submit" className="btn-3d shrink-0" disabled={loading || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-cyan-400" />
            <p className="text-sm text-muted-foreground">
              Select a conversation or visit a mutual connection&apos;s profile to start chatting.
            </p>
          </div>
        )}

        {error && (
          <p className="border-t border-white/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </GlassPanel>
    </div>
  );
}
