import { useId, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ValidationResult } from "@/components/ValidationResult";
import { useCardValidation } from "@/hooks/useCardValidation";

export default function App() {
  const inputId = useId();
  const [cardNumber, setCardNumber] = useState("");
  const { state, validate, reset } = useCardValidation();

  const isLoading = state.status === "loading";
  // The only client-side gate is "don't submit nothing". All real validation
  // (digits, length, Luhn) is the server's job.
  const canSubmit = cardNumber.trim().length > 0 && !isLoading;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    void validate(cardNumber);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Credit Card Validator</CardTitle>
          <CardDescription>
            Enter a card number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor={inputId} className="text-sm font-medium">
                Card number
              </label>
              <Input
                id={inputId}
                inputMode="numeric"
                autoComplete="off"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(event) => {
                  setCardNumber(event.target.value);
                  if (state.status !== "idle") reset();
                }}
                aria-describedby={
                  state.status === "success" || state.status === "error"
                    ? `${inputId}-result`
                    : undefined
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Validating…" : "Validate"}
            </Button>
          </form>

          <div id={`${inputId}-result`} aria-live="polite" aria-atomic="true">
            {state.status === "success" && (
              <ValidationResult kind="result" result={state.result} />
            )}
            {state.status === "error" && (
              <ValidationResult kind="error" message={state.message} />
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
