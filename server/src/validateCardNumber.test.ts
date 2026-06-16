import { describe, it, expect } from "vitest";
import { validateCardNumber } from "./validateCardNumber.js";

describe("validateCardNumber", () => {
  it("accepts a valid number", () => {
    expect(validateCardNumber("4111111111111111")).toEqual({ valid: true });
  });

  it("accepts a valid number formatted with spaces", () => {
    expect(validateCardNumber("4111 1111 1111 1111")).toEqual({ valid: true });
  });

  it("accepts a valid number formatted with dashes", () => {
    expect(validateCardNumber("4111-1111-1111-1111")).toEqual({ valid: true });
  });

  it("reports luhn_check_failed for a well-formed but invalid number", () => {
    expect(validateCardNumber("4111111111111112")).toEqual({
      valid: false,
      reason: "luhn_check_failed",
    });
  });

  it("reports invalid_characters when letters are present", () => {
    expect(validateCardNumber("4111 abcd 1111 1111")).toEqual({
      valid: false,
      reason: "invalid_characters",
    });
  });

  it("reports invalid_length for an empty string", () => {
    expect(validateCardNumber("")).toEqual({
      valid: false,
      reason: "invalid_length",
    });
  });

  it("reports invalid_length for a string of only separators", () => {
    expect(validateCardNumber("  -- ")).toEqual({
      valid: false,
      reason: "invalid_length",
    });
  });

  it("reports invalid_length for a too-short number", () => {
    expect(validateCardNumber("411111")).toEqual({
      valid: false,
      reason: "invalid_length",
    });
  });

  it("reports invalid_length for a too-long number", () => {
    expect(validateCardNumber("4".repeat(20))).toEqual({
      valid: false,
      reason: "invalid_length",
    });
  });
});
