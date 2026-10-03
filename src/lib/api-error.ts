import axios from "axios";
import type { ApiErrorPayload, ValidationErrors } from "@/types/api";

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly retryAfter?: number;
  readonly fieldErrors: ValidationErrors;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      requestId?: string;
      retryAfter?: number;
      fieldErrors?: ValidationErrors;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

const getValidationErrors = (details: unknown): ValidationErrors => {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(details).flatMap(([field, messages]) =>
      Array.isArray(messages) && messages.every((item) => typeof item === "string")
        ? [[field, messages as string[]]]
        : [],
    ),
  );
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    const envelopeFieldErrors = getValidationErrors(payload?.error?.details);
    const retryAfter = Number(error.response?.headers?.["retry-after"]);
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    const isOffline =
      typeof navigator !== "undefined" && navigator.onLine === false;
    const status = error.response?.status;
    const requestId =
      payload?.request_id || error.response?.headers?.["x-request-id"];
    const serverMessage = requestId
      ? `Lỗi máy chủ, vui lòng thử lại sau. Mã yêu cầu: ${requestId}`
      : "Lỗi máy chủ, vui lòng thử lại sau.";
    const networkMessage = isTimeout
      ? "Yêu cầu quá thời gian phản hồi. Vui lòng thử lại."
      : isOffline
        ? "Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng."
        : "Không thể kết nối đến máy chủ.";

    return new ApiError(
      (status && status >= 500 ? serverMessage : null) ||
      payload?.error?.message ||
        payload?.message ||
        (error.response ? "Có lỗi xảy ra, vui lòng thử lại." : networkMessage),
      {
        status,
        code: payload?.error?.code,
        requestId,
        retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
        fieldErrors:
          status && status >= 500
            ? {}
            : Object.keys(envelopeFieldErrors).length > 0
            ? envelopeFieldErrors
            : payload?.errors,
      },
    );
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("Không thể kết nối đến máy chủ.");
};
