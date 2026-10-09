import type { ReactNode } from "react";
import type { UserResponse } from "@orgatick/contracts";
import serverApi from "@/lib/apis/server-auth-api";
import { AdminShell } from "@/components/sidebar/admin-shell";
import { RestrictedAccess } from "@/components/restricted-access";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const api = await serverApi();
  let user: UserResponse | null = null;
  try {
    const response = await api.get("/users/me");
    const raw = response?.data?.data ?? response?.data?.user ?? response?.data;
    user = raw && typeof raw === "object" && "id" in raw ? (raw as UserResponse) : null;
  } catch {
    user = null;
  }

  if (user?.role !== "admin") {
    return <RestrictedAccess />;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
