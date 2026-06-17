# Credit Card Validator

A small full-stack app that validates a credit card number using the
**Luhn checksum algorithm**. The validation runs entirely on the back-end; the
React front-end only collects input and displays the verdict.

## Tech stack

| Layer  | Choice |
| ------ | ------ |
| Front-end | React + TypeScript, built with Vite |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) components |
| Back-end | Node.js + Express + TypeScript |
| Contract | API request/response types defined on the server, shared with the client via a `@shared` path alias |
| Tests | Vitest (unit) + Supertest (HTTP integration) |

The repo is an npm-workspaces monorepo:

```
credit-card-validator/
├── server/   # Express API — the only place validation happens
│   └── src/
│       ├── luhn.ts                # pure Luhn checksum
│       ├── validateCardNumber.ts  # validation policy (sanitize + rules)
│       ├── types.ts               # API contract types (source of truth)
│       ├── app.ts                 # Express app + routes
│       └── *.test.ts              # unit + integration tests
└── client/   # React UI
    └── src/
        ├── lib/api.ts             # typed fetch client
        ├── hooks/useCardValidation.ts
        └── components/
```

## Getting started

Requirements: Node.js 20+ and npm 10+.

```bash
npm install          # installs all workspaces
npm run dev          # starts API (:3001) and client (:5173) together
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the
Express server on port 3001, so there is nothing else to configure.

### Other scripts

```bash
npm test             # run the server test suite
npm run typecheck    # type-check every workspace
npm run lint         # lint the repo
npm run build        # production build of the client
```

## API

### `POST /api/validate-card`

**Request**

```json
{ "cardNumber": "4111 1111 1111 1111" }
```

Spaces and dashes are accepted and stripped server-side.

**Response — `200 OK`** (the request was well-formed and a verdict was reached)

```json
{ "valid": true }
```

```json
{ "valid": false, "reason": "luhn_check_failed" }
```

`reason` is one of:

| reason | meaning |
| ------ | ------- |
| `invalid_characters` | contains something other than digits/spaces/dashes |
| `invalid_length` | not 13–19 digits (per ISO/IEC 7812) |
| `luhn_check_failed` | well-formed digits that fail the checksum |

**Response — `400 Bad Request`** (the request itself is malformed: `cardNumber`
missing/not a string, invalid JSON, or oversized body)

```json
{ "error": { "code": "invalid_request", "message": "Request body must include a `cardNumber` string." } }
```

## Design decisions

- **Validation lives only on the server.** The browser never runs the Luhn
  algorithm — its sole client-side check is "don't submit an empty box." This
  is the central requirement of the exercise, so the architecture makes it
  unmistakable: a separate Express service, not framework API routes.

- **"Invalid card" is a `200`, not a `400`.** A number that fails Luhn is a
  *successful* validation with the answer "no". `400` is reserved for requests
  that violate the API contract (wrong type, bad JSON). This keeps the two
  failure modes — "the card is invalid" vs. "the request failed" — cleanly
  separated, and the UI surfaces them differently.

- **Pure algorithm, separate from HTTP.** `luhn()` is a pure function and
  `validateCardNumber()` is the validation policy; neither knows about Express.
  That makes the core logic trivial to unit-test and easy to reuse.

- **One source of truth for the API contract.** The request/response shapes
  live in `server/src/types.ts` and the client imports them directly (via a
  `@shared` path alias), so the contract is defined exactly once, can't
  silently drift, and the client never re-derives validation rules.

- **No Luhn npm package.** Implementing the checksum is the point of the
  exercise, so it's written by hand and thoroughly tested.

- **Security-minded touches.** The card number is never logged, and the JSON
  body is capped at 10 kB so the endpoint can't be abused with large payloads.
  (No data is stored — there is no database.)

## Testing

29 tests across three levels:

- **Luhn unit tests** — industry-standard valid numbers (Visa, Mastercard,
  Amex, Discover, Diners, JCB), single-digit-error invalids, and the mod-10
  contract.
- **Policy tests** — formatting, characters, length bounds, and empty input.
- **HTTP integration tests** (Supertest) — status codes, the 200-invalid vs.
  400-malformed distinction, malformed JSON, and the health route.

```bash
npm test
```

## What I'd add with more time

- Live, as-you-type formatting and inline feedback in the UI.
- A component test for the form (e.g. Testing Library) and a CI workflow.
- Rate limiting and an OpenAPI document if this were a real, externally
  consumed API.
