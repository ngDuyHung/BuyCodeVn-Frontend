import type { FormEventHandler, ReactNode } from "react";

export default function AdminFilterBar({ children, onSubmit }: { children: ReactNode; onSubmit: FormEventHandler<HTMLFormElement> }) {
  return <form onSubmit={onSubmit} className="mb-4 flex flex-wrap items-end gap-3 border-y border-[#e0e6e7] bg-white px-4 py-3">{children}</form>;
}
