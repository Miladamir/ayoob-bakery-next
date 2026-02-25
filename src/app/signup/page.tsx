"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const errData = await res.json();
                setError(errData.message || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Side: Form (Visible 2nd on Mobile, 1st on Desktop) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white order-2 md:order-1">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-gray-400">Join the family for fresh deals</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                className="input-field w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:bg-white transition-all"
                                placeholder="Repeat password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 mt-4"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="text-gray-300 text-xs uppercase tracking-widest">or</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Sign up with Google
                    </button>

                    <p className="text-center mt-8 text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-brand-600 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Branding (Visible 1st on Mobile, 2nd on Desktop) */}
            <div className="hidden md:flex md:w-1/2 bg-brand-900 relative overflow-hidden order-1 md:order-2">
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
                    alt="Background"
                />

                {/* Content Overlay */}
                <div className="relative z-20 flex flex-col justify-center p-12 text-white">
                    <h1 className="font-serif text-5xl font-bold leading-tight mb-6">
                        Start Your<br /> Journey Today
                    </h1>
                    <p className="text-brand-200 text-lg max-w-md leading-relaxed">
                        Join our community to access exclusive recipes, early bird discounts on seasonal pastries, and faster checkout.
                    </p>
                </div>
            </div>
        </div>
    );
}