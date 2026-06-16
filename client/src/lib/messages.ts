import type { InvalidCardReason } from "@shared";

/**
 * Maps a server reason code to user-facing copy. This is presentation only —
 * the verdict itself is decided entirely on the server.
 */
export const INVALID_REASON_MESSAGES: Record<InvalidCardReason, string> = {
  invalid_characters: "Card numbers can only contain digits, spaces, or dashes.",
  invalid_length: "A card number must be 13 to 19 digits.",
  luhn_check_failed: "This card number is not valid.",
};
