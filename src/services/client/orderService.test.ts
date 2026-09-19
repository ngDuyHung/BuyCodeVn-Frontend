import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import api from "../api";
import { orderService } from "./orderService";

vi.mock("../api", () => ({
  AUTH_UNAUTHORIZED_EVENT: "auth:unauthorized",
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("orderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: "token-123" });
  });

  it("previews a coupon and buys a product with contextual error handling", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: "Applied",
          data: { discount_amount: 50000, final_amount: 100000 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: "Purchased",
          data: { order_id: 10 },
        },
      });

    await orderService.previewCoupon({
      coupon_code: "SALE10",
      total_amount: "150000.00",
    });
    await orderService.buyProduct({ product_id: 1, coupon_code: "SALE10" });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/v1/orders/preview-coupon",
      { coupon_code: "SALE10", total_amount: "150000.00" },
      { suppressErrorToast: true },
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/v1/orders/buy-product",
      { product_id: 1, coupon_code: "SALE10" },
      { suppressErrorToast: true },
    );
  });

  it("normalizes coupon amounts and maps order list/detail envelopes", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        message: "Applied",
        data: { discount_amount: 50000, final_amount: 100000 },
      },
    });
    const list = {
      success: true as const,
      message: null,
      data: [],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        from: null,
        last_page: 1,
        path: "/api/v1/orders",
        per_page: 10,
        to: null,
        total: 0,
      },
    };
    const detail = { id: 10 };
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: list })
      .mockResolvedValueOnce({ data: { success: true, message: null, data: detail } });

    await expect(
      orderService.previewCoupon({
        coupon_code: "SALE10",
        total_amount: "150000.00",
      }),
    ).resolves.toMatchObject({
      data: { discount_amount: "50000.00", final_amount: "100000.00" },
    });
    await expect(orderService.getOrders({ status: "completed" })).resolves.toBe(list);
    await expect(orderService.getOrder(10)).resolves.toBe(detail);
  });

  it("checks every completed-product page when restoring ownership", async () => {
    const page = (currentPage: number, itemId?: number) => ({
      data: {
        success: true,
        message: null,
        data: itemId
          ? [{ items: [{ item_type: "product", item_id: itemId }] }]
          : [],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: currentPage, last_page: 2 },
      },
    });
    vi.mocked(api.get)
      .mockResolvedValueOnce(page(1))
      .mockResolvedValueOnce(page(2, 7));

    await expect(orderService.hasCompletedProduct(7)).resolves.toBe(true);
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenLastCalledWith(
      "/v1/orders",
      expect.objectContaining({ params: expect.objectContaining({ page: 2 }) }),
    );
  });

  it("submits the hosting checkout payload", async () => {
    const response = {
      success: true as const,
      message: "Created",
      data: {
        status: "success" as const,
        order_id: 20,
        service_id: 10,
        domain: "example.com",
      },
    };
    vi.mocked(api.post).mockResolvedValue({ data: response });

    await expect(
      orderService.buyHosting({
        hosting_plan_id: 1,
        domain: "example.com",
        months: 12,
      }),
    ).resolves.toBe(response);
    expect(api.post).toHaveBeenCalledWith(
      "/v1/orders/buy-hosting",
      { hosting_plan_id: 1, domain: "example.com", months: 12 },
      { suppressErrorToast: true },
    );
  });

  it("downloads a successful response as a blob and reads its filename", async () => {
    const blob = new Blob(["zip-content"], { type: "application/zip" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(blob),
        headers: new Headers({
          "content-type": "application/zip",
          "content-disposition": "attachment; filename=product.zip",
        }),
      }),
    );

    await expect(orderService.downloadProduct(1)).resolves.toEqual({
      blob,
      filename: "product.zip",
      contentType: "application/zip",
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/download/products/1",
      { headers: { Accept: "application/octet-stream, application/json" } },
    );
  });

  it("parses a JSON download error without treating success as JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({ message: "Not purchased" }),
      }),
    );

    await expect(orderService.downloadProduct(1)).rejects.toEqual(
      expect.objectContaining({
        message: "Not purchased",
        status: 403,
      }),
    );
  });

  it("reads the unified error envelope from a failed download", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: { code: "NOT_FOUND", message: "File not found" },
        }),
      }),
    );

    await expect(orderService.downloadProduct(1)).rejects.toEqual(
      expect.objectContaining({ message: "File not found", status: 404 }),
    );
  });

  it("clears the local session when a binary download returns 401", async () => {
    const unauthorized = vi.fn();
    window.addEventListener("auth:unauthorized", unauthorized);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: "Unauthenticated." }),
      }),
    );

    await expect(orderService.downloadProduct(1)).rejects.toEqual(
      expect.objectContaining({ status: 401 }),
    );
    expect(useAuthStore.getState().token).toBeNull();
    expect(unauthorized).toHaveBeenCalledOnce();
    window.removeEventListener("auth:unauthorized", unauthorized);
  });
});
