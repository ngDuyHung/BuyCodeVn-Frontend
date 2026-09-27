import type { DomainContactInfo } from "@/types/orders";

export type DomainContactErrors = Partial<Record<keyof DomainContactInfo, string>>;

export const validateDomainContact = (
  contact: DomainContactInfo,
): DomainContactErrors => {
  const errors: DomainContactErrors = {};
  const name = contact.name.trim();
  const email = contact.email.trim();
  const phone = contact.phone.trim();
  const cccd = contact.cccd?.trim() ?? "";

  if (!name) errors.name = "Vui lòng nhập họ và tên.";
  else if (name.length > 255) errors.name = "Họ và tên không quá 255 ký tự.";

  if (!email) errors.email = "Vui lòng nhập email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!phone) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (phone.length > 20) errors.phone = "Số điện thoại không quá 20 ký tự.";

  if (cccd.length > 20) errors.cccd = "CCCD không quá 20 ký tự.";

  return errors;
};
