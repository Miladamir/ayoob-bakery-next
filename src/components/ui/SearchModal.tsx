"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setQuery("");
            setSuggestions([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/search/suggest?q=${query}`);
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Search error", error);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onClick={onClose}>
            <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Search Products</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full py-5 px-6 text-xl text-gray-800 focus:outline-none"
                        placeholder="Search for breads, pastries..."
                        autoComplete="off"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-600">
                        <i className="fa-solid fa-search text-xl"></i>
                    </button>
                </form>

                <div className="border-t border-gray-100 max-h-96 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map((name, i) => (
                            <button
                                key={i}
                                onClick={() => { router.push(`/search?q=${encodeURIComponent(name)}`); onClose(); }}
                                className="block w-full text-left px-6 py-3 hover:bg-brand-50 text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <i className="fa-solid fa-search text-gray-300 mr-3 text-sm"></i> {name}
                            </button>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">No products found.</div>
                    ) : (
                        <div className="p-6 text-center text-gray-400 text-sm">Type to search...</div>
                    )}
                </div>
            </div>
        </div>
    );
}