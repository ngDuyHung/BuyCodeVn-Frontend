import Decimal from "decimal.js";
import type { MoneyString } from "@/types/api";

export type MoneyValue = Decimal.Value;

export const toMoneyString = (value: MoneyValue): MoneyString =>
  new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);

export const isMoneyLessThan = (left: MoneyValue, right: MoneyValue) =>
  new Decimal(left).lessThan(new Decimal(right));

export const multiplyMoney = (
  value: MoneyValue,
  multiplier: MoneyValue,
): MoneyString => toMoneyString(new Decimal(value).times(multiplier));

export const formatMoney = (value: MoneyValue) => {
  const rounded = new Decimal(value)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toFixed(0);
  return `${rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
};
