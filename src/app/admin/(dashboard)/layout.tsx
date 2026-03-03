"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect if not admin
    if (status === "unauthenticated") {
        redirect('/admin/login');
    }

    // Note: Role check is done in middleware, but double check here if needed
    // For now we assume middleware protects the route.

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Control visibility via props or internal logic */}
            {/* We assume AdminSidebar handles desktop visibility. We wrap it to control mobile. */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full">

                {/* Mobile Top Header */}
                <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <h1 className="font-bold font-serif text-gray-800">Admin Panel</h1>
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow p-4 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}