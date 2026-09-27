import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import AdminPermissionGate from "./AdminPermissionGate";

describe("AdminPermissionGate", () => {
  it("blocks a direct page visit without the required permission", () => {
    useAuthStore.setState({ user: { id: 4, name: "Operator", email: "o@example.com", is_active: true, roles: ["cskh"], permissions: ["orders.view"] } });
    render(<AdminPermissionGate permission="users.view">Private users</AdminPermissionGate>);
    expect(screen.getByText(/403 · Không có quyền truy cập/)).toBeInTheDocument();
    expect(screen.queryByText("Private users")).not.toBeInTheDocument();
  });
});
