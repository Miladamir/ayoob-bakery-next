"use client";

import { useEffect, useRef, useState } from "react";
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
import { useToast } from "@/context/ToastContext";
import { copyText } from "@/lib/clipboard";
import { getDetailedStatus, getStatus } from "@/lib/hours";
import type { DetailedStatus } from "@/lib/hours";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";

const MAPS_URL = "https://maps.google.com/?q=312+Lygon+Street+Brunswick+Melbourne";

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

/* masthead pill — live open/closed, computed after mount */
function StatusPill() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const upd = () => setStatus(getStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, []);
  if (!status) return null;
  return (
    <div className={`status-pill${status.open ? "" : " closed"}`}>
      <span className="pulse" />
      <span className="st-text">{status.text}</span>
    </div>
  );
}

/* the phone line — "Answering now · until 4:00 pm" / "Voicemail · we're back Mon 6:30 am" */
function PhoneStatus() {
  const [st, setSt] = useState<DetailedStatus | null>(null);
  useEffect(() => {
    const upd = () => setSt(getDetailedStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className={`ps${st && !st.open ? " closed" : ""}`}>
      <span className="ps-dot" />
      <span>
        {st
          ? st.open
            ? `Answering now · until ${st.closesAt}`
            : st.backAt
              ? `Voicemail · we\u2019re back ${st.backAt}`
              : "Voicemail"
          : "Checking the oven clock\u2026"}
      </span>
    </span>
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
            <StatusPill />
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
                  <textPath href="#stampPathContact">AYOOB BAKERY · BRUNSWICK · MELBOURNE · EST 1996 ·</textPath>
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
                    <PhoneStatus />
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
                      312 Lygon Street, Brunswick VIC 3056
                    </a>
                    <span className="crow-sub">The fogged window on the left — the queue moves fast.</span>
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
                <HoursCard showStatus />
              </div>
            </div>

            {/* right: the map */}
            <div className="map-col" data-reveal style={d(".1s")}>
              <div className="map-card">
                <svg
                  className="map-svg"
                  viewBox="0 0 560 400"
                  role="img"
                  aria-label="Illustrated map — Ayoob Bakery, 312 Lygon Street Brunswick"
                >
                  <rect width="560" height="400" rx="20" fill="#EFE6D2" />
                  <g stroke="#26180E" opacity=".1" strokeWidth="16" fill="none" strokeLinecap="round">
                    <path d="M150 -10 L166 410" /><path d="M310 -10 L296 410" />
                    <path d="M-10 190 H570" /><path d="M-10 330 H570" strokeWidth="10" />
                  </g>
                  <g stroke="#26180E" opacity=".22" strokeWidth="1.5" fill="none" strokeDasharray="10 12">
                    <path d="M150 -10 L166 410" /><path d="M310 -10 L296 410" />
                    <path d="M-10 190 H570" /><path d="M-10 330 H570" />
                  </g>
                  <rect x="360" y="222" width="150" height="86" rx="12" fill="#7C8B4F" opacity=".2" />
                  <text x="435" y="270" className="map-label" textAnchor="middle">PARK</text>
                  <path
                    className="route"
                    d="M545 415 C480 350 460 320 402 262 S318 200 302 186"
                    fill="none" stroke="#C4551E" strokeWidth="3"
                    strokeDasharray="7 9" strokeLinecap="round"
                  />
                  <rect x="404" y="246" width="14" height="14" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
                  <text x="427" y="258" className="map-label">STOP 22</text>
                  <text x="322" y="62" className="map-label" transform="rotate(-2 322 62)">LYGON ST</text>
                  <text x="96" y="122" className="map-label" transform="rotate(3 96 122)">SYDNEY RD</text>
                  <text x="96" y="178" className="map-label">BRUNSWICK RD</text>
                  <g transform="translate(296 176)">
                    <circle className="pin-ring" r="20" fill="none" stroke="#C4551E" strokeWidth="2" />
                    <circle r="11" fill="#C4551E" stroke="#FFFDF6" strokeWidth="3" />
                    <circle r="3.5" fill="#FFFDF6" />
                  </g>
                  <g transform="translate(296 108)">
                    <rect x="-92" y="-22" width="184" height="40" rx="10" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                    <text y="4" textAnchor="middle" className="map-chip-t">AYOOB BAKERY</text>
                  </g>
                  <text x="296" y="152" className="map-sub" textAnchor="middle">312 Lygon St</text>
                  <g transform="translate(516 46)" stroke="#26180E" fill="none" strokeWidth="2">
                    <circle r="16" />
                    <path d="M0 -9 l5 12 -5 -3 -5 3z" fill="#26180E" stroke="none" />
                  </g>
                </svg>
              </div>

              <p className="map-note">
                <MapPin />
                Tram 19 to stop 22 · a six-minute wander from Brunswick station · 1–2P parking on
                Albert &amp; Hope · wish you were here.
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