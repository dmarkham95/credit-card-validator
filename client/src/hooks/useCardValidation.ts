import { useState } from "react";
import type { ValidateCardResponse } from "@shared";
import { ApiError, validateCard } from "@/lib/api";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ValidateCardResponse }
  | { status: "error"; message: string };

/**
 * Owns the request lifecycle for card validation: idle -> loading ->
 * success | error. Keeps "the card is invalid" (a successful response)
 * separate from "the request failed" (an error).
 */
export function useCardValidation() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function validate(cardNumber: string) {
    setState({ status: "loading" });
    try {
      const result = await validateCard(cardNumber);
      setState({ status: "success", result });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong validating the card.";
      setState({ status: "error", message });
    }
  }

  function reset() {
    setState({ status: "idle" });
  }

  return { state, validate, reset };
}
