"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password.");
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans text-gray-700 bg-brand-900 min-h-screen flex items-center justify-center">

            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-600"></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 text-brand-800 mb-4">
                        <i className="fa-solid fa-wheat-awn text-3xl text-brand-600"></i>
                        <span className="font-serif text-2xl font-bold">Ayoob Bakery</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-gray-800">Admin Portal</h2>
                    <p className="text-gray-400 text-sm mt-1">Authorized personnel only</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Admin Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@ayoobbakery.com"
                            required
                            className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            required
                            className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:bg-white transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-800 text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-900 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <>
                                <i className="fa-solid fa-lock"></i> Secure Login
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <Link href="/" className="hover:text-brand-600">
                        <i className="fa-solid fa-arrow-left mr-1"></i> Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}