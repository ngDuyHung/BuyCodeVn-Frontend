import { describe, expect, it } from "vitest";
import { getDownloadFilename } from "./download";

describe("getDownloadFilename", () => {
  it("decodes RFC 5987 filenames", () => {
    expect(
      getDownloadFilename(
        "attachment; filename*=UTF-8''ma-nguon%20pro.zip",
      ),
    ).toBe("ma-nguon pro.zip");
  });

  it("uses and sanitizes a fallback filename", () => {
    expect(getDownloadFilename(null, "source/code:1.zip")).toBe(
      "source_code_1.zip",
    );
  });
});
