import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

const app = createApp();

describe("POST /api/validate-card", () => {
  it("returns 200 valid:true for a valid number", async () => {
    const res = await request(app)
      .post("/api/validate-card")
      .send({ cardNumber: "4111111111111111" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true });
  });

  it("returns 200 valid:false with a reason for an invalid number", async () => {
    const res = await request(app)
      .post("/api/validate-card")
      .send({ cardNumber: "4111111111111112" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: false, reason: "luhn_check_failed" });
  });

  it("accepts a number with spaces", async () => {
    const res = await request(app)
      .post("/api/validate-card")
      .send({ cardNumber: "4111 1111 1111 1111" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true });
  });

  it("returns 400 when cardNumber is missing", async () => {
    const res = await request(app).post("/api/validate-card").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_request");
  });

  it("returns 400 when cardNumber is not a string", async () => {
    const res = await request(app)
      .post("/api/validate-card")
      .send({ cardNumber: 4111111111111111 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_request");
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/validate-card")
      .set("Content-Type", "application/json")
      .send('{ "cardNumber": ');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_request");
  });
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
