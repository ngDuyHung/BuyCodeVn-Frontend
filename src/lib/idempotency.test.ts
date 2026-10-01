import { afterEach, describe, expect, it, vi } from "vitest";
import { createIdempotencyKey } from "./idempotency";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("createIdempotencyKey", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a plain UUID accepted by backend UUID validation", () => {
    expect(createIdempotencyKey("hosting-buy", 12)).toMatch(UUID_V4_PATTERN);
  });

  it("keeps a valid UUID format when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (buffer: Uint8Array) => {
        buffer[0] = 42;
        return buffer;
      },
    });

    expect(createIdempotencyKey("hosting-buy", 12)).toMatch(UUID_V4_PATTERN);
  });
});
