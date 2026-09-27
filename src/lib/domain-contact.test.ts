import { describe, expect, it } from "vitest";
import { validateDomainContact } from "./domain-contact";

describe("domain contact validation", () => {
  it("accepts valid required contact fields without CCCD", () => {
    expect(
      validateDomainContact({
        name: "Nguyen Van A",
        email: "owner@example.com",
        phone: "0900000000",
      }),
    ).toEqual({});
  });

  it("matches backend required, email and max length rules", () => {
    expect(
      validateDomainContact({
        name: "",
        email: "invalid",
        phone: "1".repeat(21),
        cccd: "2".repeat(21),
      }),
    ).toEqual({
      name: "Vui lòng nhập họ và tên.",
      email: "Email không hợp lệ.",
      phone: "Số điện thoại không quá 20 ký tự.",
      cccd: "CCCD không quá 20 ký tự.",
    });
  });
});
