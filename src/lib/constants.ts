import type { PostCategory } from "@/types/models";

export const MIN_GRADE = 4;
export const MAX_GRADE = 12;

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "achievement", label: "Achievement" },
  { value: "project", label: "Project" },
  { value: "academics", label: "Academics" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "arts", label: "Arts" },
  { value: "music", label: "Music" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

export const APP_NAME = "ScholarNet";

export const DASHBOARD_NAV = [
  { href: "/feed", label: "Home", icon: "Home" },
  { href: "/search", label: "Search", icon: "Search" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/connections", label: "Connections", icon: "Users" },
  { href: "/projects", label: "Projects", icon: "FolderKanban" },
  { href: "/clubs", label: "Clubs", icon: "Orbit" },
  { href: "/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/schools", label: "Schools", icon: "Building2" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

/** @deprecated use DASHBOARD_NAV */
export const NAV_ITEMS = DASHBOARD_NAV;

export const MARKETING_NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#clubs", label: "Clubs" },
  { href: "#opportunities", label: "Opportunities" },
  { href: "#why", label: "Why Us" },
  { href: "#faq", label: "FAQ" },
] as const;
