"use client";

import { useState } from "react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-brand-50 p-6 rounded-xl text-center">
                <i className="fa-solid fa-circle-check text-4xl text-brand-600 mb-3"></i>
                <h4 className="font-bold text-gray-800 text-lg">You're on the list!</h4>
                <p className="text-gray-600 text-sm mt-1">Thanks for subscribing to our newsletter.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-brand-500 w-full"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
            >
                {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}
        </form>
    );
}