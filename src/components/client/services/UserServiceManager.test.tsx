import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUserServices } from "@/hooks/client/useUserServices";
import UserServiceManager from "./UserServiceManager";

vi.mock("@/hooks/client/useUserServices", () => ({ useUserServices: vi.fn() }));

describe("UserServiceManager", () => {
  it("renders backend statuses and pending renewal without inferring actions", () => {
    vi.mocked(useUserServices).mockReturnValue({
      response: {
        success: true,
        message: null,
        data: [
          { id: 1, service_type: "domain", status: "suspended", domain_name: "paused.vn", expires_at: "2027-01-01", created_at: "2026-01-01", actions: { can_renew: false, can_change_password: false, can_view_credentials: false }, pending_renewal: null },
          { id: 2, service_type: "domain", status: "expired", domain_name: "waiting.vn", expires_at: "2025-01-01", created_at: "2024-01-01", actions: { can_renew: false, can_change_password: false, can_view_credentials: false }, pending_renewal: { id: 12, status: "pending", years: 2 } },
        ],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: 1, from: 1, last_page: 1, path: "/api", per_page: 10, to: 2, total: 2 },
      },
      query: { service_type: "domain", page: 1, per_page: 10 },
      isLoading: false,
      error: null,
      setStatus: vi.fn(),
      setPage: vi.fn(),
      retry: vi.fn(),
    });

    render(<UserServiceManager serviceType="domain" />);

    expect(screen.getAllByText("Tạm ngưng")).toHaveLength(2);
    expect(screen.getAllByText("Hết hạn")).toHaveLength(2);
    expect(screen.getByText(/đang chờ gia hạn thủ công/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /gia hạn tên miền/i })).not.toBeInTheDocument();
  });
});
