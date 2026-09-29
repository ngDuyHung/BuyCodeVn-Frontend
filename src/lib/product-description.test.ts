import { describe, expect, it } from "vitest";
import { productDescriptionToText, sanitizeProductDescription } from "./product-description";

describe("product description HTML", () => {
  it("keeps supported rich content and removes executable markup", () => {
    const clean = sanitizeProductDescription('<h2>Tính năng</h2><p onclick="alert(1)">An toàn</p><img src="https://cdn.example.com/a.jpg" onerror="alert(1)"><script>alert(1)</script>');
    expect(clean).toContain("<h2>Tính năng</h2>");
    expect(clean).toContain("https://cdn.example.com/a.jpg");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("script");
  });

  it("converts legacy plain text to paragraphs and creates plain metadata text", () => {
    expect(sanitizeProductDescription("Dòng một\nDòng hai")).toBe("<p>Dòng một<br>Dòng hai</p>");
    expect(productDescriptionToText("<h2>Tiêu đề</h2><p>Nội dung</p>")).toBe("Tiêu đề Nội dung");
  });
});
