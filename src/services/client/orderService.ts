import { ApiError } from "@/lib/api-error";
import { clearAuthTokenCookie } from "@/lib/auth-cookie";
import { getDownloadFilename } from "@/lib/download";
import { useAuthStore } from "@/stores/authStore";
import { toMoneyString } from "@/lib/money";
import type { ApiResource, BusinessResponse, PaginatedResponse } from "@/types/api";
import type {
  BuyProductPayload,
  BuyProductResult,
  BuyHostingPayload,
  BuyHostingResult,
  CouponPreview,
  DownloadedProduct,
  Order,
  OrderQuery,
  PreviewCouponPayload,
} from "@/types/orders";
import api, { AUTH_UNAUTHORIZED_EVENT } from "../api";

const readDownloadError = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: { message?: string };
    };
    return payload.error?.message ?? payload.message;
  } catch {
    return undefined;
  }
};

const hasCompletedProduct = async (
  productId: number,
  signal?: AbortSignal,
) => {
  let page = 1;
  let lastPage = 1;

  do {
    const response = await api.get<PaginatedResponse<Order>>("/v1/orders", {
      params: {
        item_type: "product",
        status: "completed",
        per_page: 100,
        page,
      },
      signal,
      suppressErrorToast: true,
    });
    if (
      response.data.data.some((order) =>
        order.items.some(
          (item) => item.item_type === "product" && item.item_id === productId,
        ),
      )
    ) {
      return true;
    }

    lastPage = response.data.meta.last_page;
    page += 1;
  } while (page <= lastPage);

  return false;
};

export const orderService = {
  previewCoupon: async (payload: PreviewCouponPayload) => {
    const response = await api.post<BusinessResponse<CouponPreview>>(
      "/v1/orders/preview-coupon",
      payload,
      { suppressErrorToast: true },
    );
    return {
      ...response.data,
      data: {
        discount_amount: toMoneyString(response.data.data.discount_amount),
        final_amount: toMoneyString(response.data.data.final_amount),
      },
    };
  },

  buyProduct: async (payload: BuyProductPayload) => {
    const response = await api.post<BusinessResponse<BuyProductResult>>(
      "/v1/orders/buy-product",
      payload,
      { suppressErrorToast: true },
    );
    return response.data;
  },

  buyHosting: async (payload: BuyHostingPayload) => {
    const response = await api.post<BusinessResponse<BuyHostingResult>>(
      "/v1/orders/buy-hosting",
      payload,
      { suppressErrorToast: true },
    );
    return response.data;
  },

  getOrders: async (params: OrderQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Order>>("/v1/orders", {
      params,
      signal,
      suppressErrorToast: true,
    });
    return response.data;
  },

  getOrder: async (orderId: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Order>>(`/v1/orders/${orderId}`, {
      signal,
      suppressErrorToast: true,
    });
    return response.data.data;
  },

  hasCompletedProduct,

  downloadProduct: async (productId: number): Promise<DownloadedProduct> => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new ApiError("Vui lòng đăng nhập để tải sản phẩm.", { status: 401 });
    }

    const response = await fetch(`/api/download/products/${productId}`, {
      headers: { Accept: "application/octet-stream, application/json" },
    });

    if (!response.ok) {
      const message = await readDownloadError(response);
      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        clearAuthTokenCookie();
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
      throw new ApiError(
        message || "Không thể tải sản phẩm. Vui lòng thử lại.",
        { status: response.status },
      );
    }

    return {
      blob: await response.blob(),
      filename: getDownloadFilename(
        response.headers.get("content-disposition"),
        `source-code-${productId}.zip`,
      ),
      contentType:
        response.headers.get("content-type") || "application/octet-stream",
    };
  },
};
