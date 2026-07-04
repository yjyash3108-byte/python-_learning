"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { FeedList } from "@/components/feed/feed-list";
import { PageHeader } from "@/components/ui/page-header";
import { apiGet } from "@/lib/api/client";
import { mapApiPost, type ApiPostRaw } from "@/lib/posts/map-post";
import type { Post } from "@/types/models";

type ApiPage = {
  items: ApiPostRaw[];
  has_more: boolean;
  page: number;
};

type FeedSectionProps = {
  initialPosts: Post[];
  initialHasMore: boolean;
  currentUserId?: string;
};

export function FeedSection({ initialPosts, initialHasMore, currentUserId }: FeedSectionProps) {
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get("post");
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialPosts, initialHasMore]);

  const refresh = useCallback(async () => {
    const data = await apiGet<ApiPage>("/posts?page=1&page_size=20");
    setPosts(data.items.map(mapApiPost));
    setPage(1);
    setHasMore(data.has_more);
  }, []);

  useEffect(() => {
    if (!highlightPostId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`post-${highlightPostId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [highlightPostId, posts]);

  return (
    <>
      <PageHeader
        eyebrow="Live feed"
        title="Achievement feed"
        description="Recent posts from students across ScholarNet."
        action={<CreatePostDialog onPosted={refresh} />}
      />
      <FeedList
        posts={posts}
        setPosts={setPosts}
        page={page}
        setPage={setPage}
        hasMore={hasMore}
        setHasMore={setHasMore}
        currentUserId={currentUserId}
        onRefresh={refresh}
        highlightPostId={highlightPostId}
      />
    </>
  );
}
