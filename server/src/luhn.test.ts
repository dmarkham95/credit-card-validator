import { describe, it, expect } from "vitest";
import { luhn } from "./luhn.js";

describe("luhn", () => {
  // Industry-standard test numbers that satisfy the checksum.
  it.each([
    ["Visa", "4111111111111111"],
    ["Visa", "4012888888881881"],
    ["Mastercard", "5555555555554444"],
    ["Mastercard", "5105105105105100"],
    ["Amex (15 digits)", "378282246310005"],
    ["Discover", "6011111111111117"],
    ["Diners (14 digits)", "30569309025904"],
    ["JCB", "3530111333300000"],
  ])("returns true for a valid %s number", (_brand, number) => {
    expect(luhn(number)).toBe(true);
  });

  // Same numbers with the final digit nudged: a single-digit error must fail.
  it.each([
    ["4111111111111112"],
    ["5555555555554443"],
    ["378282246310004"],
    ["1234567890123456"],
  ])("returns false for invalid number %s", (number) => {
    expect(luhn(number)).toBe(false);
  });

  it("treats the checksum as mod-10 (a single 0 is technically valid)", () => {
    // Documents the contract: luhn() only checks the checksum. Length/format
    // rules live in validateCardNumber, not here.
    expect(luhn("0")).toBe(true);
  });
});
