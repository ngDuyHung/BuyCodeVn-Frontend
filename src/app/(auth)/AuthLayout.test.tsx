import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthLayout from "./layout";

vi.mock("@/components/client/layout/TopBar", () => ({
  default: () => <div data-testid="top-bar" />,
}));
vi.mock("@/components/client/layout/Header", () => ({
  default: () => <header data-testid="header" />,
}));
vi.mock("@/components/client/layout/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));

describe("AuthLayout", () => {
  it("keeps the public site chrome around auth pages", () => {
    render(
      <AuthLayout>
        <div>Login form</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Login form")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
