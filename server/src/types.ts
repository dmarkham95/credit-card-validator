/** Request body for POST /api/validate-card */
export interface ValidateCardRequest {
  cardNumber: string;
}

/**
 * Why a card number is invalid. Returned alongside `valid: false` so the
 * client can show a specific message without re-implementing any validation.
 */
export type InvalidCardReason =
  | "invalid_characters"
  | "invalid_length"
  | "luhn_check_failed";

/**
 * 200 response: the request was well-formed and a verdict was reached.
 * An invalid card number is a successful validation, not an error.
 */
export interface ValidateCardResponse {
  valid: boolean;
  reason?: InvalidCardReason;
}

/** 4xx response: the request itself was malformed (contract violation). */
export interface ApiErrorResponse {
  error: {
    code: "invalid_request";
    message: string;
  };
}
