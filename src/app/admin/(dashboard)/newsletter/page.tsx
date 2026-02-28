"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewsletterSendPage() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to send this email to ALL subscribers?")) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/admin/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, content }),
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, count: data.count });
                setSubject("");
                setContent("");
            } else {
                setResult({ success: false, error: data.error });
            }
        } catch (err) {
            setResult({ success: false, error: "Network error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif text-gray-800">Send Newsletter</h1>
                <Link href="/admin" className="text-brand-600 hover:underline text-sm">&larr; Back to Dashboard</Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. This Week's Specials!"
                            className="w-full border p-2 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Content (HTML supported)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            placeholder="Write your message here..."
                            className="w-full border p-2 rounded-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !subject || !content}
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send to All Subscribers"}
                    </button>
                </form>

                {result && (
                    <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {result.success ? `Successfully sent email to ${result.count} subscribers!` : `Error: ${result.error}`}
                    </div>
                )}
            </div>
        </div>
    );
}