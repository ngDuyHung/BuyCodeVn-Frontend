import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RichTextEditor from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("renders formatting tools and validates inserted image URLs", async () => {
    render(<RichTextEditor value="<p>Nội dung</p>" onChange={vi.fn()} />);
    expect(await screen.findByRole("textbox", { name: "Nội dung mô tả sản phẩm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đậm" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chèn ảnh từ URL" }));
    fireEvent.change(screen.getByLabelText("URL hình ảnh"), { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "Chèn" }));
    expect(screen.getByRole("alert")).toHaveTextContent("HTTP hoặc HTTPS");
  });
});
