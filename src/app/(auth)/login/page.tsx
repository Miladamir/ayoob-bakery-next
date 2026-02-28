"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
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
                redirect: false, // Handle redirect manually
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/"); // or router.back()
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Side: Branding (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 bg-brand-900 relative overflow-hidden">
                {/* ... Same content as views/login.ejs Left Side ... */}
                <img src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" alt="Background" />
                <div className="relative z-20 flex flex-col justify-center p-12 text-white">
                    <h1 className="font-serif text-5xl font-bold leading-tight mb-6">Welcome Back to<br /> the Family</h1>
                    <p className="text-brand-200 text-lg max-w-md leading-relaxed">
                        Sign in to track your orders, save your favorite artisan loaves, and enjoy exclusive member discounts.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-800 mb-2">Sign In</h2>
                        <p className="text-gray-400">Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Social Login */}
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm mb-6"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="text-gray-300 text-xs uppercase tracking-widest">or</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    {/* Credentials Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                            <input type="email" name="email" required className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
                            <input type="password" name="password" required className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50">
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-gray-500">
                        {/* Fix: Changed </a> to </Link> */}
                        Don't have an account? <Link href="/signup" className="text-brand-600 font-bold hover:underline">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}