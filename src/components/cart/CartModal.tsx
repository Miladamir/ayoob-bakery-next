"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBasket, X } from "lucide-react";
import { useCart, cartLineKey } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { money } from "@/lib/format";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
  const { cartItems, cartTotal, updateQuantity, removeItem, clearCart } = useCart();

  const [render, setRender] = useState(false);
  const [vis, setVis] = useState(false);
  const xBtnRef = useRef<HTMLButtonElement>(null);

  // mount → animate in / animate out → unmount (matches the template)
  useEffect(() => {
    if (open) {
      setRender(true);
      const r = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVis(true))
      );
      return () => cancelAnimationFrame(r);
    }
    setVis(false);
    const t = window.setTimeout(() => setRender(false), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  // lock body scroll while open
  useEffect(() => {
    document.body.classList.toggle("locked", open);
    return () => document.body.classList.remove("locked");
  }, [open]);

  // Escape to close + focus the close button on open (a11y)
  useEffect(() => {
    if (!open) return;
    xBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!render) return null;

  const empty = cartItems.length === 0;

  const dec = (item: CartItem) =>
    item.quantity <= 1
      ? removeItem(item._id, item.variant)
      : updateQuantity(item._id, item.quantity - 1, item.variant);

  return (
    <div
      className={`modal${vis ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmTitle"
    >
      <div className="modal-bg" onClick={onClose} />

      <div className="modal-panel">
        <div className="modal-head">
          <h3 id="cmTitle">Your cart</h3>
          <button
            ref={xBtnRef}
            type="button"
            className="modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {empty ? (
          <div className="cm-empty">
            <ShoppingBasket />
            <p>Nothing here yet — add something warm from the counter.</p>
            <Link href="/products" className="btn btn-ghost btn-sm" onClick={onClose}>
              Browse the counter
            </Link>
          </div>
        ) : (
          <>
            <ul className="cm-list">
              {cartItems.map((item) => (
                <li key={cartLineKey(item)}>
                  <span className="bm-ico">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt=""
                        width={42}
                        height={42}
                        className="bm-img"
                      />
                    ) : (
                      <ShoppingBasket />
                    )}
                  </span>
                  <span className="bm-name">
                    <b>{item.name}{item.variant ? ` · ${item.variant}` : ""}</b>
                  </span>
                  <span className="cm-qty">
                    <button type="button" className="q-ctl" onClick={() => dec(item)} aria-label={`Remove one ${item.name}`}>
                      <Minus />
                    </button>
                    <b>{item.quantity}</b>
                    <button
                      type="button"
                      className="q-ctl"
                      onClick={() => updateQuantity(item._id, item.quantity + 1, item.variant)}
                      disabled={item.quantity >= 99}
                      aria-label={`Add one more ${item.name}`}
                    >
                      <Plus />
                    </button>
                  </span>
                  <span className="bm-price">{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="bm-tot">
              <div className="bt-row">
                <span>Subtotal</span>
                <b>{money(cartTotal)}</b>
              </div>
              <div className="bt-row bt-final">
                <span>Total</span>
                <b>{money(cartTotal)}</b>
              </div>
            </div>

            <div className="bm-actions">
              {/* PHASE 9: /checkout doesn't exist (404'd) — the real order
                  flow is the cart page's call-to-order. A true checkout
                  page remains a future feature (flagged). */}
              <Link className="btn btn-primary" href="/cart" onClick={onClose}>
                Review your order
              </Link>
              <Link className="btn btn-ghost" href="/cart" onClick={onClose}>
                View cart
              </Link>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Keep browsing
              </button>
            </div>

            <button type="button" className="bt-clear" onClick={() => clearCart()}>
              empty the cart
            </button>
            <p className="bm-note">
              Pick-up only · 4 Stevenson Ave, Dandenong North · ready in about 20 minutes — we&rsquo;ll
              confirm on the phone.
            </p>
          </>
        )}
      </div>
    </div>
  );
}