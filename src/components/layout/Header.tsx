"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { NestedCategory } from "@/lib/data";

interface HeaderProps {
    nestedCategories: NestedCategory[];
}

export default function Header({ nestedCategories }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const { wishlistIds } = useWishlist();

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close search on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus search input when modal opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Search Autocomplete Logic
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
    };

    return (
        <>
            {/* NAVIGATION HEADER */}
            <nav
                id="navbar"
                className={`fixed w-full z-50 transition-all duration-500 py-2 ${isScrolled
                        ? "bg-white shadow-lg py-1 text-gray-800"
                        : "text-white"
                    }`}
            >
                {/* Main Flex Container: w-full ensures it spans edge to edge. 
                    px-4 or px-6 adds slight breathing room from screen edges. */}
                <div className="w-full px-6 flex justify-between items-center">

                    {/* LEFT SIDE: LOGO & TITLE */}
                    <Link href="/" className="flex items-center gap-4 group z-10" id="main-logo">
                        <div className="w-14 h-14 md:w-16 md:h-16 relative flex-shrink-0 flex items-center justify-center">
                            <img
                                src="/images/logo.png"
                                alt="Ayoob Bakery Australia Logo"
                                className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className={`flex flex-col justify-center border-l pl-4 transition-colors ${isScrolled ? 'border-gray-200' : 'border-white/30'}`}>
                            <span className={`font-serif text-3xl md:text-4xl font-bold tracking-tight leading-none ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                                Ayoob Bakery
                            </span>
                            <span className={`font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-semibold mt-1 ${isScrolled ? 'text-brand-600' : 'text-brand-300'}`}>
                                Australia
                            </span>
                        </div>
                    </Link>

                    {/* RIGHT SIDE: LINKS & ICONS */}
                    {/* This div groups all navigation items together and pushes them to the right as one block */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {[
                            { href: "/", label: "Home" },
                            { href: "/products", label: "Shop" },
                            { href: "/categories", label: "Categories" },
                            { href: "/about", label: "About" },
                            { href: "/blogs", label: "Blog" },
                            { href: "/contact", label: "Contact" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:text-brand-500 transition-colors uppercase text-sm tracking-widest font-semibold relative group nav-link-hover"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Utility Icons - Grouped tightly at the far right */}
                        <div className="flex items-center gap-4 pl-8 border-l border-white/20">
                            <button onClick={openSearch} className="relative hover:text-brand-500 transition-colors focus:outline-none">
                                <i className="fa-solid fa-magnifying-glass text-lg"></i>
                            </button>

                            <Link href="/wishlist" className="relative hover:text-brand-500 transition-colors">
                                <i className="fa-solid fa-heart text-lg"></i>
                                {wishlistIds.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {wishlistIds.length}
                                    </span>
                                )}
                            </Link>

                            <Link href="/cart" className="relative hover:text-brand-500 transition-colors p-2 border border-transparent hover:border-brand-500 rounded-full">
                                <i className="fa-solid fa-shopping-bag text-xl"></i>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {session ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/profile" className="hover:text-brand-500 transition-colors">
                                        <i className="fa-solid fa-user text-lg"></i>
                                    </Link>
                                    <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-brand-500 transition-colors">
                                        <i className="fa-solid fa-sign-out-alt text-lg"></i>
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="hover:text-brand-500 transition-colors">
                                    <i className="fa-solid fa-user text-lg"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4 z-10">
                        <button onClick={openSearch} className="focus:outline-none">
                            <i className="fa-solid fa-magnifying-glass text-xl"></i>
                        </button>
                        <button
                            onClick={toggleMobileMenu}
                            className="focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Open Menu"
                        >
                            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-3xl`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div
                    id="mobile-menu"
                    className={`lg:hidden absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl border-t border-gray-100 ${isMobileMenuOpen ? 'open' : ''}`}
                >
                    {/* ... Mobile Menu Content ... */}
                    <div className="flex flex-col py-4 px-6">
                        {[
                            { href: "/", label: "Home", icon: "fa-home" },
                            { href: "/products", label: "All Products", icon: "fa-store" },
                            { href: "/categories", label: "Categories", icon: "fa-tags" },
                            { href: "/about", label: "About Us", icon: "fa-info-circle" },
                            { href: "/blogs", label: "Blog", icon: "fa-newspaper" },
                            { href: "/contact", label: "Contact", icon: "fa-envelope" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-3 hover:bg-brand-50 border-b border-gray-100 font-semibold text-gray-700 flex justify-between items-center"
                            >
                                {link.label} <i className={`fas ${link.icon} text-brand-500`}></i>
                            </Link>
                        ))}

                        <div className="mt-6 px-4 space-y-3">
                            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-3 rounded-full font-bold shadow-md">
                                <i className="fa-solid fa-shopping-bag"></i> View Cart
                            </Link>
                            {session ? (
                                <>
                                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 border border-brand-500 text-brand-500 py-3 rounded-full font-bold hover:bg-brand-50">
                                        <i className="fa-solid fa-user"></i> My Profile
                                    </Link>
                                    <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 text-gray-500 py-2 text-sm">
                                        <i className="fa-solid fa-sign-out-alt"></i> Logout
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 border border-brand-500 text-brand-500 py-3 rounded-full font-bold hover:bg-brand-50">
                                    <i className="fa-solid fa-sign-in-alt"></i> Login / Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* SEARCH MODAL */}
            <div
                id="searchModal"
                onClick={closeSearch}
                className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 ${isSearchOpen ? 'visible' : 'hidden'}`}
            >
                <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Search Products</h3>
                        <button onClick={closeSearch} className="text-gray-400 hover:text-gray-600 text-xl">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-5 px-6 text-xl text-gray-800 focus:outline-none"
                            placeholder="Search for breads, pastries..."
                            autoComplete="off"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-600">
                            <i className="fa-solid fa-search text-xl"></i>
                        </button>
                    </div>

                    <div className="border-t border-gray-100 max-h-96 overflow-y-auto">
                        {searchQuery.length < 2 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">Type at least 2 characters...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((name, idx) => (
                                <Link
                                    key={idx}
                                    href={`/search?q=${encodeURIComponent(name)}`}
                                    onClick={closeSearch}
                                    className="block px-6 py-3 hover:bg-brand-50 text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <i className="fa-solid fa-search text-gray-300 mr-3 text-sm"></i> {name}
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-sm">No products found.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}