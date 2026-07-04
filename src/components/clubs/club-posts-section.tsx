"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Textarea } from "@/components/ui/textarea";

type ClubPost = {
  id: string;
  club_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type ClubPostsSectionProps = {
  clubId: string;
  initialPosts: ClubPost[];
  isMember: boolean;
  currentUserId: string;
};

export function ClubPostsSection({
  clubId,
  initialPosts,
  isMember,
  currentUserId,
}: ClubPostsSectionProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const post = await apiPost<ClubPost>(`/clubs/${clubId}/posts`, { content: content.trim() });
      setPosts((prev) => [post, ...prev]);
      setContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setLoading(false);
    }
  }

  if (!isMember) {
    return (
      <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
        Join this club to view and post in the feed.
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-4">
      <GlassPanel depth="sm" className="space-y-3 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update with your club…"
          rows={3}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="button" size="sm" disabled={loading || !content.trim()} onClick={handlePost} className="btn-3d">
          {loading ? "Posting…" : "Post to feed"}
        </Button>
      </GlassPanel>

      {posts.length === 0 ? (
        <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
          No posts yet. Start the conversation!
        </GlassPanel>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <GlassPanel depth="sm" className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {p.author_name}
                    {p.author_id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.content}</p>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
