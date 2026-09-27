import { addMoney, isMoneyLessThan, toMoneyString } from "./money";
import type { VpsBillingCycle, VpsPlan } from "@/types/services";

export const createVpsRequestId = () => globalThis.crypto.randomUUID();

export const formatBillingCycle = (cycle: VpsBillingCycle) => {
  const labels: Record<string, string> = {
    monthly: "1 tháng",
    quarterly: "3 tháng",
    annually: "12 tháng",
  };
  if (labels[cycle]) return labels[cycle];
  const match = cycle.match(/^(\d+)_months?$/);
  return match ? `${match[1]} tháng` : cycle.replaceAll("_", " ");
};

export const isValidVpsHostname = (hostname: string) =>
  hostname.length >= 3 && hostname.length <= 63 && /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/.test(hostname);

export const getVpsPrice = (
  plan: VpsPlan,
  billingCycle: VpsBillingCycle,
  locationId: number,
) => {
  const amount = plan.pricing[billingCycle]?.amount;
  const surcharge = plan.locations.find((location) => location.id === locationId)?.surcharge;
  if (amount === undefined || surcharge === undefined) return null;
  return addMoney(amount, surcharge);
};

export const getLowestVpsLocationId = (plan: VpsPlan) =>
  plan.locations.reduce((lowest, location) =>
    !lowest || isMoneyLessThan(location.surcharge, lowest.surcharge) ? location : lowest,
  null as VpsPlan["locations"][number] | null)?.id ?? 0;

export const normalizeVpsPlan = (plan: VpsPlan): VpsPlan => ({
  ...plan,
  pricing: Object.fromEntries(
    Object.entries(plan.pricing).map(([cycle, price]) => [cycle, { amount: toMoneyString(price.amount) }]),
  ),
  locations: plan.locations.map((location) => ({
    ...location,
    surcharge: toMoneyString(location.surcharge),
  })),
});
