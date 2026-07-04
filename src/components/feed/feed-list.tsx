"use client";



import { useState } from "react";

import { apiGet } from "@/lib/api/client";

import { mapApiPost, type ApiPostRaw } from "@/lib/posts/map-post";

import type { Post } from "@/types/models";

import { PostCard } from "@/components/feed/post-card";

import { GlassPanel } from "@/components/ui/glass-panel";

import { Button } from "@/components/ui/button";



type ApiPage = {

  items: ApiPostRaw[];

  has_more: boolean;

  page: number;

};



interface FeedListProps {

  posts: Post[];

  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;

  page: number;

  setPage: React.Dispatch<React.SetStateAction<number>>;

  hasMore: boolean;

  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;

  currentUserId?: string;

  onRefresh: () => Promise<void>;

  highlightPostId?: string | null;

}



export function FeedList({

  posts,

  setPosts,

  page,

  setPage,

  hasMore,

  setHasMore,

  currentUserId,

  onRefresh,

  highlightPostId,

}: FeedListProps) {

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  async function loadMore() {

    setLoading(true);

    setError(null);

    try {

      const next = page + 1;

      const data = await apiGet<ApiPage>(`/posts?page=${next}&page_size=20`);

      setPosts((prev) => [...prev, ...data.items.map(mapApiPost)]);

      setPage(next);

      setHasMore(data.has_more);

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed to load more");

    } finally {

      setLoading(false);

    }

  }



  if (posts.length === 0) {

    return (

      <GlassPanel depth="sm" tilt className="px-6 py-12 text-center">

        <p className="font-medium text-white">No posts yet</p>

        <p className="mt-2 text-sm text-muted-foreground">

          Share your first achievement, or check back when classmates post.

        </p>

      </GlassPanel>

    );

  }



  return (

    <div className="space-y-5">

      {error && (

        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>

      )}

      {posts.map((post) => (

        <PostCard

          key={post.id}

          post={post}

          currentUserId={currentUserId}

          onUpdate={onRefresh}

          highlighted={highlightPostId === post.id}

        />

      ))}

      {hasMore && (

        <div className="flex justify-center pt-2">

          <Button variant="outline" disabled={loading} onClick={loadMore} className="border-white/15 bg-white/5">

            {loading ? "Loading…" : "Load more"}

          </Button>

        </div>

      )}

    </div>

  );

}

