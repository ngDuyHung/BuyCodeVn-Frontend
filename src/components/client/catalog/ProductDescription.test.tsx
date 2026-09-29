import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductDescription from "./ProductDescription";

describe("ProductDescription", () => {
  it("renders sanitized rich HTML below the product summary", () => {
    const { container } = render(<ProductDescription description={'<h2>Tính năng chính</h2><p>Nội dung</p><img src="https://cdn.example.com/a.jpg" onerror="alert(1)">'} />);
    expect(screen.getByRole("heading", { name: "Thông tin chi tiết" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tính năng chính" })).toBeInTheDocument();
    expect(container.querySelector("img")).not.toHaveAttribute("onerror");
  });

  it("shows an empty state when no description exists", () => {
    render(<ProductDescription description={null} />);
    expect(screen.getByText("Sản phẩm hiện chưa có mô tả chi tiết.")).toBeInTheDocument();
  });
});
