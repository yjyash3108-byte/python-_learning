import { randomUUID } from "crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { Post, PostCategory, StoredUser, UserProfile } from "@/types/models";

type StoreState = {
  users: Map<string, StoredUser>;
  posts: Post[];
};

declare global {
  var __scholarnetStore: StoreState | undefined;
}

function createStore(): StoreState {
  const users = new Map<string, StoredUser>();
  const posts: Post[] = [];

  const now = new Date().toISOString();
  const demoUser: StoredUser = {
    id: "demo-user-1",
    email: "demo@school.edu",
    full_name: "Alex Student",
    grade: 8,
    school_name: "Riverside Academy",
    bio: "Love science fairs and cricket!",
    profile_picture_url: null,
    password_hash: hashPassword("demo1234"),
    created_at: now,
    updated_at: now,
  };

  users.set(demoUser.id, demoUser);

  posts.push({
    id: randomUUID(),
    author_id: demoUser.id,
    content:
      "Won 2nd place in our school science fair with a water purification project!",
    image_urls: [],
    category: "science",
    is_moderated: true,
    moderation_notes: null,
    created_at: now,
    updated_at: now,
  });

  return { users, posts };
}

function getStore(): StoreState {
  if (!global.__scholarnetStore) {
    global.__scholarnetStore = createStore();
  }
  return global.__scholarnetStore;
}

export function toPublicUser(user: StoredUser): UserProfile {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...profile } = user;
  return profile;
}

export function getUserById(id: string): UserProfile | null {
  const user = getStore().users.get(id);
  return user ? toPublicUser(user) : null;
}

export function getUserByEmail(email: string): StoredUser | null {
  const normalized = email.trim().toLowerCase();
  for (const user of getStore().users.values()) {
    if (user.email.toLowerCase() === normalized) return user;
  }
  return null;
}

export function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  grade: number;
  schoolName: string;
}): UserProfile | { error: string } {
  const store = getStore();
  const email = input.email.trim().toLowerCase();

  if (getUserByEmail(email)) {
    return { error: "An account with this email already exists." };
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: randomUUID(),
    email,
    full_name: input.fullName.trim(),
    grade: input.grade,
    school_name: input.schoolName.trim(),
    bio: "",
    profile_picture_url: null,
    password_hash: hashPassword(input.password),
    created_at: now,
    updated_at: now,
  };

  store.users.set(user.id, user);
  return toPublicUser(user);
}

export function authenticateUser(
  email: string,
  password: string
): UserProfile | null {
  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }
  return toPublicUser(user);
}

function canViewPost(viewer: UserProfile, post: Post, author: UserProfile): boolean {
  if (viewer.id === post.author_id) return true;
  if (viewer.school_name === author.school_name) {
    return Math.abs(viewer.grade - author.grade) <= 2;
  }
  return false;
}

export function getFeedPostsForUser(viewerId: string): Post[] {
  const viewer = getUserById(viewerId);
  if (!viewer) return [];

  const store = getStore();

  const visible: Post[] = [];

  for (const post of store.posts) {
    const author = getUserById(post.author_id);
    if (!author || !canViewPost(viewer, post, author)) continue;
    visible.push({
      ...post,
      author: {
        full_name: author.full_name,
        grade: author.grade,
        school_name: author.school_name,
        profile_picture_url: author.profile_picture_url,
      },
    });
  }

  return visible.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function createPostForUser(
  authorId: string,
  input: { content: string; category: PostCategory; imageUrls?: string[] }
): Post | { error: string } {
  const author = getUserById(authorId);
  if (!author) return { error: "User not found." };

  const now = new Date().toISOString();
  const post: Post = {
    id: randomUUID(),
    author_id: authorId,
    content: input.content,
    image_urls: input.imageUrls ?? [],
    category: input.category,
    is_moderated: true,
    moderation_notes: null,
    created_at: now,
    updated_at: now,
    author: {
      full_name: author.full_name,
      grade: author.grade,
      school_name: author.school_name,
      profile_picture_url: author.profile_picture_url,
    },
  };

  getStore().posts.unshift(post);
  return post;
}
