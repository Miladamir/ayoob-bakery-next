"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Heart, HeartOff, Plus, Wheat } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { money, stripHtml } from "@/lib/format";
import { flyToCart } from "@/lib/flyToCart";
import type { IProduct } from "@/models/Product";

interface ProductCardProps {
  product: IProduct;
  /** stagger index for the entrance animation */
  index?: number;
  /** When provided, unhearting is delegated to the parent (the wishlist page
      uses this for its undo toast + exit animation). Default: internal toggle. */
  onUnheart?: (productId: string) => void;
  /** Renders the card in its exit-animation state (pairs with onUnheart). */
  exiting?: boolean;
}

/** badge → tag tone (ember / ink / sage), matching the template's tag variants */
const TONES: Record<string, string> = {
  Bestseller: "",
  New: "sage",
  Popular: "ink",
  Featured: "ink",
};

const UNITS: Record<string, string> = {
  quantity: "each",
  kg: "per kg",
  lb: "per lb",
};

export default function ProductCard({
  product,
  index = 0,
  onUnheart,
  exiting = false,
}: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const id = product._id.toString();
  const cardRef = useRef<HTMLElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const [flick, setFlick] = useState(false);

  const discount = product.discount ?? 0;
  const hasDiscount = discount > 0;
  const price = hasDiscount ? product.price * (1 - discount / 100) : product.price;

  const isFav = isInWishlist(id);
  const inCart = cartItems.some((i) => i._id === id);

  const unit = UNITS[product.unit] ?? "each";
  const desc = (product.shortDescription || stripHtml(product.description || "")).slice(0, 110);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);

    // fly the little thumbnail to the cart icon
    flyToCart(addRef.current, product.images?.[0]);

    // boing the illustration
    const ill = cardRef.current?.querySelector(".pc-ill");
    if (ill && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ill.classList.remove("boing");
      void (ill as HTMLElement).offsetWidth;
      ill.classList.add("boing");
    }

    setFlick(true);
    window.setTimeout(() => setFlick(false), 900);
    toast(Check, "Added to cart", `${product.name} — ${money(price)}`);
  };

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // the wishlist page takes over unhearting (undo + exit animation)
    if (isFav && onUnheart) {
      onUnheart(id);
      return;
    }
    const willBeFav = !isFav;
    await toggleWishlist(id);
    toast(
      willBeFav ? Heart : HeartOff,
      willBeFav ? "Saved to favourites" : "Removed from favourites",
      willBeFav
        ? `${product.name} — we'll keep it warm for you.`
        : `${product.name} is off the list.`
    );
  };

  return (
    <article
      className={`pc${exiting ? " out" : ""}`}
      ref={cardRef}
      style={{ "--d": `${index * 55}ms` } as React.CSSProperties}
    >
      {/* ---- art plate ---- */}
      <div className="pc-art">
        <Link href={`/product/${id}`} className="pc-art-link" aria-label={product.name}>
          <span className="pc-ring" aria-hidden="true" />
          <span className="pc-ill">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 560px) 88vw, (max-width: 1024px) 45vw, 300px"
                className="pc-img"
              />
            ) : (
              <Wheat className="pc-noimg" aria-hidden="true" />
            )}
          </span>
        </Link>

        {(product.badge || hasDiscount) && (
          <span className="pc-tags">
            {product.badge && (
              <span className={`pc-tag${TONES[product.badge] ? ` pc-tag--${TONES[product.badge]}` : ""}`}>
                {product.badge}
              </span>
            )}
            {hasDiscount && (
              <span className="pc-tag pc-tag--ink">−{Math.round(discount)}%</span>
            )}
          </span>
        )}

        <button
          type="button"
          key={String(isFav)}
          className={`pc-heart${isFav ? " on" : ""}`}
          onClick={handleFav}
          aria-pressed={isFav}
          aria-label={
            isFav
              ? `Remove ${product.name} from favourites`
              : `Save ${product.name} to favourites`
          }
        >
          <Heart />
        </button>
      </div>

      {/* ---- body ---- */}
      <div className="pc-body">
        <h3 className="pc-name">
          <Link href={`/product/${id}`}>{product.name}</Link>
        </h3>
        {desc && <p className="pc-desc">{desc}</p>}

        <div className="pc-foot">
          <p className="pc-price">
            <b>{money(price)}</b>
            <span>
              {unit}
              {hasDiscount ? ` · was ${money(product.price)}` : ""}
            </span>
          </p>

          <button
            ref={addRef}
            type="button"
            className={`pc-add${flick || inCart ? " done" : ""}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to the cart`}
          >
            <Plus />
            <Check />
          </button>
        </div>
      </div>
    </article>
  );
}