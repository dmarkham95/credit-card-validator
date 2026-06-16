import type { ValidateCardResponse } from "./types.js";
import { luhn } from "./luhn.js";

/**
 * ISO/IEC 7812 permits payment card numbers of 13 to 19 digits. We guard this
 * range so that a stray short/long string can't accidentally satisfy Luhn.
 */
const MIN_DIGITS = 13;
const MAX_DIGITS = 19;

/** Characters we treat as cosmetic separators and strip before validating. */
const SEPARATORS = /[\s-]/g;

/**
 * Validation policy for a raw, user-entered card number.
 *
 * Note the layering: this function decides *what makes a card number valid*
 * (separators, allowed characters, length, then the Luhn checksum) and returns
 * a structured verdict. It knows nothing about HTTP. The result is the same
 * shape the API returns to the client, so the client never re-implements any
 * validation rules of its own.
 *
 * A number that merely fails the checksum is a successful, well-formed answer
 * (`valid: false`) — not an error.
 */
export function validateCardNumber(raw: string): ValidateCardResponse {
  const normalized = raw.replace(SEPARATORS, "");

  if (normalized.length === 0) {
    return { valid: false, reason: "invalid_length" };
  }

  if (/\D/.test(normalized)) {
    return { valid: false, reason: "invalid_characters" };
  }

  if (normalized.length < MIN_DIGITS || normalized.length > MAX_DIGITS) {
    return { valid: false, reason: "invalid_length" };
  }

  if (!luhn(normalized)) {
    return { valid: false, reason: "luhn_check_failed" };
  }

  return { valid: true };
}
