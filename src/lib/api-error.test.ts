import axios from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "./api-error";

describe("normalizeApiError", () => {
  it("maps the unified backend error envelope", () => {
    const error = new axios.AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 422,
        statusText: "Unprocessable Entity",
        headers: { "x-request-id": "header-request-id" },
        config: { headers: new axios.AxiosHeaders() },
        data: {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Du lieu khong hop le.",
            details: { email: ["Email khong hop le."] },
          },
          request_id: "body-request-id",
        },
      },
    );

    expect(normalizeApiError(error)).toMatchObject({
      message: "Du lieu khong hop le.",
      status: 422,
      code: "VALIDATION_ERROR",
      requestId: "body-request-id",
      fieldErrors: { email: ["Email khong hop le."] },
    });
  });
});
