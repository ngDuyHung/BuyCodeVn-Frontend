"use client";

import type { ReactNode } from "react";
import { can, type AdminPermission } from "@/lib/admin-permissions";
import { useAuthStore } from "@/stores/authStore";
import AdminForbidden from "./AdminForbidden";

export default function AdminPermissionGate({ permission, children }: { permission: AdminPermission; children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return can(user, permission) ? children : <AdminForbidden />;
}
