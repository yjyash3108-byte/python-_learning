export const ACHIEVEMENT_CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "coding", label: "Coding" },
  { value: "hackathon", label: "Hackathon" },
  { value: "olympiad", label: "Olympiad" },
  { value: "sports", label: "Sports" },
  { value: "debate", label: "Debate" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "leadership", label: "Leadership" },
  { value: "volunteering", label: "Volunteering" },
  { value: "other", label: "Other" },
] as const;

export const ACHIEVEMENT_LEVELS = [
  { value: "school", label: "School" },
  { value: "district", label: "District" },
  { value: "state", label: "State" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "category", label: "By category" },
] as const;

export const CERTIFICATE_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "By title" },
] as const;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function categoryLabel(value: string): string {
  return ACHIEVEMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function levelLabel(value: string): string {
  return ACHIEVEMENT_LEVELS.find((l) => l.value === value)?.label ?? value;
}

export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().includes(".pdf");
}
