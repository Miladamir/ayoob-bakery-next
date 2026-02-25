import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // Check if user is logged in AND is an admin
    // This layout now only applies to pages inside (dashboard), so it won't run on /admin/login
    if (!session || (session.user as any)?.role !== 'admin') {
        redirect('/admin/login');
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-grow p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}