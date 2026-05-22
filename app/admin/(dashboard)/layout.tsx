import AdminShell from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/features/admin/data/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
