import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { ValidateCardResponse } from "@shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { INVALID_REASON_MESSAGES } from "@/lib/messages";

type Props =
  | { kind: "result"; result: ValidateCardResponse }
  | { kind: "error"; message: string };

/**
 * Renders the validation verdict (or a request error). Wrapped in an
 * aria-live region by the caller so screen readers announce updates.
 */
export function ValidationResult(props: Props) {
  if (props.kind === "error") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Couldn’t validate</AlertTitle>
        <AlertDescription>{props.message}</AlertDescription>
      </Alert>
    );
  }

  const { result } = props;

  if (result.valid) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Valid card number</AlertTitle>
        <AlertDescription>This number passes the Luhn check.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Invalid card number</AlertTitle>
      <AlertDescription>
        {result.reason
          ? INVALID_REASON_MESSAGES[result.reason]
          : "This card number is not valid."}
      </AlertDescription>
    </Alert>
  );
}
