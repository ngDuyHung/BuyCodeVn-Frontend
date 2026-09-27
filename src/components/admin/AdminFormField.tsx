import type { InputHTMLAttributes } from "react";

export default function AdminFormField({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return <label htmlFor={id} className="block text-xs font-semibold text-[#52636c]">{label}<input id={id} {...props} className={`mt-1 h-9 w-full min-w-44 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal text-[#172b35] ${props.className ?? ""}`} /></label>;
}
