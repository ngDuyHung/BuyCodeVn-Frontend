import { describe, expect, it } from "vitest";
import { createVpsRequestId, formatBillingCycle, getLowestVpsLocationId, getVpsPrice, isValidVpsHostname, normalizeVpsPlan } from "./vps";
import type { VpsPlan } from "@/types/services";

const plan: VpsPlan = {
  id: 1, slug: "kvm", name: "KVM 2GB", group_name: "KVM", cpu: 2,
  ram_mb: 2048, disk_gb: 40, bandwidth: "Unlimited", ip_description: "1 IPv4",
  pricing: { "1_month": { amount: "90000.10" } },
  locations: [{ id: 2, slug: "hcm", code: "HCM", name: "HCM", surcharge: "10000.20" }],
};

describe("VPS pricing and idempotency", () => {
  it("adds the cycle price and internal location surcharge without float error", () => {
    expect(getVpsPrice(plan, "1_month", 2)).toBe("100000.30");
    expect(getVpsPrice(plan, "2_months", 2)).toBeNull();
    expect(getVpsPrice(plan, "1_month", 999)).toBeNull();
  });

  it("selects the cheapest location even when the provider lists it second", () => {
    const withLocations = { ...plan, locations: [
      { ...plan.locations[0], id: 3, surcharge: "20000.00" },
      { ...plan.locations[0], id: 2, surcharge: "0.00" },
    ] };
    expect(getLowestVpsLocationId(withLocations)).toBe(2);
    expect(getVpsPrice(withLocations, "1_month", getLowestVpsLocationId(withLocations))).toBe("90000.10");
  });

  it("normalizes public money fields and creates a plain UUID", () => {
    const normalized = normalizeVpsPlan({
      ...plan,
      pricing: { "1_month": { amount: 90000 as unknown as string } },
    });
    expect(normalized.pricing["1_month"].amount).toBe("90000.00");
    expect(createVpsRequestId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("labels sandbox billing cycles and matches backend hostname validation", () => {
    expect(formatBillingCycle("monthly")).toBe("1 tháng");
    expect(formatBillingCycle("quarterly")).toBe("3 tháng");
    expect(formatBillingCycle("annually")).toBe("12 tháng");
    expect(isValidVpsHostname("web-01.example")).toBe(true);
    expect(isValidVpsHostname("ab")).toBe(false);
    expect(isValidVpsHostname("web-01-")).toBe(false);
    expect(isValidVpsHostname("Web-01")).toBe(false);
  });
});
