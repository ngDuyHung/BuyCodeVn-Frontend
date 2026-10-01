import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import GuestOnlyBoundary from "./GuestOnlyBoundary";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("GuestOnlyBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/login");
    useAuthStore.setState({ isSessionReady: true, isAuthenticated: false });
  });

  it("shows auth content to a guest", () => {
    render(<GuestOnlyBoundary><div>Login form</div></GuestOnlyBoundary>);
    expect(screen.getByText("Login form")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects an authenticated user to the requested local page", async () => {
    window.history.replaceState({}, "", "/login?returnUrl=%2Fuser%2Forders");
    useAuthStore.setState({ isAuthenticated: true });
    render(<GuestOnlyBoundary><div>Login form</div></GuestOnlyBoundary>);

    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/user/orders"));
  });
});
