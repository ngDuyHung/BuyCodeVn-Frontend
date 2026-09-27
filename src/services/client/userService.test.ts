import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import { userService } from "./userService";

vi.mock("../api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("userService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps the owner-scoped service list and detail envelopes", async () => {
    const list = { data: [], meta: { total: 0 } };
    const detail = { id: 9, service_type: "hosting" };
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: list })
      .mockResolvedValueOnce({ data: { success: true, message: null, data: detail } });

    await expect(userService.getServices({ service_type: "hosting", status: "active" })).resolves.toBe(list);
    await expect(userService.getService(9)).resolves.toBe(detail);
    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/services/my-services", {
      params: { service_type: "hosting", status: "active" },
      signal: undefined,
      suppressErrorToast: true,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/services/my-services/9", {
      signal: undefined,
      suppressErrorToast: true,
    });
  });

  it("only requests credentials from the dedicated owner-scoped endpoint", async () => {
    const credentials = { service_id: 9, domain: "demo.vn", login_url: "https://panel.test", username: "owner", password: "secret" };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, message: null, data: credentials } });

    await expect(userService.getCredentials(9)).resolves.toBe(credentials);
    expect(api.get).toHaveBeenCalledWith("/v1/services/my-services/9/credentials", {
      signal: undefined,
      suppressErrorToast: true,
    });
  });

  it("propagates ownership errors without replacing backend status", async () => {
    const ownerError = Object.assign(new Error("Không tìm thấy dịch vụ"), { response: { status: 404 } });
    vi.mocked(api.get).mockRejectedValue(ownerError);
    await expect(userService.getService(999)).rejects.toBe(ownerError);
  });

  it("creates a short-lived owner-scoped cPanel login session", async () => {
    const session = { url: "https://panel.test/login/session", expires_in: 60 };
    vi.mocked(api.post).mockResolvedValue({ data: { data: session } });
    await expect(userService.createHostingLoginSession(9)).resolves.toBe(session);
    expect(api.post).toHaveBeenCalledWith(
      "/v1/services/my-services/9/login-session",
      undefined,
      { suppressErrorToast: true },
    );
  });

  it("maps VPS owner-scoped lifecycle endpoints", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, message: "OK", data: {} } });
    await userService.vpsAction(55, "restart");
    await userService.rebuildVps(55, { os_image_id: 3 });
    await userService.changeVpsPassword(55, "StrongPassword123");
    await userService.changeVpsHostname(55, "web-02");
    await userService.syncVps(55);
    expect(api.post).toHaveBeenNthCalledWith(1, "/v1/services/my-services/55/vps-actions", { action: "restart" }, { suppressErrorToast: true });
    expect(api.post).toHaveBeenNthCalledWith(2, "/v1/services/my-services/55/rebuild", { os_image_id: 3 }, { suppressErrorToast: true });
    expect(api.post).toHaveBeenNthCalledWith(3, "/v1/services/my-services/55/vps-password", { new_password: "StrongPassword123" }, { suppressErrorToast: true });
    expect(api.post).toHaveBeenNthCalledWith(4, "/v1/services/my-services/55/vps-hostname", { hostname: "web-02" }, { suppressErrorToast: true });
    expect(api.post).toHaveBeenNthCalledWith(5, "/v1/services/my-services/55/vps-sync", undefined, { suppressErrorToast: true });
  });
});
