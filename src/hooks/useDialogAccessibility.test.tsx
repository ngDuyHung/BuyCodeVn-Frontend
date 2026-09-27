import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDialogAccessibility } from "./useDialogAccessibility";

function DialogFixture({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => { setIsOpen(false); onClose(); };
  const dialogRef = useDialogAccessibility(isOpen, close);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Mở hộp thoại</button>
      {isOpen && <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true"><button type="button" onClick={close}>Đóng</button></div>}
    </>
  );
}

describe("useDialogAccessibility", () => {
  it("focuses the dialog, closes on Escape and restores trigger focus", () => {
    const onClose = vi.fn();
    render(<DialogFixture onClose={onClose} />);
    const trigger = screen.getByRole("button", { name: "Mở hộp thoại" });
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole("button", { name: "Đóng" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
});
