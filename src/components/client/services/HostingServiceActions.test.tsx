import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import type { UserService } from "@/types/services";
import HostingServiceActions from "./HostingServiceActions";

vi.mock("@/services/client/orderService", () => ({ orderService: { changeHostingPassword: vi.fn(), renewHosting: vi.fn() } }));
vi.mock("@/services/client/userService", () => ({ userService: { getCredentials: vi.fn(), createHostingLoginSession: vi.fn() } }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const service: UserService = {
  id: 4, service_type: "hosting", status: "active", provisioning_mode: "automatic", domain_name: "demo.vn", starts_at: "2026-01-01", expires_at: "2027-01-01", created_at: "2026-01-01",
  actions: { can_renew: true, can_change_password: true, can_view_credentials: true },
  hosting_plan: { id: 1, name: "Starter", price_per_month: "100000.00" },
};

describe("HostingServiceActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("loads credentials only after the explicit user action", async () => {
    vi.mocked(userService.getCredentials).mockResolvedValue({ service_id: 4, domain: "demo.vn", login_url: "https://panel.test", username: "owner", password: "secret" });
    render(<HostingServiceActions service={service} onUpdated={vi.fn()} />);

    expect(userService.getCredentials).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /thông tin đăng nhập/i }));

    expect(await screen.findByText("https://panel.test")).toBeInTheDocument();
    expect(userService.getCredentials).toHaveBeenCalledWith(4);
  });

  it("opens a short-lived cPanel session in a new window", async () => {
    const replace = vi.fn();
    const popup = { opener: window, location: { replace }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
    vi.mocked(userService.createHostingLoginSession).mockResolvedValue({ url: "https://panel.test/sso", expires_in: 60 });
    render(<HostingServiceActions service={service} onUpdated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập cpanel/i }));

    await waitFor(() => expect(userService.createHostingLoginSession).toHaveBeenCalledWith(4));
    expect(replace).toHaveBeenCalledWith("https://panel.test/sso");
    expect(popup.opener).toBeNull();
  });

  it("shows a changed password once in the active panel", async () => {
    vi.mocked(orderService.changeHostingPassword).mockResolvedValue({ success: true, message: "Changed", data: { new_password: "one-time-secret" } });
    render(<HostingServiceActions service={service} onUpdated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đổi mật khẩu/i }));

    expect(await screen.findByText("one-time-secret")).toBeInTheDocument();
    expect(screen.getByText(/chỉ được hiển thị một lần/i)).toBeInTheDocument();
    expect(orderService.changeHostingPassword).toHaveBeenCalledWith(4, {});
  });

  it("keeps the same idempotency key when a hosting renewal is retried", async () => {
    vi.mocked(orderService.renewHosting)
      .mockRejectedValueOnce(new Error("Tạm thời không thể gia hạn"))
      .mockResolvedValueOnce({ success: true, message: "Renewed", data: { order_id: 8, expires_at: "2028-01-01", idempotent: true } });
    render(<HostingServiceActions service={service} onUpdated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^gia hạn$/i }));
    fireEvent.click(screen.getByRole("button", { name: /xác nhận gia hạn/i }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: /xác nhận gia hạn/i }));

    await screen.findByText(/không phát sinh giao dịch mới/i);
    await waitFor(() => expect(orderService.renewHosting).toHaveBeenCalledTimes(2));
    const firstKey = vi.mocked(orderService.renewHosting).mock.calls[0][1].idempotency_key;
    const retryKey = vi.mocked(orderService.renewHosting).mock.calls[1][1].idempotency_key;
    expect(retryKey).toBe(firstKey);
  });
});
