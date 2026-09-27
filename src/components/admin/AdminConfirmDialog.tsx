"use client";

import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";

export default function AdminConfirmDialog({ title, message, confirmLabel = "Xác nhận", busy = false, destructive = false, onConfirm, onClose }: { title: string; message: string; confirmLabel?: string; busy?: boolean; destructive?: boolean; onConfirm: () => void; onClose: () => void }) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><div className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"><h2 id="admin-confirm-title" className="text-lg font-bold text-[#172b35]">{title}</h2><p className="mt-2 text-sm text-[#52636c]">{message}</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="button" disabled={busy} onClick={onConfirm} className={`rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${destructive ? "bg-red-700" : "bg-[#116966]"}`}>{confirmLabel}</button></div></div></div>;
}
