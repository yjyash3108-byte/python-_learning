import type { PostCategory } from "@/types/models";

/** Valid grade range for Indian/international school classes */
export const MIN_GRADE = 4;
export const MAX_GRADE = 12;

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "arts", label: "Arts" },
  { value: "academics", label: "Academics" },
  { value: "music", label: "Music" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

export const NAV_ITEMS = [
  { href: "/feed", label: "Home / Feed", icon: "Home" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/connections", label: "Connections", icon: "Users" },
  { href: "/messages", label: "Messages", icon: "MessageSquare" },
] as const;

export const APP_NAME = "ScholarNet";
