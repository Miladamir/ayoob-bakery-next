"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    // We keep this loading state for UX, but Middleware handles the auth check.
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-50">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">My Profile</h1>
                    <p className="text-brand-200 text-lg">Manage your account and orders.</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar Navigation */}
                        <aside className="lg:w-1/4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">

                                {/* User Header */}
                                <div className="p-6 bg-brand-50 border-b border-gray-100 text-center">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold font-serif mb-3 shadow-lg">
                                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-gray-800">{session?.user?.name || 'User'}</h3>
                                    <p className="text-sm text-gray-400">{session?.user?.email}</p>
                                </div>

                                {/* Navigation Links */}
                                <nav className="p-4 space-y-1">
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === "profile" ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        <i className="fa-solid fa-user w-5"></i> My Profile
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("orders")}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === "orders" ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        <i className="fa-solid fa-bag-shopping w-5"></i> My Orders
                                    </button>

                                    <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">
                                        <i className="fa-solid fa-heart w-5"></i> Favorites
                                    </Link>

                                    <div className="border-t border-gray-100 my-3"></div>

                                    <button
                                        onClick={() => router.push('/api/auth/signout')}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <i className="fa-solid fa-right-from-bracket w-5"></i> Logout
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="lg:w-3/4 space-y-8">

                            {/* Profile Content Pane */}
                            {activeTab === "profile" && (
                                <div>
                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <Link href="/cart" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-200 transition-all group flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                <i className="fa-solid fa-shopping-cart text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">My Cart</h4>
                                                <p className="text-sm text-gray-400">View items</p>
                                            </div>
                                            <i className="fa-solid fa-arrow-right ml-auto text-gray-300 group-hover:text-brand-500 transition-colors"></i>
                                        </Link>
                                    </div>

                                    {/* Profile Details Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                            <h2 className="font-serif text-2xl font-bold text-gray-800">Profile Details</h2>
                                            <button className="text-brand-600 font-semibold text-sm hover:underline">Edit Profile</button>
                                        </div>
                                        <div className="p-6 grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-1">Full Name</label>
                                                    <p className="text-gray-800 font-medium text-lg">{session?.user?.name || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-1">Email Address</label>
                                                    <p className="text-gray-800 font-medium text-lg">{session?.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-1">Phone Number</label>
                                                    <p className="text-gray-800 font-medium text-lg">Not provided</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-1">Member Since</label>
                                                    <p className="text-gray-800 font-medium text-lg">N/A</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Orders Content Pane */}
                            {activeTab === "orders" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="font-serif text-2xl font-bold text-gray-800">Order History</h2>
                                    </div>
                                    <div className="p-6 text-center text-gray-400">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-solid fa-box-open text-3xl text-gray-300"></i>
                                        </div>
                                        <p>You have no past orders.</p>
                                    </div>
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </section>
        </>
    );
}