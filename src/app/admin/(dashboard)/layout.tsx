import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import FontAwesome from "@/components/legacy/FontAwesome";

/* Server-side gate — replaces the middleware for /admin.
   Checks BOTH authentication and the admin role, on every request. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <>
      {/* PHASE 5: FA loads here (and only here) for the whole admin area */}
      <FontAwesome />
      <AdminShell>{children}</AdminShell>
    </>
  );
}