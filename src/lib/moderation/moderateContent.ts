/**
 * Content moderation placeholder for ScholarNet.
 *
 * PRODUCTION: Replace with a trusted moderation API (e.g. Azure Content Safety,
 * Google Perspective, or a human-in-the-loop queue). Never rely on regex alone
 * for child safety platforms.
 */

export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: string; flaggedPatterns: string[] };

/** Basic profanity blocklist — extend or swap for a real service */
const PROFANITY_PATTERNS = [
  /\b(damn|hell|shit|fuck|bitch|asshole)\b/gi,
];

/** Patterns that may expose minors to contact off-platform */
const PII_PATTERNS = [
  { name: "phone", regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
  { name: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: "whatsapp", regex: /\b(whatsapp|wa\.me|telegram|snapchat|insta\s*gram|dm\s+me)\b/gi },
  { name: "address", regex: /\b(street|st\.|avenue|ave\.|road|rd\.)\s+\d+/gi },
];

/**
 * Simulates text filtering before posts are saved.
 * Call from server actions and API routes — never trust client-side checks alone.
 */
export function moderateContent(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { allowed: false, reason: "Content cannot be empty.", flaggedPatterns: ["empty"] };
  }

  const flagged: string[] = [];

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      flagged.push("profanity");
      pattern.lastIndex = 0;
    }
  }

  for (const { name, regex } of PII_PATTERNS) {
    if (regex.test(trimmed)) {
      flagged.push(name);
      regex.lastIndex = 0;
    }
  }

  if (flagged.length > 0) {
    return {
      allowed: false,
      reason:
        "Your post may contain language or personal contact details that are not allowed. Please remove them and try again.",
      flaggedPatterns: flagged,
    };
  }

  return { allowed: true };
}
