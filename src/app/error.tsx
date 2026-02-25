"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 p-6">
            <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md border border-gray-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
                </div>
                <h2 className="font-serif text-3xl font-bold text-gray-800 mb-3">Something went wrong!</h2>
                <p className="text-gray-500 mb-8">We encountered an unexpected error. Please try again.</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <Link href="/" className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}