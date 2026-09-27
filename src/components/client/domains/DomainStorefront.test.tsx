import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderService } from "@/services/client/orderService";
import DomainStorefront from "./DomainStorefront";

const navigation = vi.hoisted(() => ({ query: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

vi.mock("@/services/client/orderService", () => ({
  orderService: { checkDomain: vi.fn() },
}));

vi.mock("./DomainCheckout", () => ({
  default: ({ domainResult }: { domainResult: { domain: string } }) => (
    <div>Checkout {domainResult.domain}</div>
  ),
}));

describe("DomainStorefront", () => {
  beforeEach(() => {
    navigation.query = "";
    navigation.replace.mockReset();
    vi.mocked(orderService.checkDomain).mockReset();
  });

  it("normalizes and renders an available multi-level TLD", async () => {
    vi.mocked(orderService.checkDomain).mockResolvedValue({
      domain: "school.edu.vn",
      is_available: true,
      register_price: "300000.00",
      renew_price: "320000.00",
      message: "Tên miền còn trống.",
    });
    render(<DomainStorefront />);

    fireEvent.change(screen.getByLabelText("Tên miền cần kiểm tra"), {
      target: { value: "HTTPS://School.EDU.VN/" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra tên miền" }));

    expect(await screen.findByText("school.edu.vn")).toBeInTheDocument();
    expect(orderService.checkDomain).toHaveBeenCalledWith("school.edu.vn");
    expect(navigation.replace).toHaveBeenCalledWith(
      "/domains?domain=school.edu.vn",
      { scroll: false },
    );
    expect(screen.getByText(/300\.000đ\/năm/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Đăng ký ngay" }));
    expect(screen.getByText("Checkout school.edu.vn")).toBeInTheDocument();
  });

  it("shows backend errors such as an unsupported TLD", async () => {
    vi.mocked(orderService.checkDomain).mockRejectedValue(
      new Error("TLD chưa được hỗ trợ."),
    );
    render(<DomainStorefront />);

    fireEvent.change(screen.getByLabelText("Tên miền cần kiểm tra"), {
      target: { value: "example.unsupported" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra tên miền" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("TLD chưa được hỗ trợ");
    });
  });

  it("does not offer checkout when the domain is already registered", async () => {
    vi.mocked(orderService.checkDomain).mockResolvedValue({
      domain: "taken.com",
      is_available: false,
      register_price: "250000.00",
      renew_price: "280000.00",
      message: "Tên miền đã được đăng ký.",
    });
    render(<DomainStorefront />);

    fireEvent.change(screen.getByLabelText("Tên miền cần kiểm tra"), {
      target: { value: "taken.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra tên miền" }));

    expect(await screen.findByText(/đã được đăng ký/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Đăng ký ngay" })).not.toBeInTheDocument();
  });
});
