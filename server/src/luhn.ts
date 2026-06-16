/**
 * Luhn checksum (mod-10) validation.
 *
 * Walks the digits right-to-left, doubling every second digit. When a doubled
 * value exceeds 9 we subtract 9 (equivalent to summing its two digits, e.g.
 * 16 -> 1 + 6 = 7). The number passes when the total is a multiple of 10.
 *
 * Pure and side-effect free so it can be unit-tested in isolation. The caller
 * is responsible for passing a digits-only string; see `validateCardNumber`,
 * which sanitizes and length-checks input before this runs.
 *
 * @param digits A string containing only the characters 0-9.
 * @returns true if the digits satisfy the Luhn checksum.
 */
export function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let value = digits.charCodeAt(i) - 48; // 48 is the char code for '0'.

    if (double) {
      value *= 2;
      if (value > 9) {
        value -= 9;
      }
    }

    sum += value;
    double = !double;
  }

  return sum % 10 === 0;
}
