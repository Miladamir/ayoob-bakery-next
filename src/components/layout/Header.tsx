"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import CartModal from "@/components/cart/CartModal";

/**
 * Primary navigation — ported from the approved home-page template.
 * Sticky (never hides), glass-blur once scrolled, full-screen mobile
 * menu with staggered links. The template's 6th link slot
 * ("About Pages") is wired to the blog — swap it here if needed.
 */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/menu", label: "Menu" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blogs", label: "Blog" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/blogs") return pathname.startsWith("/blogs") || pathname.startsWith("/blog/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // scrolled state (glass background)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // body lock while the mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  // Escape closes the menu; resizing to desktop closes it too
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1000) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const profileHref = session ? "/profile" : "/login";
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ============ NAV (sticky, never hides) ============ */}
      <header id="nav" className={scrolled ? "scrolled" : undefined}>
        <div className="nav-in wrap">
          <Link href="/" className="brand" aria-label="Ayoob Bakery — back to top" onClick={closeMenu}>
            <span className="brand-mark">
              <Image
                src="/images/logo.png"
                alt="Ayoob Bakery"
                width={46}
                height={46}
                priority
                className="brand-logo"
              />
            </span>
            <span className="brand-text">
              <b>AYOOB</b>
              <small>Bakery · Melbourne</small>
            </span>
          </Link>

          {/* site pages */}
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(pathname, l.href) ? "active" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          
          {/* icon actions — desktop only (text entries live in the mobile menu) */}
          <div className="nav-icons">
            <Link href="/search" className="nav-ic" aria-label="Search" title="Search">
              <Search />
            </Link>

            <Link
              href="/wishlist"
              className="nav-ic"
              id="icoFav"
              aria-label={`Favourites (${wishlistIds.length})`}
            >
              <Heart />
              <NavBadge count={wishlistIds.length} />
            </Link>

            <button
              type="button"
              className="nav-ic"
              id="icoCart"
              onClick={() => setCartOpen(true)}
              aria-label={`Your cart (${cartCount} items)`}
            >
              <ShoppingCart />
              <NavBadge count={cartCount} />
            </button>

            <Link
              href={profileHref}
              className="nav-ic"
              aria-label={session ? "Profile" : "Log in"}
            >
              <User />
            </Link>
          </div>

          <button
            type="button"
            className="burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ============ MOBILE MENU ============ */}
      <nav className="mm" aria-label="Mobile">
        <div>
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="mm-link"
              style={{ "--i": i } as React.CSSProperties}
              onClick={closeMenu}
            >
              <span className="no">{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mm-bottom">
          {/* the desktop icon actions, as text */}
          <div className="mm-actions">
            <Link href="/search" className="mm-action" onClick={closeMenu}>
              <Search />
              Search
            </Link>
            <Link href="/wishlist" className="mm-action" onClick={closeMenu}>
              <Heart />
              Favourites
              {wishlistIds.length > 0 && (
                <span className="mm-count">{wishlistIds.length}</span>
              )}
            </Link>
            <button
              type="button"
              className="mm-action"
              onClick={() => {
                closeMenu();
                window.setTimeout(() => setCartOpen(true), 150);
              }}
            >
              <ShoppingCart />
              Cart
              {cartCount > 0 && <span className="mm-count">{cartCount}</span>}
            </button>
            <Link href={profileHref} className="mm-action" onClick={closeMenu}>
              <User />
              {session ? "Profile" : "Log in"}
            </Link>
          </div>
          <div className="mm-foot">
            <a href="tel:+61473621594">0473 621 594</a>
            <span>4 Stevenson Ave · Dandenong Nth</span>
          </div>
        </div>
      </nav>

      {/* ============ CART MODAL ============ */}
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

/** Cart / wishlist pill — replays the bump animation whenever the count changes */
function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span key={count} className="nav-badge bump">
      {count}
    </span>
  );
}