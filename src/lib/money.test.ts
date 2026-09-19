import { describe, expect, it } from "vitest";
import {
  formatMoney,
  isMoneyLessThan,
  multiplyMoney,
  toMoneyString,
} from "./money";

describe("money helpers", () => {
  it("normalizes backend numbers into decimal strings", () => {
    expect(toMoneyString(50000)).toBe("50000.00");
    expect(toMoneyString("100000.125")).toBe("100000.13");
  });

  it("multiplies monthly prices without converting through number", () => {
    expect(multiplyMoney("50000.10", 36)).toBe("1800003.60");
  });

  it("compares and formats decimal strings without binary float arithmetic", () => {
    expect(isMoneyLessThan("99999.99", "100000.00")).toBe(true);
    expect(formatMoney("150000.00")).toBe("150.000đ");
  });
});
