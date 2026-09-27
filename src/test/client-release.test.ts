import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");
const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.(tsx?|jsx?)$/.test(entry)
        ? [path]
        : [];
  });

describe("client release source audit", () => {
  it("contains no placeholder href or links to deferred routes", () => {
    const source = sourceFiles(sourceRoot)
      .filter((file) => !file.endsWith("client-release.test.ts"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/href=["']#["']/);
    expect(source).not.toContain('href="/lien-he"');
    expect(source).toContain('href="/user/vps"');
  });
});
