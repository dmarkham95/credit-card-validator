import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import type {
  ApiErrorResponse,
  ValidateCardRequest,
  ValidateCardResponse,
} from "./types.js";
import { validateCardNumber } from "./validateCardNumber.js";

// The production build of the client. When it exists (after `npm run build`),
// the server serves it directly so the whole app runs as one process on one
// port — no separate dev server or proxy needed.
const serverDir = path.dirname(fileURLToPath(import.meta.url)); // server/src
const clientDist = path.resolve(serverDir, "../../client/dist");

function badRequest(res: Response, message: string) {
  const body: ApiErrorResponse = {
    error: { code: "invalid_request", message },
  };
  res.status(400).json(body);
}

/**
 * App factory kept separate from the listener so integration tests can
 * exercise the full HTTP stack (via supertest) without binding a port.
 */
export function createApp() {
  const app = express();

  // A card number is tiny; cap the body so the endpoint can't be abused with
  // large payloads.
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post(
    "/api/validate-card",
    (req: Request<unknown, unknown, Partial<ValidateCardRequest>>, res) => {
      const { cardNumber } = req.body ?? {};

      // Contract check: a missing or non-string field is a malformed request
      // (400), distinct from a well-formed request whose value fails validation.
      if (typeof cardNumber !== "string") {
        return badRequest(
          res,
          "Request body must include a `cardNumber` string.",
        );
      }

      // Deliberately never log `cardNumber`: card data should not land in logs.
      const result: ValidateCardResponse = validateCardNumber(cardNumber);
      res.json(result);
    },
  );

  // Serve the built client (if it has been built) from the same origin, so the
  // app works as a single server with no proxy. In development the client runs
  // on Vite instead and this block is simply skipped.
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  // Translate body-parser failures (malformed JSON, oversized payloads) into
  // our typed error shape instead of Express's default HTML response.
  const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return badRequest(res, "Request body must be valid JSON.");
    }
    if ((err as { type?: string }).type === "entity.too.large") {
      return badRequest(res, "Request body is too large.");
    }
    next(err);
  };
  app.use(jsonErrorHandler);

  return app;
}
