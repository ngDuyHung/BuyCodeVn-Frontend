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

  it("maps timeout errors to an actionable message", () => {
    const error = new axios.AxiosError("timeout", "ECONNABORTED");
    expect(normalizeApiError(error)).toMatchObject({
      message: "Yêu cầu quá thời gian phản hồi. Vui lòng thử lại.",
    });
  });

  it("reads retry-after and request ID for rate limits", () => {
    const error = new axios.AxiosError(
      "Too many requests",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "retry-after": "30" },
        config: { headers: new axios.AxiosHeaders() },
        data: { success: false, error: { code: "RATE_LIMITED", message: "Thao tác quá nhanh." }, request_id: "rate-request" },
      },
    );

    expect(normalizeApiError(error)).toMatchObject({
      status: 429,
      code: "RATE_LIMITED",
      retryAfter: 30,
      requestId: "rate-request",
    });
  });

  it("does not expose a database exception returned by a 500 response", () => {
    const error = new axios.AxiosError(
      "Request failed",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        headers: { "x-request-id": "vps-failed-request" },
        config: { headers: new axios.AxiosHeaders() },
        data: { message: "SQLSTATE[23000] Duplicate entry for vps_instances", errors: { provider_instance_id: ["SQLSTATE[23000]"] } },
      },
    );

    const normalized = normalizeApiError(error);
    expect(normalized.status).toBe(500);
    expect(normalized.requestId).toBe("vps-failed-request");
    expect(normalized.message).not.toContain("SQLSTATE");
    expect(normalized.message).toBe("Lỗi máy chủ, vui lòng thử lại sau. Mã yêu cầu: vps-failed-request");
    expect(normalized.fieldErrors).toEqual({});
  });
});
