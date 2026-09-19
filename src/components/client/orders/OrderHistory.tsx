"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { normalizeApiError } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/format";
import { orderService } from "@/services/client/orderService";
import type { PaginatedResponse } from "@/types/api";
import type {
  Order,
  OrderItem,
  OrderItemType,
  OrderQuery,
  OrderStatus,
  ProductOrderSnapshot,
} from "@/types/orders";

const isProductSnapshot = (
  item: OrderItem["item"],
): item is ProductOrderSnapshot =>
  Boolean(item && "title" in item && "slug" in item);

const getItemLabel = (item: OrderItem) => {
  if (isProductSnapshot(item.item)) return item.item.title;
  if (item.item && "name" in item.item && typeof item.item.name === "string") {
    return item.item.name;
  }
  if (item.item && "tld" in item.item && typeof item.item.tld === "string") {
    return `Tên miền ${item.item.tld}`;
  }
  return `Sản phẩm #${item.item_id}`;
};

const initialQuery: OrderQuery = { page: 1, per_page: 10 };

export default function OrderHistory() {
  const [query, setQuery] = useState<OrderQuery>(initialQuery);
  const [orders, setOrders] = useState<PaginatedResponse<Order> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [downloadingItemId, setDownloadingItemId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null;
        setIsLoading(true);
        setError(null);
        return orderService.getOrders(query, controller.signal);
      })
      .then(setOrders)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(normalizeApiError(requestError).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [query, reloadKey]);

  const updateFilter = useCallback(
    (key: keyof OrderQuery, value: string) => {
      setSelectedOrder(null);
      setQuery((current) => ({ ...current, [key]: value, page: 1 }));
    },
    [],
  );

  const toggleDetail = async (order: Order) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      return;
    }

    setDetailId(order.id);
    try {
      setSelectedOrder(await orderService.getOrder(order.id));
    } catch (detailError) {
      toast.error(normalizeApiError(detailError).message);
    } finally {
      setDetailId(null);
    }
  };

  const downloadProduct = async (item: OrderItem) => {
    setDownloadingItemId(item.id);
    try {
      const file = await orderService.downloadProduct(item.item_id);
      saveBlob(file.blob, file.filename);
      toast.success("Đã bắt đầu tải sản phẩm.");
    } catch (downloadError) {
      toast.error(normalizeApiError(downloadError).message);
    } finally {
      setDownloadingItemId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-gray-border bg-white shadow-[0_2px_12px_rgba(0,0,0,.04)]">
      <header className="border-b border-gray-border p-5 md:p-6">
        <h1 className="text-xl font-extrabold text-blue-nav">Lịch sử đơn hàng</h1>
        <p className="mt-1 text-sm text-text-muted">
          Theo dõi giao dịch và tải lại sản phẩm đã mua.
        </p>
      </header>

      <div className="grid gap-3 border-b border-gray-border bg-gray-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-[#475569]">
          Trạng thái
          <select
            value={query.status ?? ""}
            onChange={(event) =>
              updateFilter("status", event.target.value as OrderStatus | "")
            }
            className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 text-sm font-normal outline-none focus:border-blue-primary"
          >
            <option value="">Tất cả</option>
            <option value="completed">Hoàn thành</option>
            <option value="processing">Đang xử lý</option>
            <option value="failed">Thất bại</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[#475569]">
          Loại đơn
          <select
            value={query.item_type ?? ""}
            onChange={(event) =>
              updateFilter("item_type", event.target.value as OrderItemType | "")
            }
            className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 text-sm font-normal outline-none focus:border-blue-primary"
          >
            <option value="">Tất cả</option>
            <option value="product">Mã nguồn</option>
            <option value="hosting">Hosting</option>
            <option value="domain">Tên miền</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[#475569]">
          Từ ngày
          <input
            type="date"
            value={query.date_from ?? ""}
            onChange={(event) => updateFilter("date_from", event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 text-sm font-normal outline-none focus:border-blue-primary"
          />
        </label>
        <label className="text-xs font-semibold text-[#475569]">
          Đến ngày
          <input
            type="date"
            min={query.date_from || undefined}
            value={query.date_to ?? ""}
            onChange={(event) => updateFilter("date_to", event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 text-sm font-normal outline-none focus:border-blue-primary"
          />
        </label>
      </div>

      {isLoading ? (
        <LoadingState label="Đang tải đơn hàng..." />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : !orders?.data.length ? (
        <EmptyState
          title="Chưa có đơn hàng phù hợp"
          description="Thử thay đổi bộ lọc hoặc khám phá kho mã nguồn."
          action={
            <Link href="/source-code" className="font-semibold text-blue-primary">
              Xem kho mã nguồn
            </Link>
          }
        />
      ) : (
        <>
          <div className="divide-y divide-gray-border">
            {orders.data.map((order) => {
              const detail = selectedOrder?.id === order.id ? selectedOrder : null;
              return (
                <article key={order.id} className="p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-extrabold text-blue-nav">Đơn #{order.id}</h2>
                        <span className="rounded bg-[#e0f2fe] px-2 py-1 text-xs font-semibold text-[#0369a1]">
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDateTime(order.created_at)} · {order.item_count} sản phẩm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Thanh toán</p>
                      <strong className="text-lg text-orange-main">
                        {formatCurrency(order.final_amount)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items.map((item) =>
                      isProductSnapshot(item.item) ? (
                        <Link
                          key={item.id}
                          href={`/source-code/${item.item.slug}`}
                          className="text-sm font-semibold text-blue-primary hover:text-[#154ea0]"
                        >
                          {item.item.title}
                        </Link>
                      ) : (
                        <span key={item.id} className="text-sm text-[#475569]">
                          {getItemLabel(item)}
                        </span>
                      ),
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDetail(order)}
                      disabled={detailId === order.id}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-border px-3 text-sm font-semibold text-[#475569] hover:bg-gray-50 disabled:opacity-50"
                    >
                      <i
                        className={`fas ${detailId === order.id ? "fa-spinner fa-spin" : "fa-receipt"}`}
                        aria-hidden="true"
                      />
                      {detail ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </button>
                    {order.status === "completed" &&
                      order.items
                        .filter((item) => item.item_type === "product")
                        .map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => downloadProduct(item)}
                            disabled={downloadingItemId === item.id}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#15803d] px-3 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-50"
                          >
                            <i
                              className={`fas ${downloadingItemId === item.id ? "fa-spinner fa-spin" : "fa-download"}`}
                              aria-hidden="true"
                            />
                            Tải mã nguồn
                          </button>
                        ))}
                  </div>

                  {detail && (
                    <div className="mt-4 grid gap-2 border-t border-dashed border-gray-border pt-4 text-sm sm:grid-cols-2">
                      <p className="text-[#475569]">
                        Tạm tính: <strong>{formatCurrency(detail.total_amount)}</strong>
                      </p>
                      <p className="text-[#475569]">
                        Giảm giá: <strong>{formatCurrency(detail.discount_amount)}</strong>
                      </p>
                      <p className="text-[#475569]">
                        Mã giảm giá: <strong>{detail.coupon?.code ?? "Không có"}</strong>
                      </p>
                      <p className="text-[#475569]">
                        Cập nhật: <strong>{formatDateTime(detail.updated_at)}</strong>
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <div className="border-t border-gray-border p-4">
            <Pagination
              currentPage={orders.meta.current_page}
              lastPage={orders.meta.last_page}
              onPageChange={(page) =>
                setQuery((current) => ({ ...current, page }))
              }
            />
          </div>
        </>
      )}
    </section>
  );
}
