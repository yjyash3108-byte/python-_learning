import { serverFetchOptional } from "@/lib/api/server-client";

import { mapApiPost, type ApiPostRaw } from "@/lib/posts/map-post";

import type { Post } from "@/types/models";



type PaginatedPosts = {

  items: ApiPostRaw[];

  total: number;

  page: number;

  page_size: number;

  has_more: boolean;

};



export async function getFeedPosts(page = 1): Promise<{ posts: Post[]; hasMore: boolean }> {

  const data = await serverFetchOptional<PaginatedPosts>(

    `/api/v1/posts?page=${page}&page_size=20`

  );

  if (!data) return { posts: [], hasMore: false };

  return { posts: data.items.map(mapApiPost), hasMore: data.has_more };

}



export type { PaginatedPosts };


