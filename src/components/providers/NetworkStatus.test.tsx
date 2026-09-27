import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NetworkStatus from "./NetworkStatus";

const setOnline = (value: boolean) => {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
  window.dispatchEvent(new Event(value ? "online" : "offline"));
};

describe("NetworkStatus", () => {
  it("announces an offline state and clears it when connectivity returns", () => {
    setOnline(true);
    render(<NetworkStatus />);
    expect(screen.queryByText(/đang ngoại tuyến/i)).not.toBeInTheDocument();

    act(() => setOnline(false));
    expect(screen.getByRole("status")).toHaveTextContent(/đang ngoại tuyến/i);

    act(() => setOnline(true));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
