import type {
  ApiErrorResponse,
  ValidateCardRequest,
  ValidateCardResponse,
} from "@shared";

/** Thrown when the request itself failed (network down, 4xx/5xx, bad JSON). */
export class ApiError extends Error {}

/**
 * Calls the backend validation endpoint. All validation happens server-side;
 * this just sends the raw input and returns the verdict.
 *
 * Resolves with the verdict for any well-formed request (including
 * `valid: false`). Rejects with ApiError when the request could not be
 * completed, so the UI can distinguish "card is invalid" from "request failed".
 */
export async function validateCard(
  cardNumber: string,
): Promise<ValidateCardResponse> {
  const body: ValidateCardRequest = { cardNumber };

  let response: Response;
  try {
    response = await fetch("/api/validate-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Please try again.");
  }

  if (!response.ok) {
    const message = await response
      .json()
      .then((data: ApiErrorResponse) => data.error?.message)
      .catch(() => undefined);
    throw new ApiError(message ?? "Something went wrong validating the card.");
  }

  return response.json() as Promise<ValidateCardResponse>;
}
