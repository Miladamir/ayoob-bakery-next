"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import HoursCard from "@/components/home/HoursCard";
import MapCard from "@/components/ui/MapCard";
import { useToast } from "@/context/ToastContext";
import { copyText } from "@/lib/clipboard";
import { MAPS_URL, SHOP_ADDRESS } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";

function SparkSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}

export default function Contact() {
  const toast = useToast();
  const mastheadRef = useRef<HTMLElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);

  /* masthead stamp parallax (fine pointers, motion-safe) */
  useEffect(() => {
    const mast = mastheadRef.current;
    const stamp = stampRef.current;
    if (!mast || !stamp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let nx = 0, ny = 0, x = 0, y = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      x += (nx * 12 - x) * 0.07;
      y += (ny * 12 - y) * 0.07;
      stamp.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      raf = requestAnimationFrame(tick);
    };
    mast.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      mast.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onSocial = async (handle: string) => {
    const ok = await copyText(handle);
    if (ok) toast(Check, "Handle copied", `Find us as ${handle} — we reshare the good ones.`);
    else toast(X, "Copy failed", "Give it one more try.");
  };

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ COMPACT MASTHEAD ============ */}
      <section id="hero" className="masthead" ref={mastheadRef}>
        <div className="wrap">
          <div className="mh-top">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="lucide" />
              <span aria-current="page">Contact</span>
            </nav>
            {/* the open/closed status pill is removed on this page (item 9) */}
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title">
              Talk to <em>the counter.</em>
              <span className="mh-spark" aria-hidden="true"><SparkSvg /></span>
            </h1>

            <span className="mh-stamp" ref={stampRef} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathContact" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathContact">AYOOB BAKERY · DANDENONG NORTH · MELBOURNE · EST 1996 ·</textPath>
                </text>
                <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M60 46v30" />
                  <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                </g>
              </svg>
            </span>
          </div>

          <p className="mh-sub" data-reveal>
            Phone beats email, email beats carrier pigeon — either way, the counter answers fast.
          </p>
        </div>
      </section>

      {/* ============ THE COUNTER ============ */}
      <section id="counter" className="counter-sec">
        <div className="wrap">
          <div className="contact-grid">
            {/* left: the details */}
            <div className="left-col">
              <div className="counter-card" data-reveal aria-label="Contact details">
                <div className="cc-head">
                  <h2>The counter</h2>
                  <span className="cc-no">no. 0312</span>
                </div>

                <div className="crow">
                  <span className="cr-ico"><Phone /></span>
                  <div className="crow-main">
                    <small>Call the counter</small>
                    <a className="crow-link" href="tel:+61393872196">(03) 9387 2196</a>
                    <span className="crow-sub">Fastest — orders, holds, and bread emergencies.</span>
                  </div>
                </div>

                <div className="crow">
                  <span className="cr-ico"><Mail /></span>
                  <div className="crow-main">
                    <small>Email us</small>
                    <a className="crow-link" href="mailto:hello@ayoobbakery.com.au">hello@ayoobbakery.com.au</a>
                    <span className="crow-sub">Replies within one business day — usually faster.</span>
                  </div>
                </div>

                <div className="crow">
                  <span className="cr-ico"><ChefHat /></span>
                  <div className="crow-main">
                    <small>Catering &amp; wholesale</small>
                    <a className="crow-link" href="mailto:catering@ayoobbakery.com.au">catering@ayoobbakery.com.au</a>
                    <span className="crow-sub">Big orders, events, cafés — 48 hours notice, please.</span>
                  </div>
                </div>

                <div className="crow">
                  <span className="cr-ico"><MapPin /></span>
                  <div className="crow-main">
                    <small>The shopfront</small>
                    <a className="crow-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                      {SHOP_ADDRESS}
                    </a>
                    <span className="crow-sub">Look for the flour in the window — you can't miss us.</span>
                  </div>
                </div>

                <div className="cc-foot">
                  <span className="cc-foot-k">Find us online</span>
                  <div className="csocs">
                    <button className="csoc" type="button" onClick={() => onSocial("@ayoobbakery")}>
                      <InstagramIcon /> @ayoobbakery
                    </button>
                    <button className="csoc" type="button" onClick={() => onSocial("Ayoob Bakery Melbourne")}>
                      <FacebookIcon /> Facebook
                    </button>
                  </div>
                </div>
              </div>

              <div data-reveal style={d(".08s")}>
                <HoursCard />
              </div>
            </div>

            {/* right: the map — tappable, opens Google Maps */}
            <div className="map-col" data-reveal data-autopause style={d(".1s")}>
              <MapCard />

              <p className="map-note">
                <MapPin />
                Street parking out front — the smell finds you before the signage does.
              </p>

              <div className="door-ctas">
                <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Get directions <ArrowUpRight />
                </a>
                <a className="btn btn-ghost" href="tel:+61393872196">Call the counter</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}