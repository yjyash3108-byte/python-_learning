"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api/client";
import type { Conversation } from "@/types/messages";

type MessageUserButtonProps = {
  userId: string;
  className?: string;
};

export function MessageUserButton({ userId, className }: MessageUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startConversation() {
    setLoading(true);
    setError(null);
    try {
      const conv = await apiPost<Conversation>("/messages/conversations", {
        other_user_id: userId,
      });
      router.push(`/messages?conversation=${conv.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot message this user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-2"
        disabled={loading}
        onClick={startConversation}
      >
        <MessageSquare className="h-4 w-4" />
        {loading ? "…" : "Message"}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
