import { z } from "zod";
import { MAX_GRADE, MIN_GRADE } from "@/lib/constants";

/** Shared grade validation for signup forms and server actions */
export const gradeSchema = z.coerce
  .number()
  .int("Grade must be a whole number")
  .min(MIN_GRADE, `Grade must be at least Class ${MIN_GRADE}`)
  .max(MAX_GRADE, `Grade must be at most Class ${MAX_GRADE}`);

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  grade: gradeSchema,
  schoolName: z
    .string()
    .min(2, "School name is required")
    .max(120, "School name is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Write something about your post")
    .max(2000, "Post is too long (max 2000 characters)"),
  category: z.enum([
    "achievement",
    "project",
    "sports",
    "science",
    "arts",
    "academics",
    "music",
    "community",
    "other",
  ]),
  imageUrls: z.array(z.string()).max(4).optional().default([]),
  linkUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Enter a valid project link (https://…)"),
  hashtags: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
});

export function parseHashtags(raw: string): string[] {
  if (!raw.trim()) return [];
  return [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .map((t) => t.trim().replace(/^#+/, "").toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 40)
    ),
  ].slice(0, 10);
}

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
